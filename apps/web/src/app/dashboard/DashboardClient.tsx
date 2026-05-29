'use client';

import { Loader2 } from 'lucide-react';
import { useDashboard } from '@/hooks/useProgress';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { PathGrid } from '@/components/dashboard/PathCard';
import { StreakCalendar } from '@/components/dashboard/StreakCalendar';
import { ContinueLearning } from '@/components/dashboard/ContinueLearning';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardClient() {
  const { dashboard, isLoading } = useDashboard();
  const { user } = useAuthStore();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-[--text-muted]">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-[--text-primary] mb-1">
            {greeting()}{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-[--text-secondary] text-sm">
            {dashboard.streak > 0
              ? `You're on a ${dashboard.streak}-day streak. Keep it going!`
              : 'Start a topic today to begin your streak!'}
          </p>
        </div>

        {/* ── Stats Bar ─────────────────────────────────────── */}
        <StatsBar
          totalXp={dashboard.totalXp}
          streak={dashboard.streak}
          rank={dashboard.rank}
          dailyXp={dashboard.dailyXp}
          dailyGoal={dashboard.dailyGoal}
          totalCompleted={dashboard.totalCompleted}
        />

        {/* ── Main Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-8">
          {/* Left: Path Cards */}
          <PathGrid pathProgress={dashboard.pathProgress} />

          {/* Right: Sidebar Widgets */}
          <div className="flex flex-col gap-4">
            <ContinueLearning pathProgress={dashboard.pathProgress} />
          </div>
        </div>

        {/* ── Activity Calendar ─────────────────────────────── */}
        <StreakCalendar
          activity={dashboard.recentActivity}
          streak={dashboard.streak}
        />

        {/* ── Footer Padding ────────────────────────────────── */}
        <div className="h-8" />
      </div>
    </div>
  );
}
