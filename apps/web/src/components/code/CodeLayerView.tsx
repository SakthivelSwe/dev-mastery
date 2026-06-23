'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeEditorShell } from './CodeEditorShell';
import { BookOpen, ChevronRight, Zap } from 'lucide-react';

interface CodeLayerViewProps {
  codeContent: string;
  language?: string;
}

interface CodeLevel {
  index: number;
  heading: string;
  subtitle: string;
  badge: string;
  code: string;
}

const LEVEL_BADGES = [
  { label: 'Level 1', color: 'bg-green-500/20 text-green-300 border-green-500/40', icon: '🌱' },
  { label: 'Level 2', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',   icon: '🔨' },
  { label: 'Level 3', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', icon: '⚡' },
  { label: 'Level 4', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',  icon: '🚀' },
  { label: 'Level 5', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',    icon: '🎯' },
];

const LEVEL_NAMES = [
  'Beginner',
  'Building Blocks',
  'Intermediate',
  'Advanced',
  'Expert',
];

/**
 * Parse the raw markdown CODE section into discrete levels.
 * Supports headings like:
 *   ### Level 1 — Beginner
 *   ### Level 2 — Building Blocks: Subtitle
 */
function parseCodeLevels(raw: string): CodeLevel[] {
  if (!raw || raw.trim() === '') return [];

  const levels: CodeLevel[] = [];

  // Split on ### Level N headings
  const sectionRegex = /###\s+Level\s+(\d+)[^\n]*/gi;
  const splits: { index: number; heading: string; levelNum: number; start: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(raw)) !== null) {
    splits.push({
      index: parseInt(match[1], 10) - 1,
      heading: match[0].replace(/^###\s+/, '').trim(),
      levelNum: parseInt(match[1], 10),
      start: match.index + match[0].length,
    });
  }

  for (let i = 0; i < splits.length; i++) {
    const section = splits[i];
    const end = i + 1 < splits.length ? splits[i + 1].start - splits[i + 1].heading.length - 4 : raw.length;
    const chunk = raw.slice(section.start, end).trim();

    // Extract the first ```java ... ``` block from this chunk
    const codeMatch = chunk.match(/```(?:java|javascript|js|ts|python|sql|kotlin)?\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trimEnd() : chunk.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();

    // Build subtitle: everything after "— " in the heading
    const dashMatch = section.heading.match(/[—–-]\s*(.+)/);
    const subtitle = dashMatch ? dashMatch[1] : LEVEL_NAMES[section.index] || '';

    levels.push({
      index: section.index,
      heading: section.heading,
      subtitle,
      badge: LEVEL_BADGES[section.index]?.label ?? `Level ${section.levelNum}`,
      code: code || '// No code example available for this level.',
    });
  }

  return levels;
}

export function CodeLayerView({ codeContent, language = 'java' }: CodeLayerViewProps) {
  const levels = useMemo(() => parseCodeLevels(codeContent), [codeContent]);
  const [activeLevel, setActiveLevel] = useState(0);

  // Fallback: if no levels parsed, show raw code or empty editor
  if (levels.length === 0) {
    return (
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-[--text-muted]">
          <BookOpen size={16} />
          <span>Interactive Code Editor</span>
        </div>
        <CodeEditorShell
          initialCode={'// Write your Java code here...\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'}
          languageString={language}
        />
      </div>
    );
  }

  const currentLevel = levels[Math.min(activeLevel, levels.length - 1)];
  const badge = LEVEL_BADGES[currentLevel.index] ?? LEVEL_BADGES[0];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Level Selector Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[--text-muted] mr-1 font-semibold">DIFFICULTY:</span>
        {levels.map((lvl, i) => {
          const b = LEVEL_BADGES[lvl.index] ?? LEVEL_BADGES[0];
          return (
            <button
              key={i}
              onClick={() => setActiveLevel(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                i === activeLevel
                  ? b.color + ' scale-105 shadow-sm'
                  : 'bg-[--bg-elevated] border-[--border-default] text-[--text-muted] hover:text-[--text-primary] hover:border-[--border-muted]'
              }`}
            >
              <span>{b.icon}</span>
              {b.label}
            </button>
          );
        })}
      </div>

      {/* Level heading & subtitle */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLevel}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-3"
        >
          <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${badge.color}`}>
            {badge.icon} {badge.label}
          </span>
          <div className="flex items-center gap-2 text-sm text-[--text-secondary]">
            <ChevronRight size={14} className="text-[--text-muted]" />
            <span className="font-semibold text-[--text-primary]">{currentLevel.subtitle}</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-[--text-muted]">
            <Zap size={11} className="text-amber-400" />
            Edit &amp; run this code live
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Code Editor with the level's pre-loaded code */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`code-${activeLevel}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-h-0"
        >
          <CodeEditorShell
            initialCode={currentLevel.code}
            languageString={language}
          />
        </motion.div>
      </AnimatePresence>

      {/* Level progression hint */}
      {levels.length > 1 && (
        <div className="flex items-center justify-between text-xs text-[--text-muted]">
          <span>
            {activeLevel + 1} of {levels.length} levels
          </span>
          {activeLevel < levels.length - 1 && (
            <button
              onClick={() => setActiveLevel(activeLevel + 1)}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Next Level: {levels[activeLevel + 1].subtitle}
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

