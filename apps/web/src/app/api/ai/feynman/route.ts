import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://devmastery-core.onrender.com';

export async function POST(req: NextRequest) {
  const body = await req.text();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const auth = req.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  try {
    const upstream = await fetch(`${BACKEND}/v1/ai/feynman/score`, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(30_000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { score: 5, passed: false, feedback: 'AI scoring service unavailable.', gaps: [] },
        { status: 200 }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { score: 5, passed: false, feedback: 'Could not reach AI scoring service. Please try again.', gaps: [] },
      { status: 200 }
    );
  }
}

