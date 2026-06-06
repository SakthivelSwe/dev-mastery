/** @type {import('next').NextConfig} */
const { setupDevPlatform } = process.env.NODE_ENV === 'development'
  ? require('@cloudflare/next-on-pages/next-dev')
  : { setupDevPlatform: () => {} };

const nextConfig = {
  reactStrictMode: true,

  // Required for @cloudflare/next-on-pages
  // Tells Next.js to produce edge-compatible output
  experimental: {},

  images: {
    // Cloudflare Pages doesn't have a Node image optimizer — use unoptimized
    unoptimized: true,
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
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
