'use client';

import React, { useState } from 'react';
import type { PathRoadmapResponse } from './RoadmapCanvas';
import Link from 'next/link';
import { Check, Clock, Play, Code2, ChevronDown, Lock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapListViewProps {
  data: PathRoadmapResponse;
}

const LEVEL_GRADIENTS = [
  'linear-gradient(135deg, #62C97A, #4ade80)',
  'linear-gradient(135deg, #7C8FF0, #A78BFA)',
  'linear-gradient(135deg, #A87EF5, #C084FC)',
  'linear-gradient(135deg, #D4A655, #FBBF24)',
  'linear-gradient(135deg, #F0A04B, #FB923C)',
];

const LEVEL_COLORS = ['var(--success)', 'var(--accent)', 'var(--accent-kotlin)', 'var(--warning)', 'var(--accent-java)'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const levelVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const topicGridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const topicCardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
  },
};

export const RoadmapListView: React.FC<RoadmapListViewProps> = ({ data }) => {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggle = (level: number) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level); else next.add(level);
      return next;
    });

  return (
    <motion.div
      className="w-full flex flex-col gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {data.levels.map((lvl, idx) => {
        const isOpen = !collapsed.has(lvl.level);
        const pct = lvl.topicCount > 0 ? Math.round((lvl.completedCount / lvl.topicCount) * 100) : 0;
        const levelColor = LEVEL_COLORS[(lvl.level - 1) % LEVEL_COLORS.length];
        const levelGradient = LEVEL_GRADIENTS[(lvl.level - 1) % LEVEL_GRADIENTS.length];
        const prevDone = idx === 0 || data.levels[idx - 1].completedCount === data.levels[idx - 1].topicCount;
        const isComplete = lvl.completedCount === lvl.topicCount && lvl.topicCount > 0;
        const isLocked = !prevDone && lvl.completedCount === 0;

        return (
          <motion.section
            key={lvl.level}
            variants={levelVariants}
            className="rounded-[14px] border overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
              boxShadow: isOpen
                ? '0 4px 20px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.3)'
                : 'var(--shadow-sm)',
            }}
          >
            {/* Level header */}
            <button
              onClick={() => toggle(lvl.level)}
              className="w-full px-5 py-4 flex items-center justify-between text-left transition-all duration-200"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-4">
                {/* Level badge */}
                <div className="relative shrink-0">
                  <span
                    className="flex items-center justify-center w-10 h-10 rounded-[10px] text-[14px] font-extrabold tabular-nums shrink-0"
                    style={{
                      background: isComplete ? levelGradient : 'var(--bg-elevated)',
                      border: isComplete ? 'none' : `1px solid var(--border-default)`,
                      color: isComplete ? '#08090F' : levelColor,
                      fontFamily: 'var(--font-display)',
                      boxShadow: isComplete ? `0 2px 10px color-mix(in oklab, ${levelColor} 30%, transparent)` : 'none',
                    }}
                  >
                    {isLocked ? <Lock size={14} strokeWidth={2.5} /> : lvl.level}
                  </span>
                  {isComplete && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: 'var(--success)',
                        boxShadow: '0 0 6px rgba(98, 201, 122, 0.5)',
                      }}
                    >
                      <Check size={9} strokeWidth={3} color="#08090F" />
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    className="text-[15px] font-bold flex items-center gap-2"
                    style={{
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Level {lvl.level}
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>·</span>
                    {lvl.label}
                    {isLocked && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-muted)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <Lock size={9} /> Locked
                      </span>
                    )}
                    {isComplete && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: 'color-mix(in oklab, var(--success) 12%, transparent)',
                          border: '1px solid color-mix(in oklab, var(--success) 28%, transparent)',
                          color: 'var(--success)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <CheckCircle2 size={9} /> Complete
                      </span>
                    )}
                  </h3>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                  >
                    {lvl.topicCount} topics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                {/* Progress mini */}
                <div className="hidden sm:flex flex-col items-end gap-2">
                  <span
                    className="text-[11px] font-semibold tabular-nums"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                  >
                    <span style={{ color: levelColor }}>{lvl.completedCount}</span>
                    <span style={{ color: 'var(--text-muted)' }}> / {lvl.topicCount}</span>
                  </span>
                  <div
                    className="w-24 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-inset)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 + idx * 0.06 }}
                      style={{
                        background: isComplete ? 'var(--success)' : levelGradient,
                      }}
                    />
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <ChevronDown
                    size={16}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </motion.div>
              </div>
            </button>

            {/* Topic grid — animated accordion */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    className="px-5 pb-5 pt-2 border-t"
                    style={{ borderColor: 'var(--border-default)' }}
                  >
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3"
                      variants={topicGridVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {lvl.topics.map((topic, ti) => (
                        <motion.div key={topic.slug} variants={topicCardVariants}>
                          <TopicCard
                            topic={topic}
                            index={ti}
                            pathSlug={data.path.slug}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        );
      })}
    </motion.div>
  );
};

interface TopicCardProps {
  topic: {
    slug: string;
    title: string;
    completed: boolean;
    estimatedMins: number;
    hasVisualizer: boolean;
    hasCodeLab: boolean;
  };
  index: number;
  pathSlug: string;
}

function TopicCard({ topic, index, pathSlug }: TopicCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/learn/${pathSlug}/${topic.slug}`}
      className="group relative p-4 rounded-[10px] border block transition-all duration-200"
      style={{
        background: topic.completed
          ? 'color-mix(in oklab, var(--success) 5%, var(--bg-elevated))'
          : hovered
            ? 'var(--bg-elevated)'
            : 'color-mix(in oklab, var(--bg-elevated) 80%, var(--bg-surface))',
        borderColor: topic.completed
          ? 'color-mix(in oklab, var(--success) 28%, var(--border-default))'
          : hovered
            ? 'var(--border-strong)'
            : 'var(--border-default)',
        boxShadow: hovered
          ? topic.completed
            ? '0 4px 16px color-mix(in oklab, var(--success) 10%, transparent)'
            : '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px var(--border-strong)'
          : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Index badge */}
      <div
        className="absolute top-3 right-3 flex items-center justify-center w-6 h-5 rounded text-[9px] tabular-nums font-bold"
        style={{
          background: 'var(--bg-inset)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-code)',
          border: '1px solid var(--border-default)',
          letterSpacing: '0.05em',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Title row */}
      <div className="flex items-start gap-2.5 mb-3 pr-8">
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
            className="shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 transition-colors duration-200"
            style={{
              borderColor: hovered ? 'var(--accent)' : 'var(--border-strong)',
            }}
          />
        )}
        <h4
          className="text-[13px] font-semibold leading-snug"
          style={{
            color: topic.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            letterSpacing: '-0.005em',
            textDecoration: topic.completed ? 'line-through' : 'none',
            textDecorationColor: 'var(--text-muted)',
          }}
        >
          {topic.title}
        </h4>
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
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
            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
              color: 'var(--accent)',
              border: '1px solid color-mix(in oklab, var(--accent) 25%, transparent)',
            }}
          >
            <Play size={9} /> Visualizer
          </span>
        )}
        {topic.hasCodeLab && (
          <span
            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
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

      {/* Hover shimmer bar */}
      {hovered && !topic.completed && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-[10px]"
          style={{ background: 'var(--gradient-accent)' }}
        />
      )}
      {topic.completed && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-[10px]"
          style={{ background: 'linear-gradient(90deg, var(--success), transparent)' }}
        />
      )}
    </Link>
  );
}
