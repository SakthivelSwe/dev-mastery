'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface XpNotificationProps {
  amount: number;
  reason: string;
  onComplete: () => void;
}

export function XpNotification({ amount, reason, onComplete }: XpNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 right-10 z-50 animate-bounce-up">
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-4 transform transition-all duration-500 ease-out">
        <div className="bg-white/20 p-2 rounded-full">
          <Sparkles className="text-yellow-300" size={24} />
        </div>
        <div>
          <div className="font-bold text-xl">+{amount} XP</div>
          <div className="text-emerald-100 text-sm">{reason}</div>
        </div>
      </div>
      
      {/* Required CSS for animation (should ideally be in global.css) */}
      <style jsx>{`
        @keyframes bounce-up {
          0% { transform: translateY(100px) scale(0.8); opacity: 0; }
          60% { transform: translateY(-20px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-bounce-up {
          animation: bounce-up 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
}
