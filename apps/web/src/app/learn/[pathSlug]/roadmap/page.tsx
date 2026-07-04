'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { PathRoadmapResponse } from '@/components/roadmap/RoadmapCanvas';
import { RoadmapListView } from '@/components/roadmap/RoadmapListView';
import { fetchRoadmap } from '@/lib/api';
import { Loader2, Target, ArrowLeft, Sparkles, BookOpen, Trophy } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div
              className="w-12 h-12 rounded-full"
              style={{
                background: 'var(--accent-soft)',
                border: '1px solid var(--border-default)',
              }}
            />
            <Loader2
              className="animate-spin absolute inset-0 m-auto"
              size={22}
              style={{ color: 'var(--accent)' }}
            />
          </div>
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
            Loading roadmap…
          </span>
        </motion.div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
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
      {/* Ambient background glow */}
      <div
        className="fixed top-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{ background: 'var(--gradient-glow)', zIndex: 0 }}
      />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-8 pb-20" style={{ zIndex: 1 }}>

        {/* ── Header Card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-[18px] border mb-8 overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
            borderColor: 'var(--border-default)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
          }}
        >
          {/* Top accent bar */}
          <div
            className="h-[2px] w-full"
            style={{ background: 'var(--gradient-accent)' }}
          />

          <div className="p-6 sm:p-8">
            {/* Back link */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium mb-5 transition-all duration-150 group"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              Dashboard
            </Link>

            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
              <div className="flex-1 min-w-0">
                {/* Eyebrow */}
                <div
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] mb-3"
                  style={{ color: 'var(--accent)' }}
                >
                  <Target size={11} strokeWidth={2.5} />
                  Learning Path
                </div>

                {/* Title */}
                <h1
                  className="mb-3 text-balance"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                    fontWeight: 800,
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                  }}
                >
                  {roadmapData.path.title}
                </h1>

                {/* Description */}
                <p
                  className="text-[14px] leading-relaxed max-w-xl"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  {roadmapData.path.totalTopics} topics from Foundation to Expert.{' '}
                  {nextLevel ? (
                    <>
                      Next up:{' '}
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--accent)' }}
                      >
                        Level {nextLevel.level} · {nextLevel.label}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold" style={{ color: 'var(--success)' }}>
                      <Sparkles size={12} className="inline mr-1" />
                      Every level complete!
                    </span>
                  )}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-3 shrink-0">
                <MiniStat
                  label="Progress"
                  value={`${completionPct}%`}
                  icon={<Target size={13} />}
                  accent={completionPct === 100 ? 'var(--success)' : 'var(--accent)'}
                />
                <MiniStat
                  label="Completed"
                  value={`${completedTopics} / ${totalTopics}`}
                  icon={<BookOpen size={13} />}
                  accent="var(--accent)"
                />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-7">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-default)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                  style={{
                    background: completionPct === 100
                      ? 'linear-gradient(90deg, var(--success), #86efac)'
                      : 'var(--gradient-accent)',
                    boxShadow: completionPct > 0 ? '0 0 10px var(--accent-glow)' : 'none',
                  }}
                />
              </div>
              <div
                className="flex justify-between mt-2 text-[11px] font-medium"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                <span>Start</span>
                <span className="flex items-center gap-1">
                  <Trophy size={10} />
                  Mastery
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Level List ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <RoadmapListView data={roadmapData} />
        </motion.div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="rounded-[12px] border px-4 py-3 min-w-[120px]"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] mb-1"
        style={{ color: accent || 'var(--text-muted)' }}
      >
        {icon}
        {label}
      </div>
      <div
        className="text-[20px] font-extrabold tabular-nums"
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
    </motion.div>
  );
}
