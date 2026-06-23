import { redirect } from 'next/navigation';

// The standalone /visualizer page was a broken shell with dead nav buttons.
// The real visualizers live inside topic pages (/learn/[path]/[topic]).
export default function VisualizerPage() {
  redirect('/learn/dsa/roadmap');
}
