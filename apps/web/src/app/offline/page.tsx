import Link from 'next/link';
import { WifiOff } from 'lucide-react';

/**
 * Fallback page shown by the service worker when navigation happens while
 * offline and the requested route isn't cached. Any topic the learner has
 * already visited remains fully readable — this only appears on brand-new
 * routes that were never fetched.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6"
         style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full"
             style={{ background: 'var(--bg-surface)', color: 'var(--warning)' }}>
          <WifiOff size={26} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.6rem',
          letterSpacing: '-0.015em',
        }}>
          You&apos;re offline
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          Any topic you&apos;ve opened before will still load — DevMastery cached
          it for you. Head back to a recent topic or your dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/dashboard"
                className="px-3 py-1.5 rounded-md text-[13px]"
                style={{ background: 'var(--accent, #3FB950)', color: '#0D1117' }}>
            Open dashboard
          </Link>
          <Link href="/review"
                className="px-3 py-1.5 rounded-md border text-[13px]"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
            Spaced review
          </Link>
        </div>
      </div>
    </div>
  );
}

