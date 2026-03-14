import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import { SanityAdapter } from 'next-auth-sanity';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

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
            await sanityClient.create({
              _type: 'user',
              email: user.email,
              name: user.name,
              image: user.image,
            });
          }
        } catch (error) {
          console.error('Error creating user in Sanity:', error);
        }
      }
      return true;
    },
    session: async ({ session, token }) => {
      const userEmail = token.email;
      const userIdObj = await sanityClient.fetch<{ _id: string }>(
        `*[_type == "user" && email == $email][0] {
            _id
        }`,
        { email: userEmail }
      );
      return {
        ...session,
        user: {
          ...session.user,
          id: userIdObj._id,
        },
      };
    },
  },
};

const handler = NextAuth(authOptions);

export const auth = handler;
export const handlers = handler;

export default handler;