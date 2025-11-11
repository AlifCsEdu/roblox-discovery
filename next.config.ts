import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Cloudflare Pages with server-side features
  output: 'standalone',
  
  images: {
    // Cloudflare Pages doesn't support Next.js Image Optimization
    // Use unoptimized images
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tr.rbxcdn.com',  // Roblox thumbnails
      },
      {
        protocol: 'https',
        hostname: 'www.roblox.com',
      },
    ],
  },
};

export default nextConfig;
