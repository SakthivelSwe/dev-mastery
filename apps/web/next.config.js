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
    // Force all packages to use the same single React instance
    // Prevents "multiple React versions" error from @mdx-js/react etc.
    config.resolve.alias['react'] = path.resolve('./node_modules/react');
    config.resolve.alias['react-dom'] = path.resolve('./node_modules/react-dom');
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
