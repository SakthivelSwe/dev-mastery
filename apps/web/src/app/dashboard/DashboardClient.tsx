'use client';

import { Loader2 } from 'lucide-react';
import { useDashboard } from '@/hooks/useProgress';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { PathGrid } from '@/components/dashboard/PathCard';
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
        <div className="flex flex-col items-center gap-3" style={{ color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={22} style={{ color: 'var(--accent)' }} />
          <span className="text-[13px]">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : '';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="mb-10">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
            }}
          >
            {greeting()}{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            {dashboard.streak > 0
              ? `You are on a ${dashboard.streak}-day streak. One more topic keeps it alive.`
              : 'Open a topic today to start a streak.'}
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
          <PathGrid pathProgress={dashboard.pathProgress} />
          <ContinueLearning pathProgress={dashboard.pathProgress} />
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
