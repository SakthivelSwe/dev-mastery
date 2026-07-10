/** @type {import('next').NextConfig} */
const path = require('path');
const { setupDevPlatform } = process.env.NODE_ENV === 'development'
  ? require('@cloudflare/next-on-pages/next-dev')
  : { setupDevPlatform: () => {} };

const nextConfig = {
  reactStrictMode: true,

  // Emit response bodies gzip-compressed. Cloudflare Pages will re-compress
  // with Brotli at the edge, but this makes local `next start` fast too.
  compress: true,
  poweredByHeader: false,

  // Tree-shake barrel imports from these libraries so we don't ship dead code
  // from lucide-react (icon set) or framer-motion. Massively cuts JS payload
  // on the mobile-critical /dashboard / /review / /profile routes.
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      'react-markdown',
      '@tanstack/react-query',
      'date-fns',
    ],
  },

  webpack: (config) => {
    // NOTE: A previous version aliased `react`/`react-dom` to force a single
    // instance. In this npm-workspace setup there is exactly one hoisted
    // copy of React at the root `node_modules`, so aliasing is unnecessary
    // and actively breaks Next.js 15's React Server Components manifest
    // (subpaths like `react-dom/server.edge`, internal Next `layout-router`,
    // `metadata-boundary`, etc.). Leave module resolution to Node.
    return config;
  },

  images: {
    unoptimized: true,
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

if (process.env.NODE_ENV === 'development') {
  setupDevPlatform();
}

module.exports = nextConfig;
