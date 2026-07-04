import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ pathSlug: string }>;
}

/**
 * `/learn/[pathSlug]` has no content of its own — it always redirects to the
 * path's roadmap. This fixes the 404 users hit when they trim the URL down.
 */
export default async function PathIndexRoute({ params }: PageProps) {
  const { pathSlug } = await params;
  redirect(`/learn/${pathSlug}/roadmap`);
}

export const runtime = 'edge';

