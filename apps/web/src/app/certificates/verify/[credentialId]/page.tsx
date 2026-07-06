import type { Metadata } from 'next';

interface Certificate {
  id: string;
  credentialId: string;
  userId: string;
  pathSlug: string;
  pathTitle: string;
  issuedAt: string;
  totalTopics: number;
  avgQuizScore: number | null;
  revoked: boolean;
}

async function getCertificate(credentialId: string): Promise<Certificate | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/certificates/verify/${credentialId}`,
      { next: { revalidate: 3600 } }  // cache for 1 hour
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: { credentialId: string } }
): Promise<Metadata> {
  const cert = await getCertificate(params.credentialId);
  if (!cert) return { title: 'Certificate Not Found — DevMastery' };
  return {
    title: `${cert.pathTitle} Certificate — DevMastery`,
    description: `Verified completion certificate for ${cert.pathTitle} issued by DevMastery on ${new Date(cert.issuedAt).toLocaleDateString()}.`,
    openGraph: {
      title: `${cert.pathTitle} Certificate — DevMastery`,
      description: `Verified learning certificate for ${cert.pathTitle}`,
    },
  };
}

export default async function CertificateVerifyPage(
  { params }: { params: { credentialId: string } }
) {
  const cert = await getCertificate(params.credentialId);

  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10
          p-8 text-center space-y-3">
          <div className="text-5xl">❌</div>
          <h1 className="text-xl font-semibold">Certificate Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This credential ID does not match any certificate in our system.
            It may have been revoked or the URL may be incorrect.
          </p>
        </div>
      </div>
    );
  }

  if (cert.revoked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-yellow-500/30
          bg-yellow-500/10 p-8 text-center space-y-3">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-semibold">Certificate Revoked</h1>
          <p className="text-sm text-muted-foreground">
            This certificate has been revoked. Please contact DevMastery support for details.
          </p>
        </div>
      </div>
    );
  }

  const issued = new Date(cert.issuedAt);
  const score  = cert.avgQuizScore !== null ? Math.round(cert.avgQuizScore) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20
      flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">

        {/* Certificate card */}
        <div className="rounded-3xl border-2 border-primary/30 bg-card shadow-2xl p-8
          text-center space-y-4 relative overflow-hidden">
          {/* decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />

          <div className="text-5xl">🎓</div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
              Certificate of Completion
            </p>
            <h1 className="text-2xl font-bold">{cert.pathTitle}</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            This certifies completion of the{' '}
            <span className="font-semibold text-foreground">{cert.pathTitle}</span>{' '}
            learning path on DevMastery, covering{' '}
            <span className="font-semibold">{cert.totalTopics}</span> topics
            {score !== null && (
              <> with an average quiz score of{' '}
                <span className="font-semibold">{score}%</span>
              </>
            )}.
          </p>

          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Issued{' '}
              {issued.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Verification badge */}
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10
          px-6 py-4 flex items-center gap-3">
          <div className="text-3xl">✅</div>
          <div>
            <p className="font-semibold text-green-700 dark:text-green-400 text-sm">
              Verified Authentic
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono break-all">
              ID: {cert.credentialId}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          This certificate was issued by{' '}
          <a href="https://devmastery.io" className="text-primary underline underline-offset-2">
            DevMastery
          </a>
          {' '}and can be independently verified at this URL.
        </p>
      </div>
    </div>
  );
}

