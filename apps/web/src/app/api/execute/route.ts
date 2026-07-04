import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ─── Judge0 Dual-Provider Configuration ───────────────────────────────────
//
// ONE API key — subscribed to BOTH providers on the same RapidAPI account.
// The route tries PRIMARY first; on rate-limit (429) or error it automatically
// falls back to SECONDARY. Zero downtime when one quota runs out.
//
// Provider 1 — judge029  (CodeArena Advanced Compiler)
//   https://rapidapi.com/dishis-technologies-judge0/api/judge029
// Provider 2 — judge0-ce (Judge0 CE — official)
//   https://rapidapi.com/judge0-official/api/judge0-ce
//
// Env vars (identical for local .env.local AND Cloudflare Pages env vars):
//   JUDGE0_API_KEY            = your RapidAPI key  (required)
//   JUDGE0_PRIMARY_URL        = https://judge029.p.rapidapi.com     (optional, this is default)
//   JUDGE0_PRIMARY_HOST       = judge029.p.rapidapi.com             (optional)
//   JUDGE0_FALLBACK_URL       = https://judge0-ce.p.rapidapi.com    (optional)
//   JUDGE0_FALLBACK_HOST      = judge0-ce.p.rapidapi.com            (optional)
// ─────────────────────────────────────────────────────────────────────────────

const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';

// Two providers — same key, different hosts
const PROVIDERS = [
  {
    url:  process.env.JUDGE0_PRIMARY_URL  || process.env.JUDGE0_API_URL  || 'https://judge029.p.rapidapi.com',
    host: process.env.JUDGE0_PRIMARY_HOST || process.env.JUDGE0_API_HOST || 'judge029.p.rapidapi.com',
    name: 'judge029',
  },
  {
    url:  process.env.JUDGE0_FALLBACK_URL  || 'https://judge0-ce.p.rapidapi.com',
    host: process.env.JUDGE0_FALLBACK_HOST || 'judge0-ce.p.rapidapi.com',
    name: 'judge0-ce',
  },
];

const MAX_POLL_ATTEMPTS = 20;
const POLL_DELAY_MS     = 600;

function headers(host: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-RapidAPI-Key':  JUDGE0_API_KEY,
    'X-RapidAPI-Host': host,
  };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toBase64(str: string): string {
  if (typeof btoa !== 'undefined') return btoa(unescape(encodeURIComponent(str)));
  return Buffer.from(str, 'utf-8').toString('base64');
}

function fromBase64(b64: string | null | undefined): string | null {
  if (!b64) return null;
  try {
    if (typeof atob !== 'undefined') return decodeURIComponent(escape(atob(b64)));
    return Buffer.from(b64, 'base64').toString('utf-8');
  } catch {
    return b64;
  }
}

// Submit to one provider — returns token or null (null = should try next provider)
async function submitToProvider(
  provider: typeof PROVIDERS[number],
  sourceCode: string,
  languageId: number,
  stdin: string
): Promise<{ token: string; providerName: string } | null> {
  try {
    const res = await fetch(`${provider.url}/submissions?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: headers(provider.host),
      body: JSON.stringify({
        source_code: toBase64(sourceCode),
        language_id: languageId,
        stdin: toBase64(stdin),
      }),
    });

    // 429 = rate limit → try next provider
    // 4xx/5xx other → try next provider
    if (!res.ok) {
      console.warn(`[execute] ${provider.name} submit failed (${res.status}), trying next provider`);
      return null;
    }

    const data = await res.json() as { token: string };
    if (!data?.token) return null;

    console.log(`[execute] submitted via ${provider.name}, token: ${data.token}`);
    return { token: data.token, providerName: provider.name };
  } catch (err) {
    console.warn(`[execute] ${provider.name} submit error:`, err);
    return null;
  }
}

// Poll one provider for results
async function pollProvider(
  provider: typeof PROVIDERS[number],
  token: string
): Promise<NextResponse | null> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_DELAY_MS);
    try {
      const res = await fetch(
        `${provider.url}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time,memory`,
        { headers: headers(provider.host) }
      );

      if (!res.ok) continue;

      const data = await res.json() as {
        stdout?: string;
        stderr?: string;
        compile_output?: string;
        message?: string;
        status?: { id: number; description: string };
        time?: string;
        memory?: number;
      };

      const statusId = data.status?.id ?? 0;
      if (statusId === 1 || statusId === 2) continue; // still processing

      return NextResponse.json({
        stdout:            fromBase64(data.stdout),
        stderr:            fromBase64(data.stderr),
        compileOutput:     fromBase64(data.compile_output),
        message:           data.message ?? null,
        statusId,
        statusDescription: data.status?.description ?? 'Unknown',
        time:              data.time ? parseFloat(data.time) : null,
        memory:            data.memory ?? null,
        _provider:         provider.name, // debug info
      });
    } catch {
      continue;
    }
  }
  return null; // timeout on this provider
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

  if (!JUDGE0_API_KEY) {
    return NextResponse.json({
      stdout: null, stderr: null, compileOutput: null,
      message: 'Code execution is not configured.\n\nAdd to .env.local (local) and Cloudflare Pages env vars (production):\n\nJUDGE0_API_KEY=your_rapidapi_key\nJUDGE0_PRIMARY_URL=https://judge029.p.rapidapi.com\nJUDGE0_PRIMARY_HOST=judge029.p.rapidapi.com\nJUDGE0_FALLBACK_URL=https://judge0-ce.p.rapidapi.com\nJUDGE0_FALLBACK_HOST=judge0-ce.p.rapidapi.com',
      statusId: 0, statusDescription: 'Not Configured',
      time: null, memory: null,
    });
  }

  // ── Try each provider in order until one succeeds ────────────────────────
  for (const provider of PROVIDERS) {
    const submission = await submitToProvider(provider, sourceCode, languageId, stdin);
    if (!submission) continue; // rate limited or error — try next

    const result = await pollProvider(provider, submission.token);
    if (result) return result; // got a result — done!

    // Poll timed out on this provider — try submitting to next provider
    console.warn(`[execute] ${provider.name} poll timed out, trying next provider`);
  }

  // All providers failed
  return NextResponse.json({
    stdout: null, stderr: null, compileOutput: null,
    message: 'Both execution providers are unavailable or quota exhausted. Please try again later.',
    statusId: 0, statusDescription: 'Unavailable',
    time: null, memory: null,
  });
}
