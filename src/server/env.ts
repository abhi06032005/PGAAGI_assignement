import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().default('pulse-development-secret-key-32-chars-long'),
  NEXTAUTH_URL: z.string().default('http://localhost:3000'),
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  NEWS_API_KEY: z.string().optional(),
  TMDB_API_KEY: z.string().optional(),
  NASA_API_KEY: z.string().default('DEMO_KEY'),
  MASTODON_INSTANCE_URL: z.string().default('https://mastodon.social'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const env = envSchema.parse(process.env);
export default env;
