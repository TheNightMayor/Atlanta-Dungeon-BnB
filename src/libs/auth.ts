import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import { SanityAdapter } from 'next-auth-sanity';
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Check if user exists in Sanity
          const user = await sanityClient.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: credentials.email }
          );

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            return null;
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
  // adapter: SanityAdapter({ client: sanityClient }),
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

                const asset = await sanityClient.assets.upload('image', buffer, {
                  filename,
                  contentType: resp.headers['content-type'] || 'image/jpeg',
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
    session: async ({ session, token }) => {
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