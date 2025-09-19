import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static file serving for uploads
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ];
  },
  
  // Configure images for optimization and allow uploads domain
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // Ensure public directory is properly served
  trailingSlash: false,
  
  // Optional: Configure file size limits if needed
  experimental: {
    // Remove if you don't need this
  },
};

export default nextConfig;