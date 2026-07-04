'use client';

import React, { useState } from 'react';
import type { PathRoadmapResponse } from './RoadmapCanvas';
import Link from 'next/link';
import { Check, Clock, Play, Code2, ChevronDown, Lock, CheckCircle2 } from 'lucide-react';

interface RoadmapListViewProps {
  data: PathRoadmapResponse;
}

const LEVEL_COLORS = ['var(--success)', 'var(--accent)', 'var(--accent-kotlin)', 'var(--warning)', 'var(--accent-java)'];

export const RoadmapListView: React.FC<RoadmapListViewProps> = ({ data }) => {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggle = (level: number) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level); else next.add(level);
      return next;
    });

  return (
    <div className="w-full flex flex-col gap-3">
      {data.levels.map((lvl, idx) => {
        const isOpen = !collapsed.has(lvl.level);
        const pct = lvl.topicCount > 0 ? Math.round((lvl.completedCount / lvl.topicCount) * 100) : 0;
        const levelColor = LEVEL_COLORS[(lvl.level - 1) % LEVEL_COLORS.length];
        const prevDone = idx === 0 || data.levels[idx - 1].completedCount === data.levels[idx - 1].topicCount;
        const isComplete = lvl.completedCount === lvl.topicCount && lvl.topicCount > 0;

        return (
          <section
            key={lvl.level}
            className="rounded-[10px] border overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
            }}
          >
            {/* Level header */}
            <button
              onClick={() => toggle(lvl.level)}
              className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-md border text-[14px] font-semibold tabular-nums shrink-0"
                  style={{
                    background: 'var(--bg-elevated)',
                    borderColor: 'var(--border-default)',
                    color: levelColor,
                    fontFamily: 'var(--font-code)',
                  }}
                >
                  {lvl.level}
                </span>
                <div>
                  <h3
                    className="text-[15px] font-medium flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Level {lvl.level}: {lvl.label}
                    {!prevDone && lvl.completedCount === 0 && (
                      <Lock size={12} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
                    )}
                    {isComplete && (
                      <span
                        className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: 'color-mix(in oklab, var(--success) 15%, transparent)',
                          border: '1px solid color-mix(in oklab, var(--success) 30%, transparent)',
                          color: 'var(--success)',
                        }}
                      >
                        <CheckCircle2 size={10} /> Complete
                      </span>
                    )}
                  </h3>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    {lvl.topicCount} topics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="hidden sm:flex flex-col items-end gap-1.5">
                  <span
                    className="text-[11px] tabular-nums"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span style={{ color: levelColor, fontWeight: 600 }}>{lvl.completedCount}</span>
                    {' / '}{lvl.topicCount}
                  </span>
                  <div
                    className="w-28 h-1 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-inset)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: isComplete ? 'var(--success)' : 'var(--accent)' }}
                    />
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  style={{ color: 'var(--text-muted)' }}
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Topic grid */}
            {isOpen && (
              <div
                className="px-5 pb-5 pt-2 border-t"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
                  {lvl.topics.map((topic, ti) => (
                    <Link
                      href={`/learn/${data.path.slug}/${topic.slug}`}
                      key={topic.slug}
                      className="group relative p-3.5 rounded-[8px] border block transition-all duration-150"
                      style={{
                        background: topic.completed
                          ? 'color-mix(in oklab, var(--success) 6%, var(--bg-elevated))'
                          : 'var(--bg-elevated)',
                        borderColor: topic.completed
                          ? 'color-mix(in oklab, var(--success) 30%, var(--border-default))'
                          : 'var(--border-default)',
                      }}
                      onMouseEnter={(e) => {
                        if (!topic.completed) e.currentTarget.style.borderColor = 'var(--border-strong)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = topic.completed
                          ? 'color-mix(in oklab, var(--success) 30%, var(--border-default))'
                          : 'var(--border-default)';
                      }}
                    >
                      {/* Number */}
                      <div
                        className="absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 rounded text-[9px] tabular-nums"
                        style={{
                          background: 'var(--bg-inset)',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-code)',
                        }}
                      >
                        {String(ti + 1).padStart(2, '0')}
                      </div>

                      <div className="flex items-start gap-2.5 mb-2.5 pr-7">
                        {topic.completed ? (
                          <div
                            className="shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              background: 'color-mix(in oklab, var(--success) 20%, transparent)',
                              border: '1px solid color-mix(in oklab, var(--success) 40%, transparent)',
                            }}
                          >
                            <Check size={9} strokeWidth={3} style={{ color: 'var(--success)' }} />
                          </div>
                        ) : (
                          <div
                            className="shrink-0 mt-0.5 w-4 h-4 rounded-full border transition-colors"
                            style={{ borderColor: 'var(--border-default)' }}
                          />
                        )}
                        <h4
                          className="text-[13px] font-medium leading-snug"
                          style={{ color: topic.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}
                        >
                          {topic.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded"
                          style={{
                            background: 'var(--bg-inset)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          <Clock size={9} /> {topic.estimatedMins}m
                        </span>
                        {topic.hasVisualizer && (
                          <span
                            className="inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded"
                            style={{
                              background: 'var(--accent-soft)',
                              color: 'var(--accent)',
                              border: '1px solid var(--border-default)',
                            }}
                          >
                            <Play size={9} /> Visualizer
                          </span>
                        )}
                        {topic.hasCodeLab && (
                          <span
                            className="inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded"
                            style={{
                              background: 'color-mix(in oklab, var(--warning) 10%, transparent)',
                              color: 'var(--warning)',
                              border: '1px solid color-mix(in oklab, var(--warning) 25%, transparent)',
                            }}
                          >
                            <Code2 size={9} /> Code
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
