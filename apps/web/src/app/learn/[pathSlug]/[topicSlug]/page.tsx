import { Metadata } from 'next';
import TopicPage from '@/components/topic/TopicPage';
import { AiChatContainer } from '@/components/chat/AiChatContainer';

export async function generateMetadata({ params }: { params: { pathSlug: string, topicSlug: string } }): Promise<Metadata> {
  const title = params.topicSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    title: `${title} | DevMastery`,
    description: `Master ${title} in the ${params.pathSlug} learning path.`,
  };
}

export default function Page({ params }: { params: { pathSlug: string, topicSlug: string } }) {
  const title = params.topicSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 border-b border-border flex items-center px-6 bg-card shrink-0">
        <h1 className="text-xl font-bold font-syne tracking-tight">
          Dev<span className="text-primary">Mastery</span>
        </h1>
        <div className="ml-8 text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {params.pathSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden relative">
        <TopicPage topicSlug={params.topicSlug} />
        <AiChatContainer topicSlug={params.topicSlug} topicTitle={title} />
      </main>
    </div>
  );
}
