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
  async headers() {
    // The backend origin the browser is allowed to talk to (connect-src).
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Pragmatic-but-strict CSP. 'unsafe-inline'/'unsafe-eval' are required by
    // Next.js' hydration inline scripts and the Monaco code editor's workers;
    // everything else is locked down to self + known origins.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "worker-src 'self' blob:",
      `connect-src 'self' ${api} https://fonts.googleapis.com https://fonts.gstatic.com`,
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
