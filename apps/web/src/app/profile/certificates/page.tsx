'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
interface Certificate {
  id: string;
  credentialId: string;
  pathSlug: string;
  pathTitle: string;
  issuedAt: string;
  totalTopics: number;
  avgQuizScore: number | null;
  pdfUrl: string | null;
  revoked: boolean;
}
const LEARNING_PATHS = [
  { slug: 'java-mastery', title: 'Java Mastery' },
  { slug: 'spring-boot', title: 'Spring Boot' },
  { slug: 'react', title: 'React' },
  { slug: 'system-design', title: 'System Design' },
  { slug: 'dsa', title: 'Data Structures & Algorithms' },
  { slug: 'projects', title: 'Real-World Projects' },
];
async function fetchCertificates(token: string): Promise<Certificate[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/certificates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}
async function claimCertificate(pathSlug: string, token: string): Promise<Certificate | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/certificates/${pathSlug}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Could not claim certificate.' }));
    throw new Error(err.message || 'Could not claim certificate.');
  }
  return res.json();
}
function VerdictBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const pct = Math.round(score);
  const color =
    pct >= 90 ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' :
    pct >= 70 ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30' :
                'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}>
      Quiz avg: {pct}%
    </span>
  );
}
export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const token = typeof window !== 'undefined'
    ? (sessionStorage.getItem('access_token') ?? '') : '';
  const loadCerts = useCallback((): Promise<Certificate[]> => {
    if (!token) return Promise.resolve([]);
    return fetchCertificates(token).then(data => { setCerts(data); return data; });
  }, [token]);
  useEffect(() => {
    loadCerts().finally(() => setLoading(false));
  }, [loadCerts]);
  useEffect(() => {
    const hasPending = certs.some(c => !c.revoked && !c.pdfUrl);
    if (hasPending && !pollRef.current) {
      pollRef.current = setInterval(() => {
        loadCerts().then(updated => {
          const stillPending = updated.some(c => !c.revoked && !c.pdfUrl);
          if (!stillPending && pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        });
      }, 4000);
    }
    if (!hasPending && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [certs, loadCerts]);
  const handleClaim = async (pathSlug: string) => {
    setError(null);
    setClaiming(pathSlug);
    try {
      const cert = await claimCertificate(pathSlug, token);
      if (cert) setCerts(prev => [cert, ...prev.filter(c => c.pathSlug !== pathSlug)]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setClaiming(null);
    }
  };
  const earnedSlugs = new Set(certs.filter(c => !c.revoked).map(c => c.pathSlug));
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">🎓 My Certificates</h1>
        <p className="text-muted-foreground text-sm">
          Complete all published topics in a learning path to earn a verifiable
          certificate. Share the public credential link with employers — no account required to verify.
        </p>
      </div>
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-700
          dark:text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-muted-foreground text-sm">Loading certificates…</div>
      ) : certs.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">Earned</h2>
          {certs.filter(c => !c.revoked).map(cert => (
            <div key={cert.id}
              className="rounded-2xl border bg-card p-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl">🏆</span>
                  <span className="font-semibold">{cert.pathTitle}</span>
                  <VerdictBadge score={cert.avgQuizScore} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Issued {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })} · {cert.totalTopics} topics completed
                </p>
                <div className="flex gap-3 mt-2 flex-wrap items-center">
                  <Link
                    href={`/certificates/verify/${cert.credentialId}`}
                    className="text-xs text-primary underline underline-offset-2"
                    target="_blank"
                  >
                    Public verification link ↗
                  </Link>
                  {cert.pdfUrl ? (
                    <a href={cert.pdfUrl} download
                      className="text-xs text-primary underline underline-offset-2">
                      Download PDF ↓
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4A12 12 0 014 12z"/>
                      </svg>
                      PDF being generated…
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-full bg-green-500/15 text-green-700 dark:text-green-400
                border border-green-500/30 px-3 py-1 text-xs font-semibold whitespace-nowrap">
                ✓ Verified
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="text-muted-foreground text-sm rounded-xl border border-dashed p-6 text-center">
          No certificates yet — complete a learning path to claim yours.
        </div>
      )}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Paths You Can Certify</h2>
        <p className="text-muted-foreground text-sm">
          If you have finished all topics in a path, click Claim to generate your certificate.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEARNING_PATHS.map(path => {
            const already = earnedSlugs.has(path.slug);
            return (
              <div key={path.slug}
                className="rounded-xl border bg-card p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{path.title}</p>
                  {already && (
                    <p className="text-xs text-green-600 dark:text-green-400">Certificate earned</p>
                  )}
                </div>
                {already ? (
                  <span className="text-xs text-muted-foreground">Done</span>
                ) : (
                  <button
                    onClick={() => handleClaim(path.slug)}
                    disabled={claiming === path.slug}
                    className="rounded-lg border border-primary text-primary px-3 py-1.5 text-xs
                      font-medium hover:bg-primary hover:text-primary-foreground transition-colors
                      disabled:opacity-50"
                  >
                    {claiming === path.slug ? 'Checking…' : 'Claim'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">How verification works</p>
        <p>Each certificate has a unique credentialId URL.</p>
        <p>Anyone can visit /certificates/verify/id — no login required.</p>
        <p>The page shows name, path, issue date, and topic count — all signed by DevMastery.</p>
        <p>A downloadable PDF is generated within seconds of claiming.</p>
      </section>
    </div>
  );
}
