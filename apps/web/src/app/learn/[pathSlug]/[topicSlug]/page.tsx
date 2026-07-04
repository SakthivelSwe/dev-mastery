import { Metadata } from 'next';
import TopicPage from '@/components/topic/TopicPage';
import { fetchTopic } from '@/lib/api';

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

/**
 * NOTE: LearnLayout already renders Topbar + Sidebar around us.
 * We must NOT add another header here — that would double-stack chrome
 * and break the h-[calc(100vh - Xrem)] math inside TopicPage.
 */
export default async function TopicPageRoute({ params }: PageProps) {
  const { pathSlug, topicSlug } = await params;
  const topic = await fetchTopic(topicSlug);

  return <TopicPage topicSlug={topicSlug} pathSlug={pathSlug} topic={topic} />;
}
