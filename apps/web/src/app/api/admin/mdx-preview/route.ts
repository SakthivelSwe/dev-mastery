import { NextRequest, NextResponse } from 'next/server';

// `next-mdx-remote/serialize` depends on @mdx-js/mdx which uses Node-only
// modules and cannot run on Cloudflare's Edge runtime. The admin preview
// is now rendered client-side via <MarkdownView/> (react-markdown), so
// this endpoint simply echoes the markdown back. Kept for back-compat so
// the existing admin editor continues to work.
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { mdxSource } = await req.json();
    return NextResponse.json({
      serialized: { compiledSource: '', frontmatter: {}, scope: {} },
      raw: mdxSource ?? '',
      warning: 'Server-side MDX serialize is disabled on Edge — preview renders client-side.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Unknown error' }, { status: 500 });
  }
}


