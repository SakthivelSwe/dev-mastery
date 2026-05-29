import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | DevMastery',
  description: 'Track your learning progress across 18 roadmaps. View streaks, XP, and continue where you left off.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
