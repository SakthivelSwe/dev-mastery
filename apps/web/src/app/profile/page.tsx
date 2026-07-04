'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/hooks/useProgress';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import {
  Zap, Flame, CheckCircle2, BookOpen,
  LogOut, Settings, ChevronRight, Calendar, TrendingUp, Award,
} from 'lucide-react';
import Link from 'next/link';

const RANK_THRESHOLDS = [
  { label: 'Apprentice',      next: 'Developer',       xpNeeded: 1000  },
  { label: 'Developer',       next: 'Mid engineer',    xpNeeded: 3000  },
  { label: 'Mid engineer',    next: 'Senior engineer', xpNeeded: 6000  },
  { label: 'Senior engineer', next: 'Tech lead',       xpNeeded: 12000 },
  { label: 'Tech lead',       next: 'Staff engineer',  xpNeeded: 20000 },
];

function getProgressToNext(rank: string, xp: number) {
  const entry = RANK_THRESHOLDS.find(r => r.label.toLowerCase() === rank.toLowerCase());
  if (!entry) return null;
  const progress = Math.min(100, Math.round((xp / entry.xpNeeded) * 100));
  const remaining = Math.max(0, entry.xpNeeded - xp);
  return { next: entry.next, progress, remaining };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { dashboard, isLoading } = useDashboard();
  const [joined, setJoined] = useState('');

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!isAuthenticated && !localStorage.getItem('auth_token')) router.push('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.iat) {
          setJoined(
            new Date(payload.iat * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          );
        }
      } catch { /* ignore */ }
    }
  }, [token]);

  const { totalCompleted, streak, totalXp, rank, pathProgress } = dashboard;
  const rankInfo    = getProgressToNext(rank, totalXp);
  const activePaths = pathProgress.filter(p => p.completedTopics > 0);
  const initials    = (user?.fullName || user?.email || 'U')
    .split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const ACHIEVEMENTS = [
    { label: 'First day',     earned: streak >= 1,       icon: '🔥' },
    { label: 'First XP',      earned: totalXp > 0,        icon: '⚡' },
    { label: 'First topic',   earned: totalCompleted >= 1, icon: '📖' },
    { label: '10 topics',     earned: totalCompleted >= 10,icon: '🎯' },
    { label: '7-day streak',  earned: streak >= 7,        icon: '🚀' },
    { label: '30-day streak', earned: streak >= 30,       icon: '💎' },
    { label: '50 topics',     earned: totalCompleted >= 50,icon: '🏆' },
    { label: 'Senior rank',   earned: rank.toLowerCase().includes('senior') || rank.toLowerCase().includes('staff'), icon: '⭐' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* ── Identity card ──────────────────────────────── */}
            <div
              className="rounded-[14px] border p-6 sm:p-7"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-[14px] flex items-center justify-center text-xl font-semibold shrink-0"
                  style={{
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1
                      className="text-[20px] font-medium tracking-tight"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                    >
                      {user?.fullName || 'Developer'}
                    </h1>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded"
                      style={{
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      {rank}
                    </span>
                  </div>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                  {joined && (
                    <p className="text-[12px] mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={11} strokeWidth={1.75} /> Member since {joined}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link href="/settings" className="btn-ghost text-[13px] px-3 py-1.5">
                    <Settings size={13} /> Settings
                  </Link>
                  <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="btn-ghost text-[13px] px-3 py-1.5"
                    style={{ color: 'var(--error)', borderColor: 'color-mix(in oklab, var(--error) 30%, var(--border-default))' }}
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              </div>

              {/* Rank progress */}
              {rankInfo && (
                <div className="mt-5">
                  <div
                    className="flex justify-between text-[12px] mb-1.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>{rank}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {rankInfo.remaining.toLocaleString()} XP to {rankInfo.next}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-inset)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${rankInfo.progress}%`, background: 'var(--accent)' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Stats ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { Icon: Zap,          label: 'Total XP',       value: totalXp.toLocaleString(), accent: 'var(--accent)' },
                { Icon: Flame,        label: 'Day streak',     value: `${streak}`,              accent: 'var(--warning)' },
                { Icon: CheckCircle2, label: 'Topics done',    value: `${totalCompleted}`,      accent: 'var(--success)' },
                { Icon: BookOpen,     label: 'Paths active',   value: `${activePaths.length}`,  accent: 'var(--accent-dsa)' },
              ].map(({ Icon, label, value, accent }) => (
                <div
                  key={label}
                  className="rounded-[10px] border p-4"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                >
                  <Icon size={15} strokeWidth={1.75} style={{ color: accent, marginBottom: '8px' }} />
                  <div
                    className="text-[20px] font-medium tabular-nums"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                  >
                    {isLoading ? '–' : value}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* ── Active paths ──────────────────────────────── */}
            <div
              className="rounded-[14px] border p-5"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <h2
                className="flex items-center gap-2 text-[14px] font-medium mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                <TrendingUp size={14} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
                Active paths
              </h2>
              {isLoading ? (
                <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading…</p>
              ) : activePaths.length === 0 ? (
                <p className="text-[13px] text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  No paths started.{' '}
                  <Link href="/dashboard" style={{ color: 'var(--accent)' }}>Browse paths</Link>
                </p>
              ) : (
                <div className="space-y-1">
                  {activePaths.map(p => {
                    const pct = p.totalTopics > 0 ? Math.round((p.completedTopics / p.totalTopics) * 100) : 0;
                    return (
                      <Link
                        key={p.pathSlug}
                        href={`/learn/${p.pathSlug}/roadmap`}
                        className="flex items-center gap-4 p-2.5 rounded-md transition-colors group"
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-[13px] font-medium capitalize"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {p.pathSlug.replace(/-/g, ' ')}
                            </span>
                            <span
                              className="text-[11px] tabular-nums"
                              style={{ color: 'var(--accent)' }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-inset)' }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, background: 'var(--accent)' }}
                            />
                          </div>
                          <span
                            className="text-[11px] mt-0.5 tabular-nums block"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {p.completedTopics} / {p.totalTopics || '?'} topics
                          </span>
                        </div>
                        <ChevronRight
                          size={13}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--text-secondary)' }}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Achievements ──────────────────────────────── */}
            <div
              className="rounded-[14px] border p-5"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <h2
                className="flex items-center gap-2 text-[14px] font-medium mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                <Award size={14} strokeWidth={1.75} style={{ color: 'var(--warning)' }} />
                Achievements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ACHIEVEMENTS.map(a => (
                  <div
                    key={a.label}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-[10px] border text-center"
                    style={{
                      background: a.earned ? 'color-mix(in oklab, var(--warning) 8%, var(--bg-elevated))' : 'var(--bg-elevated)',
                      borderColor: a.earned ? 'color-mix(in oklab, var(--warning) 30%, var(--border-default))' : 'var(--border-default)',
                      opacity: a.earned ? 1 : 0.4,
                    }}
                  >
                    <span className="text-xl">{a.icon}</span>
                    <span className="text-[11.5px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {a.label}
                    </span>
                    {a.earned && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: 'var(--warning)' }}
                      >
                        Earned
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
