// ============================================================
// DevMastery — API Client
// Handles all communication with Spring Boot microservices
// ============================================================

const CONTENT_API  = process.env.NEXT_PUBLIC_CONTENT_API_URL  || 'http://localhost:8082';
const PROGRESS_API = process.env.NEXT_PUBLIC_PROGRESS_API_URL || 'http://localhost:8083';
export const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081';

/**
 * Normalize a path slug so it always uses hyphens, never underscores.
 * Guards against slugs coming from the URL or the progress service
 * with underscores (e.g. "spring_boot" → "spring-boot").
 */
export function normalizeSlug(slug: string): string {
  return slug.replace(/_/g, '-');
}

// ─── Auth Headers Helper ─────────────────────────────────────
// Reads from Zustand persist store (localStorage) safely at call time

function getAuthHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem('devmastery-auth');
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    const token: string | undefined = parsed?.state?.token;
    const userId: string | undefined = parsed?.state?.user?.id;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['X-User-Id'] = userId;
    return headers;
  } catch {
    return {};
  }
}

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
  id:            string;
  slug:          string;
  title:         string;
  level:         number;
  pathSlug:      string;
  pathTitle:     string;
  layers:        TopicLayers;
  xpReward:      number;
  estimatedMins: number;
  tags:          string[];
}

// Raw backend response (before transformation)
interface BackendLesson {
  sectionType: string;
  contentMdx:  string;
}

interface BackendTopicResponse {
  id:            string;
  slug:          string;
  title:         string;
  description:   string;
  pathSlug:      string;
  pathTitle:     string;
  level:         number;
  estimatedMins: number;
  xpReward?:     number;
  tags?:         string[];
  lessons:       BackendLesson[];
  codeExamples?: unknown[];
}

/** Map sectionType → layers key */
function mapSectionToLayerKey(sectionType: string): keyof TopicLayers | null {
  const m: Record<string, keyof TopicLayers> = {
    'why':         'why',
    'theory':      'theory',
    'visual':      'visual',
    'code':        'code',
    'realworld':   'realWorld',
    'real-world':  'realWorld',
    'realWorld':   'realWorld',
    'interview':   'interview',
    'feynman':     'feynman',
    'build':       'build',
    'spacedreview':'spacedReview',
    'spaced-review':'spacedReview',
    'spacedReview': 'spacedReview',
  };
  return m[sectionType] ?? null;
}

/** Transform raw backend TopicResponse → frontend Topic */
function transformTopic(raw: BackendTopicResponse): Topic {
  const layers: TopicLayers = {
    why: '', theory: '', visual: '', code: '',
    realWorld: '', interview: '', feynman: '', build: '', spacedReview: '',
  };

  (raw.lessons ?? []).forEach((lesson) => {
    const key = mapSectionToLayerKey(lesson.sectionType);
    if (key) layers[key] = lesson.contentMdx ?? '';
  });

  return {
    id:            raw.id,
    slug:          raw.slug,
    title:         raw.title,
    level:         raw.level,
    pathSlug:      raw.pathSlug,
    pathTitle:     raw.pathTitle,
    layers,
    xpReward:      raw.xpReward ?? 50,
    estimatedMins: raw.estimatedMins ?? 20,
    tags:          raw.tags ?? [],
  };
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
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return null;
    const raw: BackendTopicResponse = await res.json();
    return transformTopic(raw);
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
    const raw = await res.json();
    // Backend PathResponse uses orderIndex, frontend uses order
    const topics: TopicSummary[] = (raw.topics ?? []).map((t: any) => ({
      id:    t.id    ?? '',
      slug:  t.slug  ?? '',
      title: t.title ?? '',
      level: t.level ?? 1,
      order: t.orderIndex ?? t.order ?? 0,
    }));
    return {
      id:          raw.id          ?? '',
      slug:        raw.slug        ?? slug,
      title:       raw.title       ?? '',
      description: raw.description ?? '',
      icon:        raw.icon        ?? '',
      accentColor: raw.accentColor ?? '',
      totalTopics: raw.totalTopics ?? topics.length,
      topics,
    };
  } catch {
    return null;
  }
}

// ─── Path Roadmap (levels view) ──────────────────────────────

export interface TopicRoadmapItem {
  slug:          string;
  title:         string;
  estimatedMins: number;
  completed:     boolean;
  hasVisualizer: boolean;
  hasCodeLab:    boolean;
}

export interface LevelRoadmap {
  level:          number;
  label:          string;
  topicCount:     number;
  completedCount: number;
  topics:         TopicRoadmapItem[];
}

export interface PathRoadmapData {
  path: {
    slug:        string;
    title:       string;
    totalTopics: number;
  };
  levels: LevelRoadmap[];
}

export async function fetchPathRoadmap(slug: string): Promise<PathRoadmapData | null> {
  // Normalize slug: always use hyphens (guards against underscore slugs in URLs)
  const normalizedSlug = normalizeSlug(slug);
  try {
    const headers = getAuthHeaders();
    // NOTE: `next: { revalidate }` is a Server Component hint — omit it here
    // because this function is called from a 'use client' component.
    const res = await fetch(`${CONTENT_API}/v1/paths/${normalizedSlug}/roadmap`, {
      headers,
      // Disable browser cache so a fresh request is always made on retry
      cache: 'no-store',
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
    const rawPaths = await res.json();
    return (rawPaths as any[]).map(raw => ({
      id:          raw.id          ?? '',
      slug:        raw.slug        ?? '',
      title:       raw.title       ?? '',
      description: raw.description ?? '',
      icon:        raw.icon        ?? '',
      accentColor: raw.accentColor ?? '',
      totalTopics: raw.totalTopics ?? 0,
      topics:      [],  // not populated in list view
    }));
  } catch {
    return [];
  }
}

export async function searchTopics(query: string): Promise<TopicSummary[]> {
  try {
    const res = await fetch(`${CONTENT_API}/v1/search/topics?q=${encodeURIComponent(query)}`);
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
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
  topicId: string,
  layer: string,
  timeSpentSecs: number
): Promise<boolean> {
  try {
    const res = await fetch(`${PROGRESS_API}/v1/progress/layers/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ topicId, layerName: layer }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
