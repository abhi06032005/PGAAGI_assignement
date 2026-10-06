import 'server-only';
import { AuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import CredentialsProvider from 'next-auth/providers/credentials';
import env from '../env';
import { refreshSpotifyToken } from './refreshSpotifyToken';

const SPOTIFY_SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
  'user-read-playback-state',
].join(' ');

export const authOptions: AuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
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
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        return {
          id: 'usr_demo_pulse',
          name: credentials.email.split('@')[0] || 'Demo User',
          email: credentials.email,
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        };
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

      if (user) {
        token.isSpotifyConnected = token.isSpotifyConnected ?? false;
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
        userObj.id = token.sub || 'usr_demo_pulse';
        userObj.isSpotifyConnected = Boolean(token.isSpotifyConnected);
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export default authOptions;
