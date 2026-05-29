'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Zap, BookOpen } from 'lucide-react';
import type { PathProgressSummary } from '@/hooks/useProgress';
import { PATH_META } from '@/lib/pathMeta';

interface ContinueLearningProps {
  pathProgress: PathProgressSummary[];
}

export function ContinueLearning({ pathProgress }: ContinueLearningProps) {
  // Find the most recently studied in-progress path
  const recent = [...pathProgress]
    .filter(p => p.completedTopics > 0 && p.lastStudied)
    .sort((a, b) => {
      if (!a.lastStudied) return 1;
      if (!b.lastStudied) return -1;
      return new Date(b.lastStudied).getTime() - new Date(a.lastStudied).getTime();
    })
    .slice(0, 3);

  // Suggested next: highest-started but not 100% complete
  const suggested = pathProgress
    .filter(p => p.completedTopics === 0)
    .slice(0, 2);

  if (recent.length === 0) {
    return (
      <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-6 text-center">
        <BookOpen size={32} className="mx-auto mb-3 text-[--text-muted]" />
        <h3 className="font-semibold text-[--text-primary] mb-2">Start Your Journey</h3>
        <p className="text-sm text-[--text-muted] mb-4">Pick a learning path and begin mastering your first topic today.</p>
        <Link
          href="/learn/java-mastery/roadmap"
          className="inline-flex items-center gap-2 bg-[--accent-ai] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
        >
          Start with Java <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5">
      <h3 className="font-semibold text-[--text-primary] mb-4 flex items-center gap-2 text-sm">
        <Clock size={16} className="text-[--accent-ai]" />
        Continue Learning
      </h3>

      <div className="space-y-3">
        {recent.map(p => {
          const meta = PATH_META[p.pathSlug];
          if (!meta) return null;
          const pct = Math.round((p.completedTopics / p.totalTopics) * 100);

          return (
            <Link
              key={p.pathSlug}
              href={`/learn/${p.pathSlug}/roadmap`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[--bg-elevated] transition-colors group"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: `${meta.color}20` }}
              >
                {meta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[--text-primary] truncate">{meta.label}</span>
                  <span className="text-xs font-semibold shrink-0" style={{ color: meta.color }}>{pct}%</span>
                </div>
                <div className="h-1 bg-[--bg-elevated] rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: meta.color }}
                  />
                </div>
                <p className="text-[11px] text-[--text-muted] mt-1">{p.completedTopics} / {p.totalTopics} topics</p>
              </div>
              <ArrowRight size={14} className="text-[--text-muted] shrink-0 group-hover:text-[--text-secondary] group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>

      {suggested.length > 0 && (
        <>
          <div className="mt-4 pt-4 border-t border-[--border-muted]">
            <p className="text-[11px] text-[--text-muted] mb-3 uppercase tracking-wider font-medium">Explore Next</p>
            <div className="flex gap-2 flex-wrap">
              {suggested.map(p => {
                const meta = PATH_META[p.pathSlug];
                if (!meta) return null;
                return (
                  <Link
                    key={p.pathSlug}
                    href={`/learn/${p.pathSlug}/roadmap`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105"
                    style={{
                      background: `${meta.color}12`,
                      borderColor: `${meta.color}30`,
                      color: meta.color,
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
