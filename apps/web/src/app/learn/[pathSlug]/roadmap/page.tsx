'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { PathRoadmapResponse } from '@/components/roadmap/RoadmapCanvas';
import { RoadmapListView } from '@/components/roadmap/RoadmapListView';
import { fetchRoadmap } from '@/lib/api';
import { Loader2, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PathRoadmapPage() {
  const params = useParams();
  const pathSlug = params.pathSlug as string;

  const [roadmapData, setRoadmapData] = useState<PathRoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchRoadmap(pathSlug);
        if (!cancelled && data) setRoadmapData(data as unknown as PathRoadmapResponse);
      } catch (error) {
        console.error('Failed to load roadmap:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pathSlug]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3" style={{ color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={22} style={{ color: 'var(--accent)' }} />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Loading roadmap…
          </span>
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ color: 'var(--text-secondary)' }}
      >
        <p className="text-[14px]">Failed to load roadmap data.</p>
      </div>
    );
  }

  let totalTopics = 0;
  let completedTopics = 0;
  roadmapData.levels.forEach(l => {
    totalTopics += l.topicCount;
    completedTopics += l.completedCount;
  });
  const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const nextLevel = roadmapData.levels.find(l => l.completedCount < l.topicCount);

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-8 pb-16">

        {/* ── Header ───────────────────────────────────────────── */}
        <div
          className="rounded-[14px] border p-6 sm:p-8 mb-8"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[12.5px] mb-4 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={13} />
            Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div>
              <div
                className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                <Target size={12} strokeWidth={1.75} />
                Learning path
              </div>
              <h1
                className="mb-3 text-balance"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                {roadmapData.path.title}
              </h1>
              <p className="text-[14px] max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                {roadmapData.path.totalTopics} topics from Foundation to Expert.{' '}
                {nextLevel ? (
                  <>Next up:{' '}
                    <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
                      Level {nextLevel.level} · {nextLevel.label}
                    </span>
                  </>
                ) : (
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>
                    Every level complete.
                  </span>
                )}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3 shrink-0">
              <MiniStat label="Progress" value={`${completionPct}%`} />
              <MiniStat label="Completed" value={`${completedTopics} / ${totalTopics}`} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-inset)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${completionPct}%`,
                  background:
                    completionPct === 100
                      ? 'var(--success)'
                      : 'var(--accent)',
                }}
              />
            </div>
            <div
              className="flex justify-between mt-1.5 text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Start</span>
              <span>Mastery</span>
            </div>
          </div>
        </div>

        {/* ── List ─────────────────────────────────────────────── */}
        <RoadmapListView data={roadmapData} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[10px] border px-4 py-2.5 min-w-[120px]"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div
        className="text-[10.5px] font-semibold uppercase tracking-widest mb-0.5"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
      <div
        className="text-[18px] font-medium tabular-nums"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
      >
        {value}
      </div>
    </div>
  );
}
