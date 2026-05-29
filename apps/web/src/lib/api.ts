// ============================================================
// DevMastery — API Client
// Handles all communication with Spring Boot microservices
// ============================================================

const CONTENT_API = process.env.NEXT_PUBLIC_CONTENT_API_URL || 'http://localhost:8082';
const PROGRESS_API = process.env.NEXT_PUBLIC_PROGRESS_API_URL || 'http://localhost:8083';

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
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
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
  timeSpentSecs: number
): Promise<boolean> {
  try {
    const res = await fetch(`${PROGRESS_API}/v1/progress/layer-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({ topicSlug, layer, timeSpentSecs }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
