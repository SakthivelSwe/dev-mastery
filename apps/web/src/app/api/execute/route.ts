import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ─── Code Execution — proxies to Render backend ───────────────────────────
//
// The Render backend (devmastery-core) already has JUDGE0_API_KEY set.
// This edge route just forwards the request — NO Judge0 keys needed here.
//
// Flow:
//   Browser → /api/execute (Cloudflare Pages Edge)
//           → NEXT_PUBLIC_API_URL/v1/execute  (Render backend)
//           → judge029 / judge0-ce (RapidAPI, with auto-fallback)
//
// Env var needed (already set everywhere):
//   NEXT_PUBLIC_API_URL = https://devmastery-core.onrender.com
// ─────────────────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://devmastery-core.onrender.com';

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

  try {
    const res = await fetch(`${BACKEND_URL}/v1/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceCode, languageId, stdin }),
      // 30s timeout — backend handles up to 10s of polling internally
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({
        stdout: null, stderr: null, compileOutput: null,
        message: `Backend error (${res.status}): ${text}`,
        statusId: res.status, statusDescription: 'Backend Error',
        time: null, memory: null,
      });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (err: any) {
    // Render free tier cold start can take ~30s — show helpful message
    const isTimeout = err?.name === 'TimeoutError' || err?.message?.includes('timeout');
    return NextResponse.json({
      stdout: null, stderr: null, compileOutput: null,
      message: isTimeout
        ? 'Execution service is warming up (Render free tier cold start). Please wait ~30s and try again.'
        : `Failed to reach execution service: ${err?.message ?? 'Network error'}`,
      statusId: 0,
      statusDescription: isTimeout ? 'Cold Start' : 'Connection Error',
      time: null, memory: null,
    });
  }
}
