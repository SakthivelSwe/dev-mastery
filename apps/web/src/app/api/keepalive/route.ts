import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Cloudflare Cron Trigger calls this every 14 minutes via wrangler.toml:
//   [triggers]
//   crons = ["*/14 * * * *"]
//
// It pings the Render backend's health endpoint to prevent the free-tier
// service from sleeping (Render spins down after 15 minutes of inactivity).

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://devmastery-core.onrender.com';

export async function GET(req: NextRequest) {
  // Security: only accept calls from Cloudflare cron or internal origin.
  const ua = req.headers.get('user-agent') ?? '';
  const isCloudflare = ua.includes('Cloudflare') || ua.includes('cron');
  const isInternal   = req.headers.get('x-keepalive-secret') === (process.env.KEEPALIVE_SECRET ?? 'devmastery-keepalive');

  if (!isCloudflare && !isInternal) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const start = Date.now();
  try {
    const res = await fetch(`${BACKEND_URL}/actuator/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(20_000), // 20 s — enough for a cold Render start
    });
    const ms = Date.now() - start;
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      backend: BACKEND_URL,
      latencyMs: ms,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const ms = Date.now() - start;
    return NextResponse.json({
      ok: false,
      error: err?.message ?? 'unknown',
      backend: BACKEND_URL,
      latencyMs: ms,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

