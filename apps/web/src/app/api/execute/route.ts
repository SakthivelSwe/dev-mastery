import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ─── Judge0 Dual-Provider with hardcoded fallback key ─────────────────────
// API key is server-side only (never sent to browser).
// Primary: judge029  → Fallback: judge0-ce  (auto-switches on any error/429)
// ─────────────────────────────────────────────────────────────────────────────

const API_KEY =
  process.env.JUDGE0_API_KEY ||
  'REDACTED_RAPIDAPI_KEY'; // RapidAPI key

const PROVIDERS = [
  {
    name: 'judge029',
    url:  process.env.JUDGE0_PRIMARY_URL  || 'https://judge029.p.rapidapi.com',
    host: process.env.JUDGE0_PRIMARY_HOST || 'judge029.p.rapidapi.com',
  },
  {
    name: 'judge0-ce',
    url:  process.env.JUDGE0_FALLBACK_URL  || 'https://judge0-ce.p.rapidapi.com',
    host: process.env.JUDGE0_FALLBACK_HOST || 'judge0-ce.p.rapidapi.com',
  },
];

const MAX_POLLS    = 20;
const POLL_DELAY   = 700; // ms

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

async function submitCode(provider: typeof PROVIDERS[number], sourceCode: string, languageId: number, stdin: string) {
  try {
    const res = await fetch(
      `${provider.url}/submissions?base64_encoded=true&wait=false`,
      {
        method: 'POST',
        headers: rapidHeaders(provider.host),
        body: JSON.stringify({
          source_code: b64(sourceCode),
          language_id: languageId,
          stdin: b64(stdin),
        }),
        signal: AbortSignal.timeout(8_000),
      }
    );
    if (!res.ok) {
      console.warn(`[execute] ${provider.name} submit HTTP ${res.status}`);
      return null;
    }
    const data = await res.json() as { token?: string };
    return data?.token ?? null;
  } catch (e: any) {
    console.warn(`[execute] ${provider.name} submit error: ${e?.message}`);
    return null;
  }
}

async function pollResult(provider: typeof PROVIDERS[number], token: string) {
  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_DELAY);
    try {
      const res = await fetch(
        `${provider.url}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time,memory`,
        { headers: rapidHeaders(provider.host), signal: AbortSignal.timeout(6_000) }
      );
      if (!res.ok) continue;

      const d = await res.json() as {
        stdout?: string; stderr?: string; compile_output?: string;
        message?: string; status?: { id: number; description: string };
        time?: string; memory?: number;
      };

      const statusId = d.status?.id ?? 0;
      if (statusId === 1 || statusId === 2) continue; // still queued/running

      return NextResponse.json({
        stdout:            unb64(d.stdout),
        stderr:            unb64(d.stderr),
        compileOutput:     unb64(d.compile_output),
        message:           d.message ?? null,
        statusId,
        statusDescription: d.status?.description ?? 'Unknown',
        time:              d.time ? parseFloat(d.time) : null,
        memory:            d.memory ?? null,
        _provider:         provider.name,
      });
    } catch { continue; }
  }
  return null;
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

  // Try each provider in order — first success wins
  for (const provider of PROVIDERS) {
    const token = await submitCode(provider, sourceCode, languageId, stdin);
    if (!token) continue;

    const result = await pollResult(provider, token);
    if (result) return result;
  }

  return NextResponse.json({
    stdout: null, stderr: null, compileOutput: null,
    message: 'Both Judge0 providers failed. Check RapidAPI quota or try again.',
    statusId: 0, statusDescription: 'Unavailable',
    time: null, memory: null,
  });
}
