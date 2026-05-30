'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps protected pages.
 * Waits for Zustand persist to rehydrate, then redirects to /login if not authenticated.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // While rehydrating, show a minimal full-screen loader
  if (!_hasHydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="flex flex-col items-center gap-3" style={{ color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={28} />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect is in progress; render nothing
    return null;
  }

  return <>{children}</>;
}

