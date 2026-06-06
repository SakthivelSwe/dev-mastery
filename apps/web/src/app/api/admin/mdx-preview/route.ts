export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'next-mdx-remote/serialize';

export async function POST(req: NextRequest) {
  try {
    const { mdxSource } = await req.json();
    const serialized = await serialize(mdxSource || '');
    return NextResponse.json({ serialized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
