'use client';

import { Flame, Target, Zap, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  totalXp:        number;
  streak:         number;
  rank:           string;
  dailyXp:        number;
  dailyGoal:      number;
  totalCompleted: number;
}

const RANKS = [
  { label: 'Apprentice',      minXp: 0 },
  { label: 'Developer',       minXp: 1000 },
  { label: 'Mid engineer',    minXp: 3000 },
  { label: 'Senior engineer', minXp: 6000 },
  { label: 'Tech lead',       minXp: 12000 },
  { label: 'Staff engineer',  minXp: 20000 },
  { label: 'Principal',       minXp: 35000 },
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

export function StatsBar({ streak, dailyXp, dailyGoal, totalXp, totalCompleted }: StatsBarProps) {
  const { current, next, progress } = getRank(totalXp);
  const dailyPct = Math.min(100, Math.round((dailyXp / Math.max(1, dailyGoal)) * 100));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">

      {/* Streak */}
      <Tile
        icon={<Flame size={16} strokeWidth={1.75} />}
        label="Day streak"
        value={`${streak}`}
        unit="days"
        accent="var(--warning)"
      />

      {/* Daily goal */}
      <div
        className="rounded-[10px] border p-4 flex items-center gap-3"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
      >
        <div className="relative w-10 h-10 shrink-0">
          <svg viewBox="0 0 44 44" className="w-10 h-10 -rotate-90">
            <circle cx="22" cy="22" r="18" fill="none"
              stroke="var(--bg-elevated)" strokeWidth="4" />
            <circle cx="22" cy="22" r="18" fill="none"
              stroke="var(--accent)" strokeWidth="4"
              strokeDasharray={`${(dailyPct / 100) * 113} 113`}
              strokeLinecap="round" />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {dailyPct}%
          </span>
        </div>
        <div className="min-w-0">
          <p
            className="text-[11px] uppercase tracking-widest font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            Daily goal
          </p>
          <p
            className="text-[20px] font-medium tabular-nums"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            {dailyXp}
            <span className="text-[13px] ml-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              / {dailyGoal} XP
            </span>
          </p>
        </div>
      </div>

      {/* Total XP + Rank */}
      <div
        className="rounded-[10px] border p-4"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
      >
        <div className="flex items-center gap-2">
          <Zap size={14} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
          <span className="text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
            {current.label}
          </span>
          {next && (
            <span className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
              → {next.label}
            </span>
          )}
        </div>
        <p
          className="mt-1 text-[20px] font-medium tabular-nums"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {totalXp.toLocaleString()}
          <span className="text-[12px] ml-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            XP
          </span>
        </p>
        <div
          className="mt-2 h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Topics completed */}
      <Tile
        icon={<TrendingUp size={16} strokeWidth={1.75} />}
        label="Topics completed"
        value={`${totalCompleted}`}
        accent="var(--success)"
      />
    </div>
  );
}

function Tile({
  icon, label, value, unit, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-[10px] border p-4 flex items-center gap-3"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      <span
        className="inline-flex w-9 h-9 rounded-md items-center justify-center shrink-0"
        style={{
          background: `color-mix(in oklab, ${accent} 12%, transparent)`,
          color: accent,
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className="text-[11px] uppercase tracking-widest font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
        <p
          className="text-[20px] font-medium tabular-nums"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {value}
          {unit && (
            <span className="text-[13px] ml-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {unit}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
