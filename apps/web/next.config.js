/** @type {import('next').NextConfig} */
const path = require('path');
const { setupDevPlatform } = process.env.NODE_ENV === 'development'
  ? require('@cloudflare/next-on-pages/next-dev')
  : { setupDevPlatform: () => {} };

const nextConfig = {
  reactStrictMode: true,

  // Required for @cloudflare/next-on-pages
  experimental: {},

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
