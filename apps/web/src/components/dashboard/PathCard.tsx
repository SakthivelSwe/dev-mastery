'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
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

  return (
    <Link
      href={`/learn/${progress.pathSlug}/roadmap`}
      className="group relative bg-[--bg-surface] border border-[--border-default] rounded-2xl p-5 flex flex-col gap-3 hover:border-[--text-muted]/30 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* Gradient top accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        style={{ background: `linear-gradient(90deg, ${meta.color}80, ${meta.color}20)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}30` }}
          >
            {meta.emoji}
          </div>
          <div>
            <h3 className="font-semibold text-[--text-primary] text-sm leading-tight group-hover:text-white transition-colors">
              {meta.label}
            </h3>
            <p className="text-[--text-muted] text-[11px] mt-0.5">{meta.group}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-[--text-muted] shrink-0 mt-0.5 group-hover:text-[--text-secondary] group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Description */}
      <p className="text-[--text-muted] text-xs leading-relaxed">{meta.description}</p>

      {/* Progress Footer */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-[--text-secondary]">
            {isStarted
              ? <span>{progress.completedTopics} / {progress.totalTopics} topics</span>
              : <span className="text-[--text-muted]">Not started</span>
            }
          </span>
          <span
            className="font-bold"
            style={{ color: pct === 100 ? '#3FB950' : pct > 0 ? meta.color : 'var(--text-muted)' }}
          >
            {pct}%
          </span>
        </div>
        <div className="h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct === 100
                ? 'var(--success)'
                : `linear-gradient(90deg, ${meta.color}, ${meta.color}80)`,
            }}
          />
        </div>
      </div>

      {/* CTA Badge */}
      {isStarted && pct < 100 && (
        <div
          className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}30` }}
        >
          In Progress
        </div>
      )}
      {pct === 100 && (
        <div className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          ✓ Complete
        </div>
      )}
    </Link>
  );
}

// Grid wrapper for all 18 path cards
interface PathGridProps {
  pathProgress: PathProgressSummary[];
}

export function PathGrid({ pathProgress }: PathGridProps) {
  // Ensure all 18 paths appear, even those with 0 progress
  const allPaths = Object.keys(PATH_META).map(slug => {
    const existing = pathProgress.find(p => p.pathSlug === slug);
    return existing ?? { pathSlug: slug, completedTopics: 0, totalTopics: 0, xpEarned: 0, lastStudied: null };
  });

  // Sort: in-progress first, then not-started
  const sorted = [...allPaths].sort((a, b) => {
    if (b.completedTopics !== a.completedTopics) return b.completedTopics - a.completedTopics;
    return 0;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[--text-primary] flex items-center gap-2">
          <BookOpen size={18} className="text-[--accent-ai]" />
          Your Learning Paths
        </h2>
        <span className="text-xs text-[--text-muted]">
          {allPaths.filter(p => p.completedTopics > 0).length} / {allPaths.length} started
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map(p => (
          <PathCard key={p.pathSlug} progress={p} />
        ))}
      </div>
    </div>
  );
}
