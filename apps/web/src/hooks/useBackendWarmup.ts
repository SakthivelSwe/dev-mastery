'use client';

import { useEffect, useRef } from 'react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://devmastery-core.onrender.com';
// How often to ping (ms). 13 min — stays under Render's 15-min idle timer.
const INTERVAL_MS = 13 * 60 * 1000;

/**
 * useBackendWarmup
 *
 * Pings the backend's /actuator/health on first render (wakes the Render
 * free-tier service if it is sleeping) and then every 13 minutes to keep
 * it alive. This runs silently in the background with no UI impact.
 */
export function useBackendWarmup() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      if (cancelled) return;
      try {
        await fetch(`${BACKEND}/actuator/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(25_000), // 25 s — covers cold start
        });
      } catch {
        // Silently ignore — backend may still be booting
      }
      if (!cancelled) {
        timeoutRef.current = setTimeout(ping, INTERVAL_MS);
      }
    }

    // Initial ping immediately
    ping();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
}

