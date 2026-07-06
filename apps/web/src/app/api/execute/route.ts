import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ─── Piston-based Code Execution ─────────────────────────────────────────────
//
// This route proxies to a Piston server — the open-source code-execution
// sandbox from engineer-man/piston. No API key, no rate limit, no vendor lock-in.
//
// Deploy Piston yourself in ~5 minutes (see /deploy/piston/README.md):
//   • Fly.io  — free tier, one command:  fly launch --image ghcr.io/engineer-man/piston
//   • Render  — free web service with the same image
//   • Any VPS — docker run -p 2000:2000 ghcr.io/engineer-man/piston
//
// Then set PISTON_URL in your environment (Cloudflare Pages + local .env.local):
//   PISTON_URL=https://your-piston.fly.dev
//
// JavaScript & Python don't even hit this route — they run in the browser.
// ─────────────────────────────────────────────────────────────────────────────

const PISTON_URL = process.env.PISTON_URL || '';

// Fallback: if PISTON_URL isn't set, forward to the Spring Boot backend's
// in-process executor (currently supports Java only — see LocalExecutor.java).
// Same URL your other /api/ai/* edge routes already talk to.
const RENDER_API_URL =
  process.env.RENDER_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://devmastery-core.onrender.com';

/** Maps our language keys → Piston runtime + a sensible default version. */
const PISTON_MAP: Record<string, { language: string; version: string; filename: string }> = {
  java:       { language: 'java',       version: '15.0.2',  filename: 'Main.java' },
  kotlin:     { language: 'kotlin',     version: '1.8.20',  filename: 'main.kt'   },
  cpp:        { language: 'c++',        version: '10.2.0',  filename: 'main.cpp'  },
  c:          { language: 'c',          version: '10.2.0',  filename: 'main.c'    },
  go:         { language: 'go',         version: '1.16.2',  filename: 'main.go'   },
  rust:       { language: 'rust',       version: '1.68.2',  filename: 'main.rs'   },
  typescript: { language: 'typescript', version: '5.0.3',   filename: 'main.ts'   },
  sql:        { language: 'sqlite3',    version: '3.36.0',  filename: 'main.sql'  },
};

type PistonResponse = {
  language?: string;
  version?: string;
  run?:     { stdout?: string; stderr?: string; output?: string; code?: number; signal?: string | null };
  compile?: { stdout?: string; stderr?: string; output?: string; code?: number };
};

export async function POST(req: NextRequest) {
  let body: { sourceCode?: string; source?: string; language?: string; stdin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const sourceCode = body.sourceCode ?? body.source ?? '';
  const stdin      = body.stdin ?? '';
  const langKey    = (body.language ?? '').toLowerCase();

  if (!sourceCode || !langKey) {
    return NextResponse.json({ error: 'sourceCode and language are required' }, { status: 400 });
  }

  // JS / Python should never hit the server — they run in the browser.
  if (langKey === 'javascript' || langKey === 'python') {
    return NextResponse.json({
      stdout: null, stderr: null, compileOutput: null,
      message: `Language "${langKey}" is executed client-side in your browser — no backend needed.`,
      statusId: 0, statusDescription: 'Client-side only',
      time: null, memory: null, runtime: 'browser',
    });
  }

  const mapped = PISTON_MAP[langKey];
  if (!mapped) {
    return NextResponse.json({
      stdout: null, stderr: null, compileOutput: null,
      message: `Language "${langKey}" is not supported yet. Supported: ${Object.keys(PISTON_MAP).join(', ')}, javascript, python.`,
      statusId: 0, statusDescription: 'Unsupported Language',
      time: null, memory: null, runtime: 'unavailable',
    });
  }

  if (!PISTON_URL) {
    // No Piston — try the Spring Boot backend's built-in executor.
    // It currently only handles Java, but that covers the primary DevMastery use case.
    const backendResult = await tryRenderBackend(langKey, sourceCode, stdin);
    if (backendResult) return NextResponse.json(backendResult);

    return NextResponse.json({
      stdout: null, stderr: null, compileOutput: null,
      message:
        `Server-side execution for "${langKey}" is not available on this deployment. ` +
        'JavaScript & Python already run in your browser. For compiled languages beyond Java, ' +
        'deploy Piston in ~5 minutes (see deploy/piston/README.md) and set the PISTON_URL environment variable.',
      statusId: 0,
      statusDescription: 'Runtime Not Deployed',
      time: null, memory: null,
      runtime: 'unavailable',
      actionUrl: 'https://github.com/engineer-man/piston#running-a-piston-server',
    });
  }

  // Call Piston /api/v2/execute
  let res: Response;
  try {
    res = await fetch(`${PISTON_URL.replace(/\/$/, '')}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: mapped.language,
        version:  mapped.version,
        files:    [{ name: mapped.filename, content: sourceCode }],
        stdin,
        compile_timeout: 10000,
        run_timeout:     10000,
        compile_memory_limit: -1,
        run_memory_limit:     -1,
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e: any) {
    return NextResponse.json({
      stdout: null, stderr: null, compileOutput: null,
      message: `Could not reach the Piston server at ${PISTON_URL}. Is it running? (${e?.message ?? 'network error'})`,
      statusId: 0, statusDescription: 'Runtime Unreachable',
      time: null, memory: null,
      runtime: 'unavailable',
    });
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return NextResponse.json({
      stdout: null, stderr: null, compileOutput: null,
      message: `Piston returned HTTP ${res.status}. ${errText.slice(0, 200)}`,
      statusId: 0, statusDescription: 'Runtime Error',
      time: null, memory: null,
      runtime: 'unavailable',
    });
  }

  const p = (await res.json().catch(() => ({}))) as PistonResponse;
  const compileErr = p.compile?.stderr || p.compile?.output || null;
  const runOut     = p.run?.stdout || null;
  const runErr     = p.run?.stderr || null;
  const exitCode   = p.run?.code ?? 0;
  const signal     = p.run?.signal ?? null;

  const isTimeout = signal === 'SIGKILL' || signal === 'SIGTERM';
  const compileFailed = !!compileErr && (!p.compile || (p.compile.code ?? 0) !== 0);

  let statusId = 3, statusDescription = 'Accepted';
  if (compileFailed)    { statusId = 6; statusDescription = 'Compilation Error'; }
  else if (isTimeout)   { statusId = 5; statusDescription = 'Time Limit Exceeded'; }
  else if (exitCode !== 0) { statusId = 4; statusDescription = 'Runtime Error'; }

  return NextResponse.json({
    stdout:            runOut,
    stderr:            runErr,
    compileOutput:     compileErr,
    message:           null,
    statusId,
    statusDescription,
    time:              null,   // Piston doesn't report wall time
    memory:            null,
    runtime:           'piston',
    _pistonVersion:    p.version ?? null,
  });
}

/**
 * Fallback: forward to the Spring Boot backend's built-in executor
 * (`POST /v1/execute` — implemented by `LocalExecutor.java`).
 * Currently supports Java only.
 * Returns null on network / unsupported-language errors so the caller can
 * fall through to the "not configured" message.
 */
async function tryRenderBackend(
  language: string,
  sourceCode: string,
  stdin: string,
): Promise<any | null> {
  const SUPPORTED = new Set(['java']);
  if (!SUPPORTED.has(language)) return null;

  try {
    const res = await fetch(`${RENDER_API_URL.replace(/\/$/, '')}/v1/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: sourceCode, language, stdin }),
      // Render free tier cold starts can take 30-45 s.
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
