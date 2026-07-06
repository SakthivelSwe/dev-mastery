import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Proxy SSE stream from Render backend to the browser.
// Cloudflare Pages edge → Render /v1/ai/chat → Gemini streaming → browser
//
// No env vars needed — backend URL is hardcoded with env override.

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://devmastery-core.onrender.com';

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Forward Authorization header if present
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  const auth = req.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND}/v1/ai/chat`, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err: any) {
    const isTimeout = err?.name === 'TimeoutError';
    const data = `data: ${isTimeout
      ? "The AI service is warming up (cold start). Please wait ~30s and try again."
      : "I'm having trouble connecting right now. Please check that the AI service is running and try again."
    }\n\ndata: [DONE]\n\n`;
    return new Response(data, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }

  if (!upstream.ok || !upstream.body) {
    const errMsg = `data: Sorry, the AI service returned an error (${upstream.status}). Please try again.\n\ndata: [DONE]\n\n`;
    return new Response(errMsg, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  }

  // Stream the SSE response directly through to the browser
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

