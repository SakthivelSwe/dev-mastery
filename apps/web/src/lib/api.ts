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
      // Topic content changes rarely and the backend has both Caffeine +
      // Cache-Control (public, max-age=600, SWR=3600). Let Next's data
      // cache honour it — huge win on Render free-tier cold starts.
      next: { revalidate: 600, tags: [`topic:${slug}`] },
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

export async function markTopicComplete(
  userId: string,
  topicSlug: string,
  token?: string | null
): Promise<boolean> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    else if (typeof window !== 'undefined') {
      const t = localStorage.getItem('auth_token');
      if (t) headers['Authorization'] = `Bearer ${t}`;
    }
    const res = await fetch(`${CONTENT_API}/v1/topics/${topicSlug}/complete`, {
      method: 'POST',
      headers,
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Spaced Review ─────────────────────────────────────────

export interface ReviewItem {
  topicId:      string;
  topicSlug:    string | null;
  dueDate:      string;      // ISO date
  repetitions:  number;
  easeFactor:   number;
}

/** Fetch topics whose spaced-repetition schedule is due today or earlier. */
export async function fetchDueReviews(token?: string | null): Promise<ReviewItem[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    else if (typeof window !== 'undefined') {
      const t = localStorage.getItem('auth_token');
      if (t) headers['Authorization'] = `Bearer ${t}`;
    }
    const res = await fetch(`${PROGRESS_API}/v1/progress/reviews/due`, { headers, cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Submit a 1–5 SM-2 recall rating for a topic just reviewed. */
export async function submitReviewRating(
  topicId: string,
  rating: number,
  token?: string | null,
): Promise<boolean> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    else if (typeof window !== 'undefined') {
      const t = localStorage.getItem('auth_token');
      if (t) headers['Authorization'] = `Bearer ${t}`;
    }
    const res = await fetch(`${PROGRESS_API}/v1/progress/reviews/${topicId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rating }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Interview Sessions ────────────────────────────────────

export interface InterviewTranscriptTurn {
  role:    'user' | 'model';
  content: string;
  at?:     string;  // ISO8601
}

export interface InterviewScoreCard {
  verdict:         string;   // reject | lean_no | lean_yes | strong_hire
  technical:       number;   // 1..10
  communication:   number;
  problemSolving:  number;
  seniority:       number;
  strengths:       string[];
  improvements:    string[];
}

export interface InterviewSessionSummary {
  id:          string;
  topicSlug:   string;
  targetLevel: string;
  startedAt:   string;
  endedAt:     string | null;
  verdict:     string | null;
}

export interface InterviewSessionDetail {
  summary:    InterviewSessionSummary;
  transcript: InterviewTranscriptTurn[];
  scoreCard:  InterviewScoreCard | null;
}

function authHeaders(token?: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  else if (typeof window !== 'undefined') {
    const t = localStorage.getItem('auth_token');
    if (t) h['Authorization'] = `Bearer ${t}`;
  }
  return h;
}

/** Persist a completed mock interview. */
export async function saveInterviewSession(payload: {
  topicSlug:   string;
  targetLevel: string;
  startedAt:   string;
  endedAt:     string;
  transcript:  InterviewTranscriptTurn[];
  scoreCard?:  InterviewScoreCard | null;
}, token?: string | null): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/interviews`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const json = await res.json() as { id: string };
    return json.id ?? null;
  } catch {
    return null;
  }
}

/** List the user's past mock interviews (newest first). */
export async function fetchInterviewHistory(token?: string | null): Promise<InterviewSessionSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/v1/interviews`, {
      headers: authHeaders(token),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Fetch a single mock interview by session id. */
export async function fetchInterviewSession(
  sessionId: string,
  token?: string | null,
): Promise<InterviewSessionDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/interviews/${sessionId}`, {
      headers: authHeaders(token),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Parse and store the AI interviewer's markdown scorecard. */
export async function gradeInterviewSession(
  sessionId: string,
  scorecardText: string,
  token?: string | null,
): Promise<InterviewScoreCard | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/interviews/${sessionId}/grade`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ scorecardText }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Delete the user's account and all associated data. */
export async function deleteAccount(token?: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/v1/auth/me`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return res.ok;
  } catch {
    return false;
  }
}
