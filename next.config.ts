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
    ],
  },
};

export default nextConfig;
