import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      { protocol: "https", hostname: "apod.nasa.gov" },
      { protocol: "https", hostname: "files.mastodon.social" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.mastodon.social" },
      { protocol: "https", hostname: "*.mzstatic.com" },
    ],
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL;
    // When BACKEND_URL is not set (standard Vercel deployment),
    // Next.js serves all routes natively via src/app/api/* without proxying to localhost
    if (!backend) {
      return [];
    }
    return [
      {
        source: "/api/ai/mood-playlist",
        destination: `${backend}/api/ai/mood-playlist`,
      },
      {
        source: "/api/feed",
        destination: `${backend}/api/feed`,
      },
      {
        source: "/api/custom-items",
        destination: `${backend}/api/custom-items`,
      },
      {
        source: "/api/news",
        destination: `${backend}/api/news`,
      },
      {
        source: "/api/recommendations",
        destination: `${backend}/api/recommendations`,
      },
      {
        source: "/api/social",
        destination: `${backend}/api/social`,
      },
      {
        source: "/api/stream",
        destination: `${backend}/api/stream`,
      },
      {
        source: "/health",
        destination: `${backend}/health`,
      },
    ];
  },
};

export default nextConfig;
