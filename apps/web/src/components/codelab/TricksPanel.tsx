'use client';

import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, Lightbulb, AlertTriangle,
  BookOpen, Clock, Database, X, PanelRightClose, PanelRightOpen,
  CheckCircle, Code2
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface CommonMistake {
  wrong:       string;
  correct:     string;
  explanation: string;
}

export interface CodeExampleTricks {
  memoryTrick?:    string;
  commonMistake?:  CommonMistake;
  patternName?:    string;
  syntaxQuickRef?: string[];
  whyItWorks?:     string;
}

export interface TricksPanelProps {
  tricks:         CodeExampleTricks;
  timeComplexity: string;
  spaceComplexity: string;
  patternName?:   string;
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[--border-default] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[--bg-elevated] hover:bg-[--bg-surface] transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[--text-secondary]">
          {icon}
          {title}
        </div>
        {open
          ? <ChevronDown size={13} className="text-[--text-muted] shrink-0" />
          : <ChevronRight size={13} className="text-[--text-muted] shrink-0" />}
      </button>
      {open && (
        <div className="px-3 py-3 bg-[--bg-primary] text-xs text-[--text-secondary] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Code Block ──────────────────────────────────────────────────────────────
function CodeBlock({ code, label, variant = 'neutral' }: {
  code: string;
  label?: string;
  variant?: 'neutral' | 'wrong' | 'correct';
}) {
  const styles = {
    neutral: 'bg-[--bg-elevated] border-[--border-default] text-[--text-secondary]',
    wrong:   'bg-red-500/5 border-red-500/20 text-red-300',
    correct: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300',
  };
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[--text-muted]">
          {variant === 'wrong'   && <X size={10} className="text-red-400" />}
          {variant === 'correct' && <CheckCircle size={10} className="text-emerald-400" />}
          {label}
        </div>
      )}
      <pre className={`text-[11px] font-mono leading-relaxed p-2.5 rounded-lg border overflow-x-auto ${styles[variant]}`}>
        {code}
      </pre>
    </div>
  );
}

// ─── Main TricksPanel ─────────────────────────────────────────────────────────
/**
 * TricksPanel — collapsible right-side panel showing algorithm insights.
 *
 * Desktop: 280px wide, shown by default, toggle button to hide.
 * Mobile:  hidden by default, "Show Tricks" button to expand.
 */
export default function TricksPanel({
  tricks,
  timeComplexity,
  spaceComplexity,
  patternName,
}: TricksPanelProps) {
  const [panelOpen, setPanelOpen]   = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ─── Desktop toggle ─────────────────────────────────────────────────────
  if (!panelOpen) {
    return (
      <button
        onClick={() => setPanelOpen(true)}
        title="Show Tricks & Insights"
        className="hidden md:flex items-center justify-center w-8 h-full border-l border-[--border-default] bg-[--bg-elevated] hover:bg-[--bg-surface] transition-colors text-[--text-muted] hover:text-[--text-primary]"
      >
        <PanelRightOpen size={16} />
      </button>
    );
  }

  const panelContent = (
    <div className="flex flex-col gap-3 overflow-y-auto h-full pr-0.5">
      {/* Complexity Badges */}
      <Section title="Complexity" icon={<Clock size={13} />} defaultOpen={true}>
        <div className="flex gap-2">
          <span className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-semibold">
            ⏱ {timeComplexity}
          </span>
          <span className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono font-semibold">
            💾 {spaceComplexity}
          </span>
        </div>
      </Section>

      {/* Pattern Badge */}
      {(patternName ?? tricks.patternName) && (
        <Section title="Pattern" icon={<Code2 size={13} />} defaultOpen={true}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            🏷 {patternName ?? tricks.patternName}
          </span>
        </Section>
      )}

      {/* Memory Trick */}
      {tricks.memoryTrick && (
        <Section title="Memory Trick" icon={<Lightbulb size={13} className="text-amber-400" />} defaultOpen={true}>
          <p className="italic text-[--text-muted] leading-relaxed">
            💡 &ldquo;{tricks.memoryTrick}&rdquo;
          </p>
        </Section>
      )}

      {/* Common Mistake */}
      {tricks.commonMistake && (
        <Section title="Common Mistake" icon={<AlertTriangle size={13} className="text-red-400" />} defaultOpen={false}>
          <div className="flex flex-col gap-3">
            <CodeBlock code={tricks.commonMistake.wrong}   label="Wrong"   variant="wrong"   />
            <CodeBlock code={tricks.commonMistake.correct} label="Correct" variant="correct" />
            {tricks.commonMistake.explanation && (
              <p className="text-[--text-muted] text-[11px] leading-relaxed border-l-2 border-emerald-500/40 pl-2">
                {tricks.commonMistake.explanation}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* Syntax Quick Reference */}
      {tricks.syntaxQuickRef && tricks.syntaxQuickRef.length > 0 && (
        <Section title="Syntax Quick Ref" icon={<BookOpen size={13} />} defaultOpen={false}>
          <ol className="flex flex-col gap-1.5 list-none">
            {tricks.syntaxQuickRef.map((line, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-[--text-muted] text-[10px] w-4 shrink-0 mt-0.5">{i + 1}.</span>
                <code className="text-[11px] font-mono text-[--text-secondary] leading-relaxed">{line}</code>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Why It Works */}
      {tricks.whyItWorks && (
        <Section title="Why It Works" icon={<BookOpen size={13} />} defaultOpen={false}>
          <p className="leading-relaxed text-[--text-muted]">{tricks.whyItWorks}</p>
        </Section>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Panel (280px, always visible on md+) */}
      <div className="hidden md:flex flex-col w-[280px] shrink-0 border-l border-[--border-default] bg-[--bg-primary]">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[--border-default] bg-[--bg-elevated] shrink-0">
          <span className="text-xs font-semibold text-[--text-secondary] flex items-center gap-1.5">
            <Lightbulb size={13} className="text-amber-400" />
            Tricks &amp; Insights
          </span>
          <button
            onClick={() => setPanelOpen(false)}
            className="text-[--text-muted] hover:text-[--text-primary] transition-colors"
            title="Collapse panel"
          >
            <PanelRightClose size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {panelContent}
        </div>
      </div>

      {/* Mobile Toggle Button + Slide-in */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="flex items-center gap-2 text-xs px-3 py-2 bg-[--bg-elevated] border border-[--border-default] rounded-lg text-[--text-secondary] hover:text-[--text-primary] transition-colors"
        >
          <Lightbulb size={13} className="text-amber-400" />
          {mobileOpen ? 'Hide Tricks' : 'Show Tricks'}
        </button>
        {mobileOpen && (
          <div className="mt-3 border border-[--border-default] rounded-xl p-3 bg-[--bg-primary] max-h-[60vh] overflow-y-auto">
            {panelContent}
          </div>
        )}
      </div>
    </>
  );
}
