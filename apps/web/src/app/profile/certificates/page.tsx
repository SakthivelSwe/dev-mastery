'use client';

import { useEffect, useState } from 'react';
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

function verdictBadge(score: number | null) {
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

  // Get token from session storage (set by auth flow)
  const token = typeof window !== 'undefined'
    ? (sessionStorage.getItem('access_token') ?? '') : '';

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchCertificates(token)
      .then(setCerts)
      .finally(() => setLoading(false));
  }, [token]);

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

      {/* Earned certificates */}
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
                  {verdictBadge(cert.avgQuizScore)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Issued {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })} · {cert.totalTopics} topics completed
                </p>
                <div className="flex gap-3 mt-2 flex-wrap">
                  <Link
                    href={`/certificates/verify/${cert.credentialId}`}
                    className="text-xs text-primary underline underline-offset-2"
                    target="_blank"
                  >
                    Public verification link ↗
                  </Link>
                  {cert.pdfUrl && (
                    <a href={cert.pdfUrl} download
                      className="text-xs text-primary underline underline-offset-2">
                      Download PDF ↓
                    </a>
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

      {/* Claimable paths */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Paths You Can Certify</h2>
        <p className="text-muted-foreground text-sm">
          If you've finished all topics in a path, click "Claim" to generate your certificate.
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
                    <p className="text-xs text-green-600 dark:text-green-400">✓ Certificate earned</p>
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

      {/* How it works */}
      <section className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">How verification works</p>
        <p>Each certificate has a unique <code className="text-xs bg-accent px-1 rounded">credentialId</code> URL.</p>
        <p>Anyone can visit <code className="text-xs bg-accent px-1 rounded">/certificates/verify/&lt;id&gt;</code> — no login required.</p>
        <p>The page shows your name, path, issue date, and topic count — all signed by DevMastery.</p>
      </section>
    </div>
  );
}

