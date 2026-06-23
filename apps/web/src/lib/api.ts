// ============================================================
// DevMastery — API Client
// Single base URL — talks to the devmastery-core modular monolith.
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
// Back-compat aliases so existing call sites keep working.
const CONTENT_API = API_BASE;
const PROGRESS_API = API_BASE;

// ─── Types ──────────────────────────────────────────────────

export interface TopicLayers {
  why:          string;
  theory:       string;
  visual:       string;
  code:         string;
  realWorld:    string;
  interview:    string;
  feynman:      string;
  build:        string;
  spacedReview: string;
}

export interface Topic {
  id:          string;
  slug:        string;
  title:       string;
  level:       number;
  pathSlug:    string;
  pathTitle:   string;
  layers:      TopicLayers;
  xpReward:    number;
  estimatedMins: number;
  tags:        string[];
}

export interface LearningPath {
  id:          string;
  slug:        string;
  title:       string;
  description: string;
  icon:        string;
  accentColor: string;
  totalTopics: number;
  topics:      TopicSummary[];
}

export interface TopicSummary {
  id:    string;
  slug:  string;
  title: string;
  level: number;
  order: number;
}

export interface PathProgress {
  pathSlug:        string;
  completedTopics: number;
  totalTopics:     number;
  percentComplete: number;
  xpEarned:        number;
}

export interface UserProgress {
  totalXp:        number;
  streak:         number;
  rank:           string;
  pathProgress:   PathProgress[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  date:      string;
  xpEarned:  number;
  topicsCompleted: number;
}

// ─── Content Service Calls ────────────────────────────────

export async function fetchTopic(slug: string): Promise<Topic | null> {
  try {
    const res = await fetch(`${CONTENT_API}/v1/topics/${slug}`, {
      // Always pull fresh content in dev so DB updates show up immediately.
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const raw = await res.json();
    // Backend returns `sections` with snake_case keys; frontend expects `layers` (camelCase).
    const s = raw.sections ?? raw.layers ?? {};
    const layers: TopicLayers = {
      why:          s.why          ?? '',
      theory:       s.theory       ?? '',
      visual:       s.visual       ?? '',
      code:         s.code         ?? '',
      realWorld:    s.real_world   ?? s.realWorld   ?? '',
      interview:    s.interview    ?? '',
      feynman:      s.feynman      ?? '',
      build:        s.build        ?? '',
      spacedReview: s.spaced_review ?? s.spacedReview ?? '',
    };
    return {
      id:           raw.id,
      slug:         raw.slug,
      title:        raw.title,
      level:        raw.level,
      pathSlug:     raw.pathSlug  ?? '',
      pathTitle:    raw.pathTitle ?? '',
      layers,
      xpReward:     raw.xpReward      ?? 10,
      estimatedMins: raw.estimatedMins ?? 25,
      tags:         raw.tags ?? [],
    };
  } catch {
    return null;
  }
}

export async function fetchPath(slug: string): Promise<LearningPath | null> {
  try {
    const res = await fetch(`${CONTENT_API}/v1/paths/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchAllPaths(): Promise<LearningPath[]> {
  try {
    const res = await fetch(`${CONTENT_API}/v1/paths`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ─── Roadmap ────────────────────────────────────────────────

export interface RoadmapTopic {
  slug: string;
  title: string;
  estimatedMins: number;
  completed: boolean;
  hasVisualizer: boolean;
  hasCodeLab: boolean;
}

export interface RoadmapLevel {
  level: number;
  label: string;
  topicCount: number;
  completedCount: number;
  topics: RoadmapTopic[];
}

export interface RoadmapResponse {
  path: { slug: string; title: string; totalTopics: number };
  levels: RoadmapLevel[];
}

/**
 * Fetch the roadmap for a learning path. Forwards the bearer token (if any) so
 * the backend can populate per-user "completed" flags.
 */
export async function fetchRoadmap(slug: string): Promise<RoadmapResponse | null> {
  try {
    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${CONTENT_API}/v1/paths/${slug}/roadmap`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function searchTopics(query: string): Promise<TopicSummary[]> {
  try {
    const res = await fetch(`${CONTENT_API}/v1/topics/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ─── Progress Service Calls ────────────────────────────────

export async function fetchUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const res = await fetch(`${PROGRESS_API}/v1/progress/summary`, {
      headers: { 'X-User-Id': userId },
      next: { revalidate: 60 }, // Refresh every minute
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function markLayerComplete(
  userId: string,
  topicSlug: string,
  layer: string,
  timeSpentSecs: number,
  token?: string | null
): Promise<boolean> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${PROGRESS_API}/v1/progress/layer-complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ topicSlug, layer, timeSpentSecs }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
