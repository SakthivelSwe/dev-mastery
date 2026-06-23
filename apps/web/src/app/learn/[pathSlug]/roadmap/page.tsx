'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { PathRoadmapResponse } from '@/components/roadmap/RoadmapCanvas';
import { RoadmapListView } from '@/components/roadmap/RoadmapListView';
import { fetchRoadmap } from '@/lib/api';
import { Loader2, Trophy, Target, Flame } from 'lucide-react';

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
        <div className="flex flex-col items-center gap-3 text-[--text-muted]">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-sm">Loading roadmap…</span>
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[--text-secondary]">
        <h2 className="text-lg">Failed to load roadmap data.</h2>
      </div>
    );
  }

  // ── Stats ──────────────────────────────────────────────
  let totalTopics = 0;
  let completedTopics = 0;
  roadmapData.levels.forEach(l => {
    totalTopics += l.topicCount;
    completedTopics += l.completedCount;
  });
  const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const nextLevel = roadmapData.levels.find(l => l.completedCount < l.topicCount);

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">

        {/* ── Hero Header ───────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-[--border-default] bg-gradient-to-br from-indigo-500/10 via-[--bg-surface] to-purple-500/5 p-8 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">
                <Target size={14} /> Learning Path
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold font-display text-[--text-primary] mb-3 leading-tight">
                {roadmapData.path.title}
              </h1>
              <p className="text-[--text-secondary] max-w-2xl">
                Master all <span className="text-[--text-primary] font-semibold">{roadmapData.path.totalTopics}</span> topics
                from Foundation to Expert. {nextLevel
                  ? <>Next up: <span className="text-indigo-400 font-medium">Level {nextLevel.level} — {nextLevel.label}</span></>
                  : <span className="text-emerald-400 font-medium">🎉 You&apos;ve mastered every level!</span>}
              </p>
            </div>

            {/* Stat Cards */}
            <div className="flex gap-3 shrink-0">
              <StatCard
                icon={<Flame size={16} className="text-orange-400" />}
                label="Progress"
                value={`${completionPercentage}%`}
                accent="text-emerald-400"
              />
              <StatCard
                icon={<Trophy size={16} className="text-amber-400" />}
                label="Topics Done"
                value={`${completedTopics} / ${totalTopics}`}
                accent="text-[--text-primary]"
              />
            </div>
          </div>

          {/* Big progress bar */}
          <div className="relative mt-8">
            <div className="h-2.5 bg-[--bg-elevated] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_18px_rgba(16,185,129,0.45)]"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[--text-muted]">
              <span>Start</span>
              <span>Mastery</span>
            </div>
          </div>
        </div>

        {/* ── List ───────────────────────────────────────────── */}
        <RoadmapListView data={roadmapData} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="bg-[--bg-elevated]/80 backdrop-blur-sm border border-[--border-default] rounded-xl px-5 py-3 min-w-[120px]">
      <div className="flex items-center gap-1.5 text-xs text-[--text-muted] mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}
