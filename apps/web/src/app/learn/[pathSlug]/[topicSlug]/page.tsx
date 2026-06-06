export const runtime = 'edge';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TopicPage from '@/components/topic/TopicPage';
import { MdxRenderer } from '@/components/topic/MdxRenderer';
import { fetchTopic, fetchPath } from '@/lib/api';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ pathSlug: string; topicSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pathSlug, topicSlug } = await params;
  const topic = await fetchTopic(topicSlug);
  const title = topic?.title ?? topicSlug
    .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const pathTitle = topic?.pathTitle ?? pathSlug
    .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${title} | DevMastery`,
    description: `Master ${title} — part of the ${pathTitle} learning path on DevMastery.`,
    openGraph: {
      title: `${title} | DevMastery`,
      description: `Deep-dive into ${title} with theory, code, visualizers, and AI-assisted Feynman practice.`,
    },
  };
}

export default async function TopicPageRoute({ params }: PageProps) {
  const { pathSlug, topicSlug } = await params;
  // Fetch topic data server-side (SSR)
  const topic = await fetchTopic(topicSlug);

  // If topic genuinely doesn't exist in DB, show 404
  // (comment out for dev if backend is off)
  // if (!topic) notFound();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* App Shell Header */}
      <header className="h-16 border-b border-[--border-default] flex items-center px-6 bg-[--bg-surface]/80 backdrop-blur-md shrink-0 z-10">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold font-display tracking-tight text-[--text-primary]">
            Dev<span className="text-[--accent-ai]">Mastery</span>
          </span>
        </Link>
        <div className="ml-6 flex items-center gap-2 text-sm text-[--text-muted]">
          <span>/</span>
          <Link href="/dashboard" className="hover:text-[--text-primary] transition-colors">Dashboard</Link>
          <span>/</span>
          <Link
            href={`/learn/${pathSlug}/roadmap`}
            className="hover:text-[--text-primary] transition-colors capitalize"
          >
            {pathSlug.replace(/-/g, ' ')}
          </Link>
        </div>
      </header>

      {/* Topic Page — takes up remaining height */}
      <main className="flex-1 overflow-hidden">
        <TopicPage
          topicSlug={topicSlug}
          topic={topic}
          MdxRenderer={MdxRenderer}
        />
      </main>
    </div>
  );
}
