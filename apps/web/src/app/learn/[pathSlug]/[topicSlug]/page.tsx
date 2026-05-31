import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TopicPage from '@/components/topic/TopicPage';
import { fetchTopic, fetchPath } from '@/lib/api';

interface PageProps {
  params: { pathSlug: string; topicSlug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const topic = await fetchTopic(params.topicSlug);
  const title = topic?.title ?? params.topicSlug
    .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const pathTitle = topic?.pathTitle ?? params.pathSlug
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
  // Fetch topic data and path concurrently
  const [topic, path] = await Promise.all([
    fetchTopic(params.topicSlug),
    fetchPath(params.pathSlug),
  ]);

  // Build prev/next navigation from the ordered topic list
  const topics = path?.topics ?? [];
  const currentIndex = topics.findIndex(t => t.slug === params.topicSlug);
  const prevTopic = currentIndex > 0 ? topics[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < topics.length - 1 ? topics[currentIndex + 1] : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* App Shell Header */}
      <header className="h-16 border-b border-[--border-default] flex items-center px-6 bg-[--bg-surface]/80 backdrop-blur-md shrink-0 z-10">
        <a href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold font-display tracking-tight text-[--text-primary]">
            Dev<span className="text-[--accent-ai]">Mastery</span>
          </span>
        </a>
        <div className="ml-6 flex items-center gap-2 text-sm text-[--text-muted]">
          <span>/</span>
          <a href="/dashboard" className="hover:text-[--text-primary] transition-colors">Dashboard</a>
          <span>/</span>
          <a
            href={`/learn/${params.pathSlug}/roadmap`}
            className="hover:text-[--text-primary] transition-colors capitalize"
          >
            {params.pathSlug.replace(/-/g, ' ')}
          </a>
        </div>
      </header>

      {/* Topic Page — takes up remaining height */}
      <main className="flex-1 overflow-hidden">
        <TopicPage
          topicSlug={params.topicSlug}
          pathSlug={params.pathSlug}
          topic={topic}
          prevSlug={prevTopic?.slug ?? null}
          nextSlug={nextTopic?.slug ?? null}
        />
      </main>
    </div>
  );
}
