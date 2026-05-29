import type { Metadata } from 'next';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DevMastery — Master Every Technology. Miss Nothing.',
    template: '%s | DevMastery',
  },
  description:
    'From Zero to 10-Year Senior Engineer. Depth-first, concept-complete, AI-assisted learning. Master Java, DSA, Spring Boot, System Design and more.',
  keywords: ['java', 'dsa', 'spring boot', 'system design', 'interview preparation', 'programming', 'coding', 'learning platform'],
  authors: [{ name: 'DevMastery' }],
  openGraph: {
    title: 'DevMastery — Master Every Technology. Miss Nothing.',
    description: 'Structured, depth-first learning platform. From beginner to senior engineer.',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  manifest: '/manifest.json',
  themeColor: '#0d1117',
};

// Flash-free dark mode: runs synchronously BEFORE the first paint
// This prevents the "white flash" on dark mode users in SSR/Next.js
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.add(theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script — must run before paint to avoid theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Fonts — preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&display=swap"
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
