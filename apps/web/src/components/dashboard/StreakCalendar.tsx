'use client';

import { useMemo } from 'react';
import { Calendar } from 'lucide-react';

interface ActivityItem {
  date:   string;
  xp:     number;
  topics: number;
}

interface StreakCalendarProps {
  activity: ActivityItem[];
  streak:   number;
}

function getIntensity(xp: number): number {
  if (xp === 0)   return 0;
  if (xp < 50)    return 1;
  if (xp < 150)   return 2;
  if (xp < 250)   return 3;
  return 4;
}

const INTENSITY_COLORS = [
  'bg-[--bg-elevated]',                         // 0 — no activity
  'bg-amber-900/60',                             // 1 — minimal
  'bg-amber-700/70',                             // 2 — light
  'bg-amber-500/80',                             // 3 — good
  'bg-[--accent-java]',                          // 4 — great
];

export function StreakCalendar({ activity, streak }: StreakCalendarProps) {
  // Build a 90-day grid (13 weeks × 7 days, right-aligned to today)
  const grid = useMemo(() => {
    const activityMap = new Map<string, ActivityItem>();
    activity.forEach(a => activityMap.set(a.date, a));

    const today = new Date('2026-05-29');
    const weeks: { date: string; xp: number; topics: number }[][] = [];
    let currentWeek: { date: string; xp: number; topics: number }[] = [];

    // Start from 90 days ago
    const start = new Date(today);
    start.setDate(start.getDate() - 89);

    // Pad the first week with empty days
    const startDow = start.getDay(); // 0=Sun
    for (let i = 0; i < startDow; i++) {
      currentWeek.push({ date: '', xp: -1, topics: 0 });
    }

    for (let i = 0; i < 90; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const a = activityMap.get(dateStr);
      currentWeek.push({ date: dateStr, xp: a?.xp ?? 0, topics: a?.topics ?? 0 });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  }, [activity]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[--text-primary] flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-orange-400" />
          Activity — Last 90 Days
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-[--text-muted]">
          <span>Less</span>
          {INTENSITY_COLORS.map((cls, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1 pt-5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="w-3 h-3 text-[9px] text-[--text-muted] flex items-center justify-center">
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>

        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={day.xp > 0 ? `${day.date}: ${day.xp}XP, ${day.topics} topics` : day.date || ''}
                className={`w-3 h-3 rounded-sm transition-all duration-150 hover:ring-1 hover:ring-[--text-muted]/40 cursor-default ${
                  day.xp === -1 ? 'opacity-0' : INTENSITY_COLORS[getIntensity(day.xp)]
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Streak info */}
      <div className="mt-4 pt-4 border-t border-[--border-muted] flex items-center justify-between text-xs text-[--text-muted]">
        <span>
          🔥 <span className="font-semibold text-orange-400">{streak} day</span> streak
        </span>
        <span>90 days of activity</span>
      </div>
    </div>
  );
}
