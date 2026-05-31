'use client';

import useSWR from 'swr';
import { useAuthStore } from '@/store/useAuthStore';

const PROGRESS_API = process.env.NEXT_PUBLIC_PROGRESS_API_URL || 'http://localhost:8083';
const CONTENT_API  = process.env.NEXT_PUBLIC_CONTENT_API_URL  || 'http://localhost:8082';

// ─── Fetcher ─────────────────────────────────────────────────

const fetcher = async (url: string, token?: string, userId?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
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

// ─── Default Data (used when starting or empty) ───────────

const EMPTY_DASHBOARD: DashboardSummary = {
  totalXp: 0,
  streak: 0,
  rank: 'Novice',
  dailyGoal: 200,
  dailyXp: 0,
  completedTopicsToday: 0,
  totalCompleted: 0,
  pathProgress: [],
  recentActivity: [],
};

// ─── Hooks ────────────────────────────────────────────────────

export function useDashboard() {
  const { user, token } = useAuthStore();
  const userId = user?.id;

  const { data, error, isLoading } = useSWR(
    userId ? [`${PROGRESS_API}/v1/progress/summary`, token, userId] : null,
    ([url, tok, uid]) => fetcher(url, tok ?? undefined, uid),
    { refreshInterval: 60_000, fallbackData: EMPTY_DASHBOARD }
  );

  // Merge API response with defaults so partial backend responses
  // (e.g. ProgressSummaryResponse) don't leave fields undefined in the UI.
  const merged: DashboardSummary = data
    ? { ...EMPTY_DASHBOARD, ...(data as Partial<DashboardSummary>) }
    : EMPTY_DASHBOARD;

  return {
    dashboard: merged,
    isLoading: isLoading && !data,
    error,
  };
}

export function usePathProgress(pathSlug: string) {
  const { user, token } = useAuthStore();
  const userId = user?.id;

  return useSWR(
    userId ? [`${PROGRESS_API}/v1/progress/path/${pathSlug}`, token, userId] : null,
    ([url, tok, uid]) => fetcher(url, tok ?? undefined, uid),
    { fallbackData: null }
  );
}
