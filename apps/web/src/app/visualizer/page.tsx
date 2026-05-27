import VisualizerShell from '@/components/visualizer/VisualizerShell';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DSA Visualizer | DevMastery',
  description: 'Interactive Data Structures and Algorithms Visualizer',
};

export default function VisualizerPage() {
  return (
    <div className="flex flex-col h-screen">
      <header className="h-16 border-b border-border flex items-center px-6 bg-card">
        <h1 className="text-xl font-bold font-syne tracking-tight">
          Dev<span className="text-primary">Mastery</span> Visualizer
        </h1>
        <nav className="ml-8 flex gap-4 text-sm font-medium text-muted-foreground">
          <button className="text-foreground border-b-2 border-primary pb-5 mt-5">Arrays</button>
          <button className="hover:text-foreground pb-5 mt-5">Linked Lists</button>
          <button className="hover:text-foreground pb-5 mt-5">Trees (BST)</button>
          <button className="hover:text-foreground pb-5 mt-5">Graphs</button>
          <button className="hover:text-foreground pb-5 mt-5">Sorting</button>
        </nav>
      </header>
      
      <main className="flex-1 overflow-hidden bg-background">
        <VisualizerShell />
      </main>
    </div>
  );
}
