
'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const API_BASE     = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const PROGRESS_API = process.env.NEXT_PUBLIC_PROGRESS_API_URL || API_BASE;
const CONTENT_API  = process.env.NEXT_PUBLIC_CONTENT_API_URL  || API_BASE;

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

// ─── Helpers ─────────────────────────────────────────────────

/** Empty dashboard for a brand-new user — no fake stats. */
const EMPTY_DASHBOARD: DashboardSummary = {
  totalXp: 0,
  streak: 0,
  rank: 'Beginner',
  dailyGoal: 100,
  dailyXp: 0,
  completedTopicsToday: 0,
  totalCompleted: 0,
  pathProgress: [],
  recentActivity: [],
};

function rankFromXp(xp: number): string {
  if (xp >= 25000) return 'Staff Engineer';
  if (xp >= 10000) return 'Senior Engineer';
  if (xp >=  3000) return 'Mid Engineer';
  if (xp >=   500) return 'Junior Engineer';
  return 'Beginner';
}

/** Build a 90-day calendar so the heat-map renders even with no activity yet. */
function emptyActivity(days = 90): { date: string; xp: number; topics: number }[] {
  const out: { date: string; xp: number; topics: number }[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({ date: d.toISOString().split('T')[0], xp: 0, topics: 0 });
  }
  return out;
}

// ─── Fetchers ────────────────────────────────────────────────

const authedFetcher = async (url: string, token: string | null) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

interface BackendProgressSummary {
  userId: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  topicsCompleted: number;
  badgesEarned: number;
}

interface BackendPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
}

interface RoadmapResponse {
  path: { slug: string; title: string; totalTopics: number };
  levels: { topicCount: number; completedCount: number }[];
}

async function buildDashboard(token: string | null): Promise<DashboardSummary> {
  // Pull progress summary (auth) + path list (public) in parallel.
  const [summaryRes, pathsRes] = await Promise.allSettled([
    authedFetcher(`${PROGRESS_API}/v1/progress/summary`, token),
    authedFetcher(`${CONTENT_API}/v1/paths`, null),
  ]);

  let summary: BackendProgressSummary | null = null;
  if (summaryRes.status === 'fulfilled') {
    summary = summaryRes.value as BackendProgressSummary;
  }

  let paths: BackendPath[] = [];
  if (pathsRes.status === 'fulfilled' && Array.isArray(pathsRes.value)) {
    paths = pathsRes.value as BackendPath[];
  }

  // Fetch per-path roadmap progress in parallel (with auth so completed flags are populated).
  // Using allSettled so a single path failure doesn't break the whole dashboard.
  const roadmapResults = await Promise.allSettled(
    paths.map(p => authedFetcher(`${CONTENT_API}/v1/paths/${p.slug}/roadmap`, token))
  );

  const pathProgress: PathProgressSummary[] = paths.map((p, i) => {
    const res = roadmapResults[i];
    if (res.status === 'fulfilled') {
      const roadmap = res.value as RoadmapResponse;
      const totalTopics = roadmap.path?.totalTopics ??
        roadmap.levels.reduce((acc, l) => acc + l.topicCount, 0);
      const completedTopics = roadmap.levels.reduce((acc, l) => acc + l.completedCount, 0);
      return {
        pathSlug: p.slug,
        completedTopics,
        totalTopics,
        xpEarned: 0,
        lastStudied: null,
      };
    }
    return { pathSlug: p.slug, completedTopics: 0, totalTopics: 0, xpEarned: 0, lastStudied: null };
  });

  const totalXp = summary?.totalXp ?? 0;
  return {
    totalXp,
    streak: summary?.currentStreak ?? 0,
    rank: rankFromXp(totalXp),
    dailyGoal: 100,
    dailyXp: 0,
    completedTopicsToday: 0,
    totalCompleted: summary?.topicsCompleted ?? 0,
    pathProgress,
    recentActivity: emptyActivity(90),
  };
}

// ─── Hooks ────────────────────────────────────────────────────

export function useDashboard() {
  const { user, token } = useAuthStore();
  const userId = user?.id;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? ['dashboard', userId, token] : null,
    () => buildDashboard(token),
    { refreshInterval: 30_000, fallbackData: EMPTY_DASHBOARD, revalidateOnFocus: true }
  );

  // Listen for topic completions and immediately revalidate
  useEffect(() => {
    function handler() { mutate(); }
    window.addEventListener('devmastery:progress-update', handler);
    return () => window.removeEventListener('devmastery:progress-update', handler);
  }, [mutate]);

  return {
    dashboard: (data as DashboardSummary) ?? EMPTY_DASHBOARD,
    isLoading: isLoading && !data,
    error,
  };
}

export function usePathProgress(pathSlug: string) {
  const { user, token } = useAuthStore();
  const userId = user?.id;

  return useSWR(
    userId ? [`${PROGRESS_API}/v1/paths/${pathSlug}/roadmap`, token] : null,
    ([url, t]) => authedFetcher(url, t as string | null),
    { fallbackData: null }
  );
}
