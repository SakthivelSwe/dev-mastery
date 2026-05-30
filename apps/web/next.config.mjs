/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 }, // 1 year
        },
      },
      {
        // Cache API responses (e.g. content-service on 8082, progress on 8083)
        urlPattern: /^http:\/\/localhost:808[23]\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }, // 1 day
          networkTimeoutSeconds: 5,
        },
      },
    ],
  },
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Rewrite API calls through Next.js to avoid CORS in production
  // In development the backend services run directly on their ports
  async rewrites() {
    return [
      { source: '/api/auth/:path*',    destination: `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081'}/:path*` },
      { source: '/api/content/:path*', destination: `${process.env.NEXT_PUBLIC_CONTENT_API_URL || 'http://localhost:8082'}/:path*` },
      { source: '/api/progress/:path*',destination: `${process.env.NEXT_PUBLIC_PROGRESS_API_URL || 'http://localhost:8083'}/:path*` },
    ];
  },
};

export default withPWA(nextConfig);
