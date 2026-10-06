import 'server-only';
import { AuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import env from '../env';
import { refreshSpotifyToken } from './refreshSpotifyToken';

import { prisma } from '@/lib/prisma';

const SPOTIFY_SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
  'user-read-playback-state',
].join(' ');

export const authOptions: AuthOptions = {
  secret: env.NEXTAUTH_SECRET || 'pulse-super-secret-key-32-chars-long-fallback',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: 'select_account',
                access_type: 'offline',
                response_type: 'code',
              },
            },
          }),
        ]
      : []),
    ...(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET
      ? [
          SpotifyProvider({
            clientId: env.SPOTIFY_CLIENT_ID,
            clientSecret: env.SPOTIFY_CLIENT_SECRET,
            authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent(SPOTIFY_SCOPES)}`,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase() || 'demo@pulse.app';
        const rawName = credentials?.name?.trim();
        const namePart = email.split('@')[0];
        const formattedName =
          rawName ||
          (namePart ? namePart.charAt(0).toUpperCase() + namePart.slice(1) : 'Abhijeet Nayak');

        // Persist user to PostgreSQL via Prisma
        try {
          const dbUser = await prisma.user.upsert({
            where: { email },
            update: {
              name: formattedName,
              image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
            },
            create: {
              email,
              name: formattedName,
              password: credentials?.password || undefined,
              image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
            },
          });

          return {
            id: dbUser.id,
            name: dbUser.name || formattedName,
            email: dbUser.email,
            image: dbUser.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          };
        } catch {
          return {
            id: `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: formattedName,
            email,
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && account.provider === 'spotify') {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = (account.expires_at ?? 0) * 1000;
        token.isSpotifyConnected = true;
        token.spotifyId = account.providerAccountId;
        return token;
      }

      if (account && account.provider === 'google') {
        if (user?.email) {
          try {
            await prisma.user.upsert({
              where: { email: user.email },
              update: {
                name: user.name || undefined,
                image: user.image || undefined,
              },
              create: {
                email: user.email,
                name: user.name || undefined,
                image: user.image || undefined,
              },
            });

            await prisma.account.create({
              data: {
                id: `acc_google_${account.providerAccountId}`,
                userId: user.id || `usr_${user.email}`,
                type: account.type || 'oauth',
                provider: 'google',
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                id_token: account.id_token,
              },
            });
          } catch {}
        }

        token.id = user?.id;
        token.name = user?.name;
        token.email = user?.email;
        token.picture = user?.image;
        token.isGoogleConnected = true;
        return token;
      }

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.isSpotifyConnected = token.isSpotifyConnected ?? false;
        token.isGoogleConnected = token.isGoogleConnected ?? false;
        return token;
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() > (token.accessTokenExpires as number) - 60000
      ) {
        return refreshSpotifyToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const userObj = session.user as Record<string, unknown>;
        userObj.id = token.id || token.sub || 'usr_demo_pulse';
        userObj.isSpotifyConnected = Boolean(token.isSpotifyConnected);
        userObj.isGoogleConnected = Boolean(token.isGoogleConnected);
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

export default authOptions;
