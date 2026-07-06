import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ─── Judge0 Dual-Provider Execution ──────────────────────────────────────────
// Primary: judge0-ce  (Judge0 Official free tier, 50 req/day)
// Fallback: judge029  (dishis-technologies, 50 req/day)
// Both require RapidAPI subscription. Free plan link surfaced in error message.
// ─────────────────────────────────────────────────────────────────────────────

const API_KEY =
  process.env.JUDGE0_API_KEY ||
  'REDACTED_RAPIDAPI_KEY';

const PROVIDERS = [
  {
    name: 'judge0-ce',
    url:  process.env.JUDGE0_PRIMARY_URL  || 'https://judge0-ce.p.rapidapi.com',
    host: process.env.JUDGE0_PRIMARY_HOST || 'judge0-ce.p.rapidapi.com',
    subscribeUrl: 'https://rapidapi.com/judge0-official/api/judge0-ce/pricing',
  },
  {
    name: 'judge029',
    url:  process.env.JUDGE0_FALLBACK_URL  || 'https://judge029.p.rapidapi.com',
    host: process.env.JUDGE0_FALLBACK_HOST || 'judge029.p.rapidapi.com',
    subscribeUrl: 'https://rapidapi.com/dishis-technologies-judge0/api/judge029/pricing',
  },
];

const MAX_POLLS  = 15;
const POLL_DELAY = 600;

function rapidHeaders(host: string) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-RapidAPI-Key':  API_KEY,
    'X-RapidAPI-Host': host,
  };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function b64(s: string) {
  if (typeof btoa !== 'undefined') return btoa(unescape(encodeURIComponent(s)));
  return Buffer.from(s, 'utf-8').toString('base64');
}
function unb64(s: string | null | undefined): string | null {
  if (!s) return null;
  try {
    return typeof atob !== 'undefined'
      ? decodeURIComponent(escape(atob(s)))
      : Buffer.from(s, 'base64').toString('utf-8');
  } catch { return s; }
}

type ProviderErrKind = 'not_subscribed' | 'rate_limited' | 'invalid_key' | 'network' | 'other';
type ProviderError = { status: number; body: string; kind: ProviderErrKind };

function classify(status: number, body: string): ProviderErrKind {
  const l = body.toLowerCase();
  if (status === 403 && l.includes('not subscribed')) return 'not_subscribed';
  if (status === 429) return 'rate_limited';
  if (l.includes('quota') || l.includes('exceeded the daily') || l.includes('rate limit')) return 'rate_limited';
  if (status === 401 || l.includes('invalid api key')) return 'invalid_key';
  return 'other';
}

async function tryProvider(
  provider: typeof PROVIDERS[number],
  sourceCode: string,
  languageId: number,
  stdin: string
): Promise<{ ok: true; data: any } | { ok: false; err: ProviderError }> {
  let submitRes: Response;
  try {
    submitRes = await fetch(
      `${provider.url}/submissions?base64_encoded=true&wait=false`,
      {
        method: 'POST',
        headers: rapidHeaders(provider.host),
        body: JSON.stringify({
          source_code: b64(sourceCode),
          language_id: languageId,
          stdin: b64(stdin),
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch (e: any) {
    return { ok: false, err: { status: 0, body: e?.message ?? 'network error', kind: 'network' } };
  }

  if (!submitRes.ok) {
    const body = await submitRes.text().catch(() => '');
    return { ok: false, err: { status: submitRes.status, body, kind: classify(submitRes.status, body) } };
  }

  const submit = (await submitRes.json().catch(() => ({}))) as { token?: string };
  if (!submit.token) {
    return { ok: false, err: { status: 200, body: 'no token returned', kind: 'other' } };
  }

  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_DELAY);
    let pollRes: Response;
    try {
      pollRes = await fetch(
        `${provider.url}/submissions/${submit.token}?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time,memory`,
        { headers: rapidHeaders(provider.host), signal: AbortSignal.timeout(8_000) }
      );
    } catch { continue; }

    if (!pollRes.ok) {
      const body = await pollRes.text().catch(() => '');
      return { ok: false, err: { status: pollRes.status, body, kind: classify(pollRes.status, body) } };
    }

    const d = (await pollRes.json().catch(() => ({}))) as {
      stdout?: string; stderr?: string; compile_output?: string;
      message?: string; status?: { id: number; description: string };
      time?: string; memory?: number;
    };

    const statusId = d.status?.id ?? 0;
    if (statusId === 1 || statusId === 2) continue;

    return {
      ok: true,
      data: {
        stdout:            unb64(d.stdout),
        stderr:            unb64(d.stderr),
        compileOutput:     unb64(d.compile_output),
        message:           d.message ?? null,
        statusId,
        statusDescription: d.status?.description ?? 'Unknown',
        time:              d.time ? parseFloat(d.time) : null,
        memory:            d.memory ?? null,
        _provider:         provider.name,
      },
    };
  }
  return { ok: false, err: { status: 408, body: 'timeout waiting for result', kind: 'other' } };
}

export async function POST(req: NextRequest) {
  let body: { sourceCode: string; languageId: number; stdin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { sourceCode, languageId, stdin = '' } = body;
  if (!sourceCode || !languageId) {
    return NextResponse.json({ error: 'sourceCode and languageId are required' }, { status: 400 });
  }

  const errors: Array<{ provider: string; err: ProviderError; subscribeUrl: string }> = [];

  for (const provider of PROVIDERS) {
    const result = await tryProvider(provider, sourceCode, languageId, stdin);
    if (result.ok) return NextResponse.json(result.data);
    errors.push({ provider: provider.name, err: result.err, subscribeUrl: provider.subscribeUrl });
    console.warn(
      `[execute] ${provider.name} failed status=${result.err.status} kind=${result.err.kind} body=${result.err.body.slice(0, 200)}`
    );
  }

  const allNotSubscribed = errors.every(e => e.err.kind === 'not_subscribed');
  const anyRateLimit     = errors.some(e => e.err.kind === 'rate_limited');
  const anyInvalidKey    = errors.some(e => e.err.kind === 'invalid_key');

  let message: string;
  let actionUrl: string | null = null;

  if (allNotSubscribed) {
    message =
      'Code execution is not activated. The RapidAPI key is valid but not subscribed to Judge0. ' +
      'Open the link and click "Subscribe to Test" on the Basic (Free) plan — no credit card needed. Free tier: 50 executions/day.';
    actionUrl = errors[0].subscribeUrl;
  } else if (anyRateLimit) {
    message =
      'Daily execution quota exceeded (50/day on the free plan). Try again tomorrow, or subscribe to the second Judge0 provider for another 50/day.';
    actionUrl = errors.find(e => e.err.kind !== 'rate_limited')?.subscribeUrl ?? errors[0].subscribeUrl;
  } else if (anyInvalidKey) {
    message = 'RapidAPI key is invalid or revoked. Rotate the JUDGE0_API_KEY environment variable.';
  } else {
    const first = errors[0]?.err;
    message = `Execution failed on all providers. Last error [${first?.status}]: ${first?.body?.slice(0, 180) || 'unknown'}`;
  }

  return NextResponse.json(
    {
      stdout: null, stderr: null, compileOutput: null,
      message,
      actionUrl,
      statusId: 0,
      statusDescription: 'Unavailable',
      time: null, memory: null,
      _errors: errors.map(e => ({ provider: e.provider, status: e.err.status, kind: e.err.kind })),
    },
    { status: 200 }
  );
}
