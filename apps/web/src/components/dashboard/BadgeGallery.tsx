'use client';

import { Award, Lock } from 'lucide-react';
import { useMemo } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
}

interface BadgeGalleryProps {
  totalCompleted: number;
  streak: number;
}

export function BadgeGallery({ totalCompleted, streak }: BadgeGalleryProps) {
  // Compute badge unlock status based on progress
  const badges = useMemo<Badge[]>(() => [
    {
      id: 'first-steps',
      name: 'First Steps',
      description: 'Complete your first topic',
      icon: '🌱',
      isUnlocked: totalCompleted >= 1,
    },
    {
      id: 'streak-3',
      name: 'On Fire',
      description: 'Maintain a 3-day learning streak',
      icon: '🔥',
      isUnlocked: streak >= 3,
    },
    {
      id: 'ten-topics',
      name: 'Dedication',
      description: 'Complete 10 topics',
      icon: '📚',
      isUnlocked: totalCompleted >= 10,
    },
    {
      id: 'streak-7',
      name: 'Consistency',
      description: 'Maintain a 7-day learning streak',
      icon: '🗓️',
      isUnlocked: streak >= 7,
    },
    {
      id: 'fifty-topics',
      name: 'Scholar',
      description: 'Complete 50 topics',
      icon: '🎓',
      isUnlocked: totalCompleted >= 50,
    },
    {
      id: 'streak-30',
      name: 'Unstoppable',
      description: 'Maintain a 30-day learning streak',
      icon: '⚡',
      isUnlocked: streak >= 30,
    },
  ], [totalCompleted, streak]);

  return (
    <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Award size={18} className="text-yellow-400" />
        <h3 className="font-semibold text-[--text-primary] text-sm">Achievement Badges</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
              badge.isUnlocked 
                ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                : 'bg-[--bg-elevated] border-[--border-muted] opacity-60 grayscale'
            }`}
            title={badge.description}
          >
            <div className="text-3xl mb-2 relative">
              {badge.icon}
              {!badge.isUnlocked && (
                <div className="absolute -bottom-1 -right-1 bg-[--bg-surface] rounded-full p-0.5 border border-[--border-muted]">
                  <Lock size={10} className="text-[--text-muted]" />
                </div>
              )}
            </div>
            <span className={`text-xs font-semibold ${badge.isUnlocked ? 'text-yellow-400' : 'text-[--text-secondary]'}`}>
              {badge.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
