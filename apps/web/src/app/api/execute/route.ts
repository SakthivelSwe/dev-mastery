import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ─── Judge0 Configuration ──────────────────────────────────────────────────
// Supports three modes:
//   1. RapidAPI (Judge0 CE):  set JUDGE0_API_KEY + JUDGE0_API_HOST
//   2. Self-hosted Judge0:    set JUDGE0_API_URL to your instance
//   3. Execution service:     set JUDGE0_API_URL to your Spring Boot service /v1/execution/submit
//
// Free RapidAPI plan: https://rapidapi.com/judge0-official/api/judge0-ce (50 req/day free)
// ─────────────────────────────────────────────────────────────────────────────

const JUDGE0_API_URL  = process.env.JUDGE0_API_URL  || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY  = process.env.JUDGE0_API_KEY  || '';
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

const MAX_POLL_ATTEMPTS = 20;   // 20 × 500ms = 10 seconds max wait
const POLL_DELAY_MS     = 600;

function judge0Headers(): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (JUDGE0_API_KEY) {
    h['X-RapidAPI-Key']  = JUDGE0_API_KEY;
    h['X-RapidAPI-Host'] = JUDGE0_API_HOST;
  }
  return h;
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

  if (!JUDGE0_API_KEY && JUDGE0_API_URL.includes('rapidapi.com')) {
    return NextResponse.json({
      stdout: null, stderr: null, compileOutput: null,
      message: 'Code execution is not configured. Add JUDGE0_API_KEY to environment variables.\nGet a free key at: https://rapidapi.com/judge0-official/api/judge0-ce',
      statusId: 0, statusDescription: 'Not Configured',
      time: null, memory: null,
    }, { status: 200 });
  }

  // ── Step 1: Submit code ─────────────────────────────────────────────────
  let token: string;
  try {
    const submitRes = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: judge0Headers(),
      body: JSON.stringify({
        source_code: toBase64(sourceCode),
        language_id: languageId,
        stdin: toBase64(stdin),
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      return NextResponse.json({
        stdout: null, stderr: null, compileOutput: null,
        message: `Execution service error (${submitRes.status}): ${errText}`,
        statusId: submitRes.status, statusDescription: 'Submission Failed',
        time: null, memory: null,
      });
    }

    const submitData = await submitRes.json() as { token: string };
    token = submitData.token;
  } catch (err: any) {
    return NextResponse.json({
      stdout: null, stderr: null, compileOutput: null,
      message: `Failed to reach execution service: ${err?.message ?? 'Network error'}`,
      statusId: 0, statusDescription: 'Connection Error',
      time: null, memory: null,
    });
  }

  // ── Step 2: Poll for result ──────────────────────────────────────────────
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_DELAY_MS);

    try {
      const pollRes = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time,memory`,
        { headers: judge0Headers() }
      );

      if (!pollRes.ok) continue;

      const data = await pollRes.json() as {
        stdout?: string;
        stderr?: string;
        compile_output?: string;
        message?: string;
        status?: { id: number; description: string };
        time?: string;
        memory?: number;
      };

      const statusId = data.status?.id ?? 0;

      // 1 = In Queue, 2 = Processing — keep polling
      if (statusId === 1 || statusId === 2) continue;

      return NextResponse.json({
        stdout:            fromBase64(data.stdout),
        stderr:            fromBase64(data.stderr),
        compileOutput:     fromBase64(data.compile_output),
        message:           data.message ?? null,
        statusId,
        statusDescription: data.status?.description ?? 'Unknown',
        time:              data.time ? parseFloat(data.time) : null,
        memory:            data.memory ?? null,
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({
    stdout: null, stderr: null, compileOutput: null,
    message: 'Execution timed out. The code may still be running.',
    statusId: 0, statusDescription: 'Timeout',
    time: null, memory: null,
  });
}

