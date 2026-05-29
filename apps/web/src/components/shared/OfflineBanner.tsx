'use client';

import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check initial state
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-red-500/90 text-white px-4 py-2.5 rounded-full shadow-lg shadow-red-500/20 backdrop-blur-sm border border-red-400"
      >
        <WifiOff size={18} />
        <span className="text-sm font-medium">
          You are offline. Some features may be unavailable.
        </span>
        <button 
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
