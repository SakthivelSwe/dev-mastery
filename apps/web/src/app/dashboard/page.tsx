import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your paths, streak, XP and next topics — all in one workspace.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
