'use client';

import useSWR from 'swr';
import { useAuthStore } from '@/store/useAuthStore';

const PROGRESS_API = process.env.NEXT_PUBLIC_PROGRESS_API_URL || 'http://localhost:8083';
const CONTENT_API  = process.env.NEXT_PUBLIC_CONTENT_API_URL  || 'http://localhost:8082';

// ─── Fetcher ─────────────────────────────────────────────────

const fetcher = async (url: string, userId?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['X-User-Id'] = userId;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// ─── Types ────────────────────────────────────────────────────

export interface PathProgressSummary {
  pathSlug:        string;
  completedTopics: number;
  totalTopics:     number;
  xpEarned:        number;
  lastStudied:     string | null;
}

export interface DashboardSummary {
  totalXp:      number;
  streak:       number;
  rank:         string;
  dailyGoal:    number;
  dailyXp:      number;
  completedTopicsToday: number;
  totalCompleted: number;
  pathProgress: PathProgressSummary[];
  recentActivity: { date: string; xp: number; topics: number }[];
}

// ─── Mock Data (used when backend is not available) ───────────

const MOCK_DASHBOARD: DashboardSummary = {
  totalXp: 4850,
  streak: 12,
  rank: 'Senior Engineer',
  dailyGoal: 200,
  dailyXp: 130,
  completedTopicsToday: 3,
  totalCompleted: 48,
  pathProgress: [
    { pathSlug: 'java-mastery',      completedTopics: 12, totalTopics: 52, xpEarned: 1200, lastStudied: '2026-05-29' },
    { pathSlug: 'spring-boot',       completedTopics: 8,  totalTopics: 40, xpEarned: 800,  lastStudied: '2026-05-28' },
    { pathSlug: 'dsa',               completedTopics: 15, totalTopics: 55, xpEarned: 1500, lastStudied: '2026-05-29' },
    { pathSlug: 'leetcode-patterns', completedTopics: 5,  totalTopics: 35, xpEarned: 500,  lastStudied: '2026-05-27' },
    { pathSlug: 'javascript',        completedTopics: 4,  totalTopics: 42, xpEarned: 400,  lastStudied: '2026-05-26' },
    { pathSlug: 'typescript',        completedTopics: 2,  totalTopics: 48, xpEarned: 200,  lastStudied: '2026-05-25' },
    { pathSlug: 'react',             completedTopics: 2,  totalTopics: 38, xpEarned: 200,  lastStudied: '2026-05-24' },
    { pathSlug: 'system-design',     completedTopics: 0,  totalTopics: 45, xpEarned: 0,    lastStudied: null },
    { pathSlug: 'sql',               completedTopics: 0,  totalTopics: 36, xpEarned: 0,    lastStudied: null },
    { pathSlug: 'angular',           completedTopics: 0,  totalTopics: 38, xpEarned: 0,    lastStudied: null },
    { pathSlug: 'html',              completedTopics: 0,  totalTopics: 28, xpEarned: 0,    lastStudied: null },
    { pathSlug: 'css',               completedTopics: 0,  totalTopics: 38, xpEarned: 0,    lastStudied: null },
    { pathSlug: 'mongodb',           completedTopics: 0,  totalTopics: 28, xpEarned: 0,    lastStudied: null },
    { pathSlug: 'postgresql-dba',    completedTopics: 0,  totalTopics: 32, xpEarned: 0,    lastStudied: null },
    { pathSlug: 'api-design',        completedTopics: 0,  totalTopics: 30, xpEarned: 0,    lastStudied: null },
    { pathSlug: 'software-architecture', completedTopics: 0, totalTopics: 35, xpEarned: 0, lastStudied: null },
    { pathSlug: 'design-system',     completedTopics: 0,  totalTopics: 30, xpEarned: 0,    lastStudied: null },
    { pathSlug: 'full-stack',        completedTopics: 0,  totalTopics: 28, xpEarned: 0,    lastStudied: null },
  ],
  recentActivity: Array.from({ length: 90 }, (_, i) => {
    const d = new Date('2026-05-29');
    d.setDate(d.getDate() - i);
    return {
      date: d.toISOString().split('T')[0],
      xp: i < 12 ? Math.floor(Math.random() * 250) + 50 : Math.random() > 0.6 ? Math.floor(Math.random() * 150) : 0,
      topics: i < 12 ? Math.floor(Math.random() * 5) + 1 : 0,
    };
  }),
};

// ─── Hooks ────────────────────────────────────────────────────

export function useDashboard() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data, error, isLoading } = useSWR(
    userId ? [`${PROGRESS_API}/v1/progress/summary`, userId] : null,
    ([url, uid]) => fetcher(url, uid),
    { refreshInterval: 60_000, fallbackData: MOCK_DASHBOARD }
  );

  return {
    dashboard: (data as DashboardSummary) ?? MOCK_DASHBOARD,
    isLoading: isLoading && !data,
    error,
  };
}

export function usePathProgress(pathSlug: string) {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useSWR(
    userId ? [`${PROGRESS_API}/v1/progress/path/${pathSlug}`, userId] : null,
    ([url, uid]) => fetcher(url, uid),
    { fallbackData: null }
  );
}
