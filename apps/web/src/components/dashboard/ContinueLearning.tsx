'use client';

import Link from 'next/link';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import type { PathProgressSummary } from '@/hooks/useProgress';
import { PATH_META } from '@/lib/pathMeta';

interface ContinueLearningProps {
  pathProgress: PathProgressSummary[];
}

export function ContinueLearning({ pathProgress }: ContinueLearningProps) {
  const recent = [...pathProgress]
    .filter(p => p.completedTopics > 0 && p.lastStudied)
    .sort((a, b) => {
      if (!a.lastStudied) return 1;
      if (!b.lastStudied) return -1;
      return new Date(b.lastStudied).getTime() - new Date(a.lastStudied).getTime();
    })
    .slice(0, 3);

  const suggested = pathProgress
    .filter(p => p.completedTopics === 0)
    .slice(0, 2);

  if (recent.length === 0) {
    return (
      <aside
        className="rounded-[10px] border p-5 text-center"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
      >
        <BookOpen size={22} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <h3
          className="text-[14px] font-medium mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Nothing in progress yet
        </h3>
        <p className="text-[12.5px] mb-4" style={{ color: 'var(--text-secondary)' }}>
          Pick a path and start with its first topic.
        </p>
        <Link href="/learn/java-mastery/roadmap" className="btn-primary text-[13px] px-3 py-1.5">
          Open Java <ArrowRight size={13} />
        </Link>
      </aside>
    );
  }

  return (
    <aside
      className="rounded-[10px] border p-4"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      <h3
        className="flex items-center gap-2 text-[14px] font-medium mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        <Clock size={14} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
        Continue learning
      </h3>

      <div className="space-y-1">
        {recent.map(p => {
          const meta = PATH_META[p.pathSlug];
          if (!meta) return null;
          const pct = Math.round((p.completedTopics / p.totalTopics) * 100);

          return (
            <Link
              key={p.pathSlug}
              href={`/learn/${p.pathSlug}/roadmap`}
              className="flex items-center gap-3 p-2.5 rounded-md transition-colors group"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span
                className="w-8 h-8 rounded-md flex items-center justify-center text-[14px] shrink-0"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: meta.color,
                }}
              >
                {meta.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[13px] font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {meta.label}
                  </span>
                  <span
                    className="text-[11px] tabular-nums shrink-0"
                    style={{ color: 'var(--accent)' }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  className="h-1 rounded-full mt-1.5 overflow-hidden"
                  style={{ background: 'var(--bg-inset)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: 'var(--accent)' }}
                  />
                </div>
                <p
                  className="text-[10.5px] mt-1 tabular-nums"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {p.completedTopics} / {p.totalTopics} topics
                </p>
              </div>
              <ArrowRight
                size={13}
                className="shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                style={{ color: 'var(--text-secondary)' }}
              />
            </Link>
          );
        })}
      </div>

      {suggested.length > 0 && (
        <div
          className="mt-4 pt-4 border-t"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Try next
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {suggested.map(p => {
              const meta = PATH_META[p.pathSlug];
              if (!meta) return null;
              return (
                <Link
                  key={p.pathSlug}
                  href={`/learn/${p.pathSlug}/roadmap`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                  }}
                >
                  <span style={{ color: meta.color }}>{meta.emoji}</span>
                  {meta.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
