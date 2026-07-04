'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { PathProgressSummary } from '@/hooks/useProgress';
import { PATH_META } from '@/lib/pathMeta';

interface PathCardProps {
  progress: PathProgressSummary;
}

export function PathCard({ progress }: PathCardProps) {
  const meta = PATH_META[progress.pathSlug];
  if (!meta) return null;

  const pct = progress.totalTopics > 0
    ? Math.round((progress.completedTopics / progress.totalTopics) * 100)
    : 0;

  const isStarted = progress.completedTopics > 0;
  const isComplete = pct === 100;

  return (
    <Link
      href={`/learn/${progress.pathSlug}/roadmap`}
      className="group relative rounded-[10px] border p-4 flex flex-col gap-3 transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.background = 'var(--bg-elevated)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.background = 'var(--bg-surface)';
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-9 h-9 rounded-md flex items-center justify-center text-[16px] shrink-0"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: meta.color,
            }}
          >
            {meta.emoji}
          </span>
          <div className="min-w-0">
            <h3
              className="text-[14px] font-medium tracking-tight truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {meta.label}
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {meta.group}
            </p>
          </div>
        </div>
        <ChevronRight
          size={14}
          className="shrink-0 mt-0.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>

      {/* Description */}
      <p className="text-[12.5px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {meta.description}
      </p>

      {/* Progress */}
      <div className="mt-auto">
        <div className="flex items-center justify-between text-[11.5px] mb-1.5">
          <span style={{ color: 'var(--text-secondary)' }}>
            {isStarted
              ? <span className="tabular-nums">{progress.completedTopics} / {progress.totalTopics} topics</span>
              : <span style={{ color: 'var(--text-muted)' }}>Not started</span>
            }
          </span>
          <span
            className="font-medium tabular-nums"
            style={{ color: isComplete ? 'var(--success)' : isStarted ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {pct}%
          </span>
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-inset)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: isComplete ? 'var(--success)' : 'var(--accent)',
            }}
          />
        </div>
      </div>

      {/* Status badge */}
      {isComplete ? (
        <span
          className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{
            background: 'color-mix(in oklab, var(--success) 15%, transparent)',
            border: '1px solid color-mix(in oklab, var(--success) 30%, transparent)',
            color: 'var(--success)',
          }}
        >
          <CheckCircle2 size={10} /> Complete
        </span>
      ) : isStarted ? (
        <span
          className="absolute top-3 right-3 text-[10px] font-medium px-1.5 py-0.5 rounded"
          style={{
            background: 'var(--accent-soft)',
            border: '1px solid var(--border-default)',
            color: 'var(--accent)',
          }}
        >
          In progress
        </span>
      ) : null}
    </Link>
  );
}

// Grid wrapper
interface PathGridProps {
  pathProgress: PathProgressSummary[];
}

export function PathGrid({ pathProgress }: PathGridProps) {
  const allPaths = Object.keys(PATH_META).map(slug => {
    const existing = pathProgress.find(p => p.pathSlug === slug);
    return existing ?? { pathSlug: slug, completedTopics: 0, totalTopics: 0, xpEarned: 0, lastStudied: null };
  });

  const sorted = [...allPaths].sort((a, b) => b.completedTopics - a.completedTopics);
  const startedCount = allPaths.filter(p => p.completedTopics > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="flex items-center gap-2 text-[15px] font-medium tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          <BookOpen size={15} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
          Your paths
        </h2>
        <span className="text-[12px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {startedCount} of {allPaths.length} started
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(p => (
          <PathCard key={p.pathSlug} progress={p} />
        ))}
      </div>
    </div>
  );
}
