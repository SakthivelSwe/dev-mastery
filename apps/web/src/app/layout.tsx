import type { Metadata } from 'next';
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
