import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
// Sanity adapter removed; using direct sanity client where needed
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import axios from 'axios';

import sanityClient from './sanity';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password, token } = credentials as { email?: string; password?: string; token?: string };
        if (!email) {
          return null;
        }

        try {
          // Check if user exists in Sanity
          const user = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email }
          );

          if (!user) {
            return null;
          }

          if (token) {
            const tokenParams: Record<string, string> = { email, token };
            const tokenDoc = await sanityClient.fetch(
              `*[_type == "verification-token" && identifier == $email && token == $token][0]`,
              tokenParams
            );

            if (!tokenDoc || !tokenDoc.expires || new Date(tokenDoc.expires).getTime() < Date.now()) {
              return null;
            }

            if (!user.emailVerified) {
              await sanityClient.patch(user._id).set({ emailVerified: new Date().toISOString() }).commit();
            }

            if (tokenDoc._id) {
              await sanityClient.delete(tokenDoc._id);
            }

            return {
              id: user._id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          }

          if (!password) {
            return null;
          }

          if (!user.password) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            return null;
          }

          if (!user.emailVerified) {
            throw new Error('Please confirm your email before signing in.');
          }

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  // If you want an adapter later, re-add and configure here
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create user in Sanity if signing in with OAuth
      if (account?.provider !== 'credentials' && user.email) {
        try {
          const existingUser = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: user.email }
          );

          if (!existingUser) {
            let imageToSave = undefined;

            try {
              // If the provider gave a string URL (e.g., Google avatar), fetch and upload it to Sanity
              if (user.image && typeof user.image === 'string') {
                const resp = await axios.get(user.image, { responseType: 'arraybuffer', timeout: 15000 });
                const buffer = Buffer.from(resp.data);
                const filename = (() => {
                  try {
                    return new URL(user.image as string).pathname.split('/').pop() || `${Date.now()}.jpg`;
                  } catch (_) {
                    return `${Date.now()}.jpg`;
                  }
                })();

                const headersAny = resp.headers as any;
                const rawContentType = headersAny && (resp.headers['content-type'] ?? (typeof headersAny.get === 'function' ? headersAny.get('content-type') : undefined)) as unknown;
                const contentType = typeof rawContentType === 'string' ? rawContentType : String(rawContentType ?? '') || 'image/jpeg';

                const asset = await sanityClient.assets.upload('image', buffer, {
                  filename,
                  contentType: contentType,
                });

                if (asset && asset._id) {
                  imageToSave = {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: asset._id },
                  };
                }
              } else if (user.image && typeof user.image === 'object') {
                imageToSave = user.image as any;
              }
            } catch (err) {
              console.error('Failed to upload OAuth image to Sanity:', err);
              imageToSave = undefined;
            }

            await sanityClient.create({
              _type: 'user',
              email: user.email,
              name: user.name,
              ...(imageToSave ? { image: imageToSave } : {}),
            });
          }
        } catch (error) {
          console.error('Error creating user in Sanity:', error);
        }
      }
      return true;
    },
    session: async ({ session, token }: { session: Session; token: any }) => {
      try {
        const userEmail = token.email as string | undefined;
        let userId: string | undefined;

        if (userEmail) {
          const userIdObj = await sanityClient.fetch<{ _id?: string }>(
            `*[_type == "user" && email == $email][0] { _id }`,
            { email: userEmail }
          );

          if (userIdObj && userIdObj._id) {
            userId = userIdObj._id;
          } else {
            // If user doesn't exist in Sanity (rare), create a minimal user record so we have an _id
            try {
              const created = await sanityClient.create({
                _type: 'user',
                email: userEmail,
                name: session.user?.name ?? token.name ?? '',
              });
              userId = (created as any)._id;
            } catch (createErr) {
              console.error('Failed to create fallback Sanity user in session callback:', createErr);
            }
          }
        }

        // Fallback to token.sub (provider id) if present — better than leaving undefined
        if (!userId && (token as any)?.sub) {
          userId = (token as any).sub as string;
        }

        return {
          ...session,
          user: {
            ...session.user,
            id: userId,
          },
        };
      } catch (err) {
        console.error('Error in session callback fetching/creating user id:', err);
        return session;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export const auth = handler;
export const handlers = handler;

export default handler;