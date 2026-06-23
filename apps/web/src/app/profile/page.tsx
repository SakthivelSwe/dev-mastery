'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/hooks/useProgress';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { CommandPalette } from '@/components/shell/CommandPalette';
import {
  User, Mail, Trophy, Flame, Star, BookOpen,
  LogOut, Settings, ChevronRight, Zap, Award,
  TrendingUp, CheckCircle2, Calendar, Edit3
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://devmastery-core.onrender.com';

function rankColor(rank: string) {
  if (rank.includes('Staff'))  return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  if (rank.includes('Senior')) return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
  if (rank.includes('Mid'))    return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  if (rank.includes('Junior')) return 'text-green-400 bg-green-400/10 border-green-400/30';
  return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
}

function rankNext(rank: string) {
  if (rank.includes('Beginner')) return { next: 'Junior Engineer', xpNeeded: 500 };
  if (rank.includes('Junior'))   return { next: 'Mid Engineer', xpNeeded: 3000 };
  if (rank.includes('Mid'))      return { next: 'Senior Engineer', xpNeeded: 10000 };
  if (rank.includes('Senior'))   return { next: 'Staff Engineer', xpNeeded: 25000 };
  return null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { dashboard, isLoading } = useDashboard();
  const [joined, setJoined] = useState<string>('');

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!isAuthenticated && !localStorage.getItem('auth_token')) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Derive join date from JWT iat claim
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.iat) {
          setJoined(new Date(payload.iat * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
      } catch { /* ignore */ }
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const totalCompleted = dashboard.totalCompleted;
  const streak         = dashboard.streak;
  const totalXp        = dashboard.totalXp;
  const rank           = dashboard.rank;
  const rankInfo       = rankNext(rank);
  const xpToNext       = rankInfo ? Math.max(0, rankInfo.xpNeeded - totalXp) : 0;
  const xpProgress     = rankInfo
    ? Math.min(100, Math.round((totalXp / rankInfo.xpNeeded) * 100))
    : 100;

  const initials = (user?.fullName || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const activePaths = dashboard.pathProgress.filter(p => p.completedTopics > 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[--bg-primary]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Hero Card ─────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-indigo-500/10 via-[--bg-surface] to-purple-500/5 border border-[--border-default] rounded-2xl p-8 overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-lg shadow-indigo-500/20">
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-[--text-primary]">
                      {user?.fullName || 'Developer'}
                    </h1>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${rankColor(rank)}`}>
                      {rank}
                    </span>
                  </div>
                  <p className="text-[--text-muted] text-sm mt-1">{user?.email}</p>
                  {joined && (
                    <p className="text-[--text-muted] text-xs mt-1 flex items-center gap-1">
                      <Calendar size={11} /> Member since {joined}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <Link
                    href="/settings"
                    className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] hover:border-indigo-500/50 text-[--text-secondary] hover:text-[--text-primary] transition-all"
                  >
                    <Settings size={14} /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>

              {/* Rank progress bar */}
              {rankInfo && (
                <div className="relative mt-6">
                  <div className="flex justify-between text-xs text-[--text-muted] mb-1.5">
                    <span>{rank}</span>
                    <span>{xpToNext.toLocaleString()} XP to {rankInfo.next}</span>
                  </div>
                  <div className="h-2 bg-[--bg-elevated] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Stats Grid ───────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Zap,         label: 'Total XP',        value: totalXp.toLocaleString(),    color: 'text-amber-400' },
                { icon: Flame,       label: 'Day Streak',       value: streak.toString(),           color: 'text-orange-400' },
                { icon: CheckCircle2,label: 'Topics Completed', value: totalCompleted.toString(),   color: 'text-green-400' },
                { icon: BookOpen,    label: 'Paths Active',     value: activePaths.length.toString(),color: 'text-blue-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-[--bg-surface] border border-[--border-default] rounded-xl p-4">
                  <Icon size={18} className={`${color} mb-2`} />
                  <div className="text-2xl font-bold text-[--text-primary]">{isLoading ? '–' : value}</div>
                  <div className="text-xs text-[--text-muted] mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* ── Active Learning Paths ─────────────────── */}
            <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-6">
              <h2 className="text-base font-bold text-[--text-primary] flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-indigo-400" />
                Active Learning Paths
              </h2>
              {isLoading ? (
                <div className="text-sm text-[--text-muted]">Loading…</div>
              ) : activePaths.length === 0 ? (
                <div className="text-sm text-[--text-muted] text-center py-6">
                  No paths started yet. <Link href="/dashboard" className="text-indigo-400 hover:underline">Browse paths →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activePaths.map(p => {
                    const pct = p.totalTopics > 0 ? Math.round((p.completedTopics / p.totalTopics) * 100) : 0;
                    return (
                      <Link
                        key={p.pathSlug}
                        href={`/learn/${p.pathSlug}/roadmap`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-[--bg-elevated] transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[--text-primary] capitalize">
                              {p.pathSlug.replace(/-/g, ' ')}
                            </span>
                            <span className="text-xs text-[--text-muted]">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-[--text-muted] mt-1 block">
                            {p.completedTopics} / {p.totalTopics || '?'} topics
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-[--text-muted] group-hover:text-[--text-primary] shrink-0 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Achievements ──────────────────────────── */}
            <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-6">
              <h2 className="text-base font-bold text-[--text-primary] flex items-center gap-2 mb-4">
                <Award size={16} className="text-amber-400" />
                Achievements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: '🔥', label: 'First Streak',   earned: streak >= 1 },
                  { icon: '⚡', label: 'First XP',       earned: totalXp > 0 },
                  { icon: '📚', label: 'First Topic',    earned: totalCompleted >= 1 },
                  { icon: '🎯', label: '10 Topics',      earned: totalCompleted >= 10 },
                  { icon: '🚀', label: '7-day Streak',   earned: streak >= 7 },
                  { icon: '💎', label: '30-day Streak',  earned: streak >= 30 },
                  { icon: '🏆', label: '50 Topics',      earned: totalCompleted >= 50 },
                  { icon: '⭐', label: 'Senior Dev',     earned: rank.includes('Senior') || rank.includes('Staff') },
                ].map(a => (
                  <div
                    key={a.label}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                      a.earned
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-[--bg-elevated] border-[--border-default] opacity-40'
                    }`}
                  >
                    <span className="text-2xl">{a.icon}</span>
                    <span className="text-xs font-medium text-[--text-secondary]">{a.label}</span>
                    {a.earned && <span className="text-[9px] text-amber-400 font-semibold">EARNED</span>}
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

