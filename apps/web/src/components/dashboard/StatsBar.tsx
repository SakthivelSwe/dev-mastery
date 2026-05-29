'use client';

import { Flame, Target, Zap, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  totalXp:       number;
  streak:        number;
  rank:          string;
  dailyXp:       number;
  dailyGoal:     number;
  totalCompleted: number;
}

const RANKS = [
  { label: 'Apprentice',       minXp: 0 },
  { label: 'Developer',        minXp: 1000 },
  { label: 'Mid Engineer',     minXp: 3000 },
  { label: 'Senior Engineer',  minXp: 6000 },
  { label: 'Tech Lead',        minXp: 12000 },
  { label: 'Staff Engineer',   minXp: 20000 },
  { label: 'Principal',        minXp: 35000 },
];

function getRank(xp: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) rank = r;
    else break;
  }
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  const progress = nextRank
    ? ((xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100
    : 100;
  return { current: rank, next: nextRank, progress };
}

export function StatsBar({ totalXp, streak, rank, dailyXp, dailyGoal, totalCompleted }: StatsBarProps) {
  const { current, next, progress } = getRank(totalXp);
  const dailyPct = Math.min(100, Math.round((dailyXp / dailyGoal) * 100));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

      {/* Streak */}
      <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
          <Flame size={24} className="text-orange-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[--text-primary]">{streak}<span className="text-base font-normal text-orange-400 ml-1">days</span></p>
          <p className="text-xs text-[--text-muted]">Study Streak</p>
        </div>
      </div>

      {/* Daily Goal Ring */}
      <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5 flex items-center gap-4">
        <div className="relative w-12 h-12 shrink-0">
          <svg viewBox="0 0 44 44" className="w-12 h-12 -rotate-90">
            <circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg-elevated)" strokeWidth="5" />
            <circle
              cx="22" cy="22" r="18" fill="none"
              stroke="var(--accent-java)" strokeWidth="5"
              strokeDasharray={`${(dailyPct / 100) * 113} 113`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[--text-primary]">
            {dailyPct}%
          </span>
        </div>
        <div>
          <p className="text-2xl font-bold text-[--text-primary]">{dailyXp}<span className="text-base font-normal text-[--text-muted] ml-1">/ {dailyGoal}</span></p>
          <p className="text-xs text-[--text-muted]">Daily XP Goal</p>
        </div>
      </div>

      {/* Total XP + Rank */}
      <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-[--accent-java]" />
          <span className="text-xs text-[--text-muted]">{current.label}</span>
          {next && <span className="text-xs text-[--text-muted]">→ {next.label}</span>}
        </div>
        <p className="text-2xl font-bold text-[--text-primary]">{totalXp.toLocaleString()} <span className="text-sm font-normal text-[--text-muted]">XP</span></p>
        <div className="mt-2 h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[--accent-java] to-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Topics Completed */}
      <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
          <TrendingUp size={24} className="text-green-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[--text-primary]">{totalCompleted}</p>
          <p className="text-xs text-[--text-muted]">Topics Mastered</p>
        </div>
      </div>
    </div>
  );
}
