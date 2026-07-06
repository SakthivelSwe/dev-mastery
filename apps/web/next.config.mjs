/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Google Fonts (already used by the design system) — cache for a year.
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 8, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },

      // ── Topic & path content ──────────────────────────────
      // These are the read-heavy endpoints powering the topic reader.
      // StaleWhileRevalidate gives an instant response from cache while a
      // background fetch keeps the copy fresh — perfect for offline reading
      // of previously-visited topics.
      {
        urlPattern:
          /\/v1\/(?:topics|paths|patterns)(?:\/[A-Za-z0-9_\-\/]*)?(?:\?.*)?$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'devmastery-content',
          expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
        },
      },

      // ── User-specific progress / auth — always try the network first.
      // Fall back to cache only if the backend is unreachable.
      {
        urlPattern: /\/v1\/(?:progress|auth|profile|interviews)(?:\/.*)?$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'devmastery-user',
          expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 5,
        },
      },

      // ── AI + streaming endpoints — do not cache SSE responses.
      {
        urlPattern: /\/v1\/ai\//i,
        handler: 'NetworkOnly',
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
};

export default withPWA(nextConfig);
