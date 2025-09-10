import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix lockfile detection issue
  outputFileTracingRoot: __dirname,
  
  // Turbopack configuration (updated format)
  turbopack: {
    root: path.resolve(__dirname),
  },
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Output configuration for better performance
  output: 'standalone',
  
  // Image optimization
  images: {
    unoptimized: false,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
