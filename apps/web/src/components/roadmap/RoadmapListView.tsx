'use client';

import React, { useState } from 'react';
import type { PathRoadmapResponse } from './RoadmapCanvas';
import Link from 'next/link';
import { Check, Clock, Play, Code2, ChevronDown, Lock, Sparkles } from 'lucide-react';

interface RoadmapListViewProps {
  data: PathRoadmapResponse;
}

// Color accents per level — gives each tier a distinct vibe.
const LEVEL_ACCENTS: Record<number, { ring: string; text: string; glow: string; gradient: string }> = {
  1: { ring: 'ring-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-emerald-500/20', gradient: 'from-emerald-500/15 to-emerald-500/0' },
  2: { ring: 'ring-sky-500/40',     text: 'text-sky-400',     glow: 'shadow-sky-500/20',     gradient: 'from-sky-500/15 to-sky-500/0' },
  3: { ring: 'ring-indigo-500/40',  text: 'text-indigo-400',  glow: 'shadow-indigo-500/20',  gradient: 'from-indigo-500/15 to-indigo-500/0' },
  4: { ring: 'ring-purple-500/40',  text: 'text-purple-400',  glow: 'shadow-purple-500/20',  gradient: 'from-purple-500/15 to-purple-500/0' },
  5: { ring: 'ring-amber-500/40',   text: 'text-amber-400',   glow: 'shadow-amber-500/20',   gradient: 'from-amber-500/15 to-amber-500/0' },
};

export const RoadmapListView: React.FC<RoadmapListViewProps> = ({ data }) => {
  // Expand all levels by default — nothing is hidden, easier to scan.
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggleLevel = (level: number) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level); else next.add(level);
      return next;
    });
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {data.levels.map((lvl, idx) => {
        const isOpen = !collapsed.has(lvl.level);
        const pct = lvl.topicCount > 0 ? Math.round((lvl.completedCount / lvl.topicCount) * 100) : 0;
        const accent = LEVEL_ACCENTS[lvl.level] ?? LEVEL_ACCENTS[1];
        const prevLevelDone = idx === 0 || data.levels[idx - 1].completedCount === data.levels[idx - 1].topicCount;

        return (
          <section
            key={lvl.level}
            className="relative rounded-2xl border border-[--border-default] bg-[--bg-surface] overflow-hidden transition-shadow hover:shadow-xl"
          >
            {/* Accent gradient strip */}
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.gradient}`} />

            {/* ── Level header ─────────────────────────────── */}
            <button
              onClick={() => toggleLevel(lvl.level)}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-[--bg-elevated]/40 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-11 h-11 rounded-xl bg-[--bg-elevated] ring-1 ${accent.ring} ${accent.text} font-bold text-lg`}>
                  {lvl.level}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[--text-primary] flex items-center gap-2">
                    Level {lvl.level}: {lvl.label}
                    {!prevLevelDone && lvl.completedCount === 0 && (
                      <Lock size={13} className="text-[--text-muted]" />
                    )}
                    {lvl.completedCount === lvl.topicCount && lvl.topicCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles size={11} /> Mastered
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-[--text-muted] mt-0.5">
                    {lvl.topicCount} topics · ~{Math.max(1, Math.round(lvl.topics.reduce((s, t) => s + (t.estimatedMins || 0), 0) / 60))}h to complete
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs text-[--text-muted] mb-1">
                    <span className={accent.text + ' font-semibold'}>{lvl.completedCount}</span> / {lvl.topicCount}
                  </span>
                  <div className="w-32 h-1.5 bg-[--bg-elevated] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-[--text-muted] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* ── Topic grid ────────────────────────────────── */}
            {isOpen && (
              <div className="px-6 pb-6 pt-2 border-t border-[--border-default]/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {lvl.topics.map((topic, ti) => (
                    <Link
                      href={`/learn/${data.path.slug}/${topic.slug}`}
                      key={topic.slug}
                      className={`group relative p-4 border rounded-xl block transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        topic.completed
                          ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60'
                          : 'border-[--border-default] bg-[--bg-elevated]/30 hover:border-indigo-500/50 hover:bg-[--bg-elevated]/60'
                      }`}
                    >
                      {/* Number badge */}
                      <div className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-md bg-[--bg-elevated] border border-[--border-default] text-[10px] font-mono text-[--text-muted]">
                        {String(ti + 1).padStart(2, '0')}
                      </div>

                      <div className="flex items-start gap-3 mb-3 pr-8">
                        {topic.completed ? (
                          <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                            <Check size={12} className="text-emerald-400" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full border border-[--border-default] group-hover:border-indigo-500/60 transition-colors" />
                        )}
                        <h4 className={`font-semibold text-sm leading-snug ${topic.completed ? 'text-emerald-300' : 'text-[--text-primary] group-hover:text-white'}`}>
                          {topic.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[--bg-elevated] text-[--text-muted] rounded-md border border-[--border-default]/60">
                          <Clock size={10} /> {topic.estimatedMins}m
                        </span>
                        {topic.hasVisualizer && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-md border border-sky-500/20">
                            <Play size={10} /> Visualizer
                          </span>
                        )}
                        {topic.hasCodeLab && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
                            <Code2 size={10} /> Code Lab
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
