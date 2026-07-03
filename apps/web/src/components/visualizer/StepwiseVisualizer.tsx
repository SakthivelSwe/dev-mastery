'use client';

/**
 * StepwiseVisualizer — a data-driven, animated, step-by-step visualiser.
 *
 * A topic authors a JSON "config" inside its MDX `## VISUALIZATION_CONFIG`
 * section. Example:
 *
 * ```json
 * {
 *   "steps": [
 *     {
 *       "title": "Thread NEW",
 *       "description": "Thread object created; start() not yet called.",
 *       "code": "Thread t = new Thread(() -> work());",
 *       "highlight": [1],
 *       "diagram": { "kind": "threads",
 *         "threads": [ {"name":"main","state":"RUNNABLE"},
 *                      {"name":"worker","state":"NEW"} ] }
 *     },
 *     ...
 *   ]
 * }
 * ```
 *
 * This component owns:
 *   - a working play / pause / step / reset control bar,
 *   - a real code panel that shows the CURRENT step's code (Monaco),
 *   - a schema-driven SVG diagram (memory / threads / boxes / flow / sequence),
 *   - a highlighted narration for each step.
 *
 * No component-specific hard-coding — every topic can drive a rich flow just
 * by describing steps in MDX.
 */

import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Pause, RotateCcw, StepForward, StepBack } from 'lucide-react';

// ─── Schema ────────────────────────────────────────────────────────────────

export type ThreadState =
  | 'NEW'
  | 'RUNNABLE'
  | 'BLOCKED'
  | 'WAITING'
  | 'TIMED_WAITING'
  | 'TERMINATED';

export interface ThreadRow {
  name: string;
  state: ThreadState | string;
  note?: string;
  active?: boolean;
}

export interface StackCell   { label: string; value: string; type?: string; highlight?: boolean }
export interface HeapObject  { label: string; fields?: [string, string][]; highlight?: boolean }
export interface BoxItem     { label: string; value?: string; highlight?: boolean; color?: string }
export interface FlowStep    { label: string; done?: boolean; active?: boolean; note?: string }
export interface SequenceMsg { from: string; to: string; label: string }

export type Diagram =
  | { kind: 'memory'; stack?: StackCell[]; heap?: HeapObject[] }
  | { kind: 'threads'; threads: ThreadRow[]; monitor?: { name: string; owner?: string; waiters?: string[] } }
  | { kind: 'boxes'; title?: string; items: BoxItem[] }
  | { kind: 'flow'; steps: FlowStep[] }
  | { kind: 'sequence'; actors: string[]; messages: SequenceMsg[] }
  | { kind: 'threadpool'; workers: ThreadRow[]; queue: BoxItem[]; capacity: number };

export interface Step {
  title: string;
  description: string;
  code?: string;
  language?: string;
  highlight?: number[];   // 1-based line numbers to highlight in the code panel
  diagram?: Diagram;
}

export interface StepwiseConfig {
  steps: Step[];
  language?: string;
  fileName?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function StepwiseVisualizer({ config }: { config: StepwiseConfig }) {
  const steps = config.steps ?? [];
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Advance the current step on a timer while playing
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!playing) return;
    const intervalMs = Math.max(400, 1600 / speed);
    timerRef.current = setInterval(() => {
      setIdx((cur) => {
        if (cur >= steps.length - 1) {
          setPlaying(false);
          return cur;
        }
        return cur + 1;
      });
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speed, steps.length]);

  const step = steps[idx];
  const language = step?.language ?? config.language ?? 'java';
  const fileName = config.fileName ?? `${language === 'yaml' ? 'application' : 'Demo'}.${languageExt(language)}`;

  const step_prev  = () => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); };
  const step_next  = () => { setPlaying(false); setIdx((i) => Math.min(steps.length - 1, i + 1)); };
  const play_pause = () => { setPlaying((p) => (steps.length > 0 ? !p : false)); };
  const reset      = () => { setPlaying(false); setIdx(0); };

  // Empty / malformed config → helpful placeholder instead of crash
  if (!step) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-[--text-muted] p-8 text-center">
        This topic has a visualiser slot but no <code>steps</code> defined yet.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      {/* LEFT: control bar + diagram + step narration */}
      <div className="flex flex-col flex-1 border-r border-[--border-default] p-4 gap-3 min-w-0">
        {/* Control bar */}
        <div className="flex items-center justify-between bg-[--bg-elevated] p-2 rounded-lg border border-[--border-default]">
          <div className="flex items-center gap-1">
            <IconBtn onClick={reset}      title="Reset"><RotateCcw size={16} /></IconBtn>
            <IconBtn onClick={step_prev}  title="Previous step" disabled={idx === 0}><StepBack size={16} /></IconBtn>
            <IconBtn onClick={play_pause} title={playing ? 'Pause' : 'Play'} highlight>
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </IconBtn>
            <IconBtn onClick={step_next}  title="Next step" disabled={idx >= steps.length - 1}><StepForward size={16} /></IconBtn>
          </div>

          <div className="flex items-center gap-3 text-xs text-[--text-muted]">
            <span>Step {idx + 1} / {steps.length}</span>
            <div className="flex items-center gap-1">
              <span>Speed</span>
              <input
                type="range" min={0.5} max={3} step={0.5}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500"
              />
              <span className="tabular-nums w-8 text-right">{speed}×</span>
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex flex-wrap gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPlaying(false); setIdx(i); }}
              title={steps[i].title}
              className={`h-2 rounded-full transition-all ${
                i === idx
                  ? 'w-8 bg-indigo-500'
                  : i < idx
                    ? 'w-4 bg-indigo-500/40'
                    : 'w-4 bg-[--border-default] hover:bg-[--text-muted]'
              }`}
            />
          ))}
        </div>

        {/* Diagram */}
        <div className="flex-1 overflow-auto bg-[--bg-primary] border border-[--border-default] rounded-lg p-4">
          {step.diagram
            ? <DiagramRenderer diagram={step.diagram} />
            : <div className="text-sm text-[--text-muted] italic">No diagram for this step.</div>}
        </div>

        {/* Narration */}
        <div className="bg-[--bg-elevated] border border-[--border-default] rounded-lg p-3">
          <div className="text-[--text-primary] font-semibold text-sm mb-1">
            <span className="text-indigo-400 mr-2">Step {idx + 1}</span>{step.title}
          </div>
          <div className="text-xs text-[--text-secondary] leading-relaxed whitespace-pre-wrap">
            {step.description}
          </div>
        </div>
      </div>

      {/* RIGHT: real code panel for this step, with line highlights */}
      <div className="w-[40%] max-w-[560px] min-w-[280px] flex flex-col bg-[#1e1e1e]">
        <div className="border-b border-[#333] px-3 py-2 flex items-center gap-2 text-xs text-gray-400">
          <span className="px-2 py-0.5 border-b-2 border-amber-400 text-white">{fileName}</span>
          <span className="opacity-60">•</span>
          <span>{language}</span>
        </div>
        <div className="flex-1 min-h-0">
          <CodePanel code={step.code ?? ''} language={language} highlight={step.highlight ?? []} />
        </div>
      </div>
    </div>
  );
}

// ─── Utilities ─────────────────────────────────────────────────────────────

function languageExt(lang: string): string {
  switch (lang) {
    case 'java':       return 'java';
    case 'kotlin':     return 'kt';
    case 'javascript': return 'js';
    case 'typescript': return 'ts';
    case 'python':     return 'py';
    case 'yaml':       return 'yml';
    case 'sql':        return 'sql';
    default:           return 'txt';
  }
}

function IconBtn({
  children, onClick, title, disabled, highlight,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-all ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : highlight
            ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
            : 'hover:bg-[--bg-surface] text-[--text-secondary]'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Code Panel — Monaco with per-step line decorations ───────────────────

function CodePanel({ code, language, highlight }: { code: string; language: string; highlight: number[] }) {
  const editorRef = useRef<any>(null);
  const decoRef   = useRef<string[]>([]);

  const applyDecorations = (editor: any, monaco: any) => {
    if (!editor || !monaco) return;
    const newDecos = highlight.map((line) => ({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'devmastery-line-highlight',
        linesDecorationsClassName: 'devmastery-line-marker',
      },
    }));
    decoRef.current = editor.deltaDecorations(decoRef.current, newDecos);
    if (highlight.length > 0) {
      editor.revealLineInCenter(highlight[0]);
    }
  };

  return (
    <>
      {/* Injected CSS so we don't need a global stylesheet change */}
      <style jsx global>{`
        .devmastery-line-highlight { background: rgba(251, 191, 36, 0.12) !important; }
        .devmastery-line-marker    { background: #fbbf24; width: 3px !important; margin-left: 3px; }
      `}</style>
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          (editorRef.current as any).__monaco = monaco;
          applyDecorations(editor, monaco);
        }}
        onChange={() => { /* read-only view */ }}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
          lineHeight: 20,
          padding: { top: 12 },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        }}
      />
      <ApplyDecorationsBridge editorRef={editorRef} highlight={highlight} />
    </>
  );
}

// Re-apply Monaco line decorations whenever the highlight prop changes for the
// current editor instance. Doing this outside `onMount` lets us track prop
// updates across step navigation.
function ApplyDecorationsBridge({
  editorRef,
  highlight,
}: {
  editorRef: React.MutableRefObject<any>;
  highlight: number[];
}) {
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const monaco = (editor as any).__monaco;
    if (!monaco) return;
    const newDecos = highlight.map((line: number) => ({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'devmastery-line-highlight',
        linesDecorationsClassName: 'devmastery-line-marker',
      },
    }));
    (editor as any).__decos = editor.deltaDecorations((editor as any).__decos ?? [], newDecos);
    if (highlight.length > 0) editor.revealLineInCenter(highlight[0]);
  }, [highlight, editorRef]);
  return null;
}

// ─── Diagrams ──────────────────────────────────────────────────────────────

function DiagramRenderer({ diagram }: { diagram: Diagram }) {
  switch (diagram.kind) {
    case 'memory':     return <MemoryDiagram   {...diagram} />;
    case 'threads':    return <ThreadsDiagram  {...diagram} />;
    case 'boxes':      return <BoxesDiagram    {...diagram} />;
    case 'flow':       return <FlowDiagram     {...diagram} />;
    case 'sequence':   return <SequenceDiagram {...diagram} />;
    case 'threadpool': return <ThreadPoolDiagram {...diagram} />;
    default:
      return <div className="text-sm text-[--text-muted]">Unknown diagram kind.</div>;
  }
}

// Memory: Stack (per-thread) + Heap
function MemoryDiagram({ stack = [], heap = [] }: { stack?: StackCell[]; heap?: HeapObject[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      <Panel title="Thread Stack" subtitle="local variables · per-thread">
        {stack.length === 0
          ? <Empty>—</Empty>
          : stack.map((c, i) => (
              <div key={i}
                className={`flex items-center justify-between px-3 py-2 rounded border ${
                  c.highlight
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-[--border-default] bg-[--bg-elevated]'
                }`}>
                <div className="flex items-center gap-2">
                  <span className="text-[--text-secondary] font-mono text-sm">{c.label}</span>
                  {c.type && <span className="text-[10px] uppercase tracking-wider text-[--text-muted]">{c.type}</span>}
                </div>
                <span className="text-indigo-300 font-mono text-sm">{c.value}</span>
              </div>
            ))}
      </Panel>

      <Panel title="JVM Heap" subtitle="objects · shared across threads">
        {heap.length === 0
          ? <Empty>—</Empty>
          : heap.map((o, i) => (
              <div key={i}
                className={`p-3 rounded border ${
                  o.highlight
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-[--border-default] bg-[--bg-elevated]'
                }`}>
                <div className="text-sm text-emerald-300 font-semibold mb-1">{o.label}</div>
                {o.fields && (
                  <div className="text-xs text-[--text-secondary] font-mono space-y-0.5">
                    {o.fields.map(([k, v], j) => (
                      <div key={j}><span className="text-[--text-muted]">{k}</span> = {v}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
      </Panel>
    </div>
  );
}

// Threads: one row per thread with a state pill
function ThreadsDiagram({ threads, monitor }: { threads: ThreadRow[]; monitor?: { name: string; owner?: string; waiters?: string[] } }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <Panel title="Threads">
        {threads.map((t, i) => (
          <div key={i}
            className={`flex items-center justify-between px-3 py-2 rounded border ${
              t.active !== false
                ? 'border-[--border-default] bg-[--bg-elevated]'
                : 'opacity-40 border-[--border-muted] bg-[--bg-primary]'
            }`}>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full" style={{ background: stateColor(t.state) }} />
              <span className="text-sm text-[--text-primary] font-mono">{t.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider"
                style={{ background: `${stateColor(t.state)}22`, color: stateColor(t.state) }}
              >{t.state}</span>
              {t.note && <span className="text-[11px] text-[--text-muted] italic">{t.note}</span>}
            </div>
          </div>
        ))}
      </Panel>
      {monitor && (
        <Panel title={`Monitor · ${monitor.name}`}>
          <div className="text-xs text-[--text-secondary]">
            <div><span className="text-[--text-muted]">owner:</span> {monitor.owner ?? <em className="text-[--text-muted]">(free)</em>}</div>
            <div><span className="text-[--text-muted]">waiters:</span> {monitor.waiters?.length ? monitor.waiters.join(', ') : <em className="text-[--text-muted]">(none)</em>}</div>
          </div>
        </Panel>
      )}
    </div>
  );
}

function stateColor(s: string): string {
  switch (s) {
    case 'NEW':           return '#94a3b8';
    case 'RUNNABLE':      return '#10b981';
    case 'BLOCKED':       return '#ef4444';
    case 'WAITING':       return '#f59e0b';
    case 'TIMED_WAITING': return '#eab308';
    case 'TERMINATED':    return '#64748b';
    default:              return '#818cf8';
  }
}

// Boxes: horizontal or wrapping row of labeled boxes (e.g., queue, ring buffer)
function BoxesDiagram({ title, items }: { title?: string; items: BoxItem[] }) {
  return (
    <Panel title={title ?? 'State'}>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && <Empty>empty</Empty>}
        {items.map((b, i) => (
          <div key={i}
            className={`px-3 py-2 rounded border font-mono text-sm min-w-[64px] text-center ${
              b.highlight
                ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                : 'border-[--border-default] bg-[--bg-elevated] text-[--text-primary]'
            }`}
            style={b.color ? { borderColor: b.color, background: `${b.color}22`, color: b.color } : undefined}>
            <div>{b.label}</div>
            {b.value !== undefined && <div className="text-[10px] text-[--text-muted] mt-0.5">{b.value}</div>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

// Flow: vertical list of steps with done / active indicators
function FlowDiagram({ steps }: { steps: FlowStep[] }) {
  return (
    <Panel title="Flow">
      <div className="flex flex-col gap-1">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className={`mt-1 w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
              s.done
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                : s.active
                  ? 'bg-indigo-500 text-white'
                  : 'bg-[--bg-elevated] text-[--text-muted] border border-[--border-default]'
            }`}>
              {s.done ? '✓' : i + 1}
            </div>
            <div className="text-sm">
              <div className={`${s.active ? 'text-[--text-primary] font-semibold' : 'text-[--text-secondary]'}`}>{s.label}</div>
              {s.note && <div className="text-xs text-[--text-muted]">{s.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// Sequence: actor columns + arrows for messages
function SequenceDiagram({ actors, messages }: { actors: string[]; messages: SequenceMsg[] }) {
  const cols = actors.length;
  return (
    <Panel title="Sequence">
      <div className="min-w-0 overflow-x-auto">
        <div className="grid gap-2 items-start" style={{ gridTemplateColumns: `repeat(${cols}, minmax(120px, 1fr))` }}>
          {actors.map((a, i) => (
            <div key={i} className="text-center text-sm font-semibold text-indigo-300 border-b border-[--border-default] pb-1">
              {a}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-3">
          {messages.map((m, i) => {
            const fromIdx = actors.indexOf(m.from);
            const toIdx   = actors.indexOf(m.to);
            const rightward = toIdx >= fromIdx;
            return (
              <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: `repeat(${cols}, minmax(120px, 1fr))` }}>
                {Array.from({ length: cols }).map((_, c) => {
                  const inRange = c >= Math.min(fromIdx, toIdx) && c <= Math.max(fromIdx, toIdx);
                  return (
                    <div key={c} className="relative h-6">
                      {inRange && (
                        <div className="absolute inset-x-0 top-1/2 h-px bg-indigo-400/50" />
                      )}
                      {c === fromIdx && (
                        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400" />
                      )}
                      {c === toIdx && c !== fromIdx && (
                        <div className={`absolute top-1/2 -translate-y-1/2 ${rightward ? 'right-1' : 'left-1'} text-indigo-300 text-xs`}>
                          {rightward ? '▶' : '◀'}
                        </div>
                      )}
                      {c === Math.floor((fromIdx + toIdx) / 2) && (
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-[10px] text-[--text-secondary] bg-[--bg-elevated] px-1.5 py-0.5 rounded whitespace-nowrap">
                          {m.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

// Thread pool: workers + bounded queue with capacity marker
function ThreadPoolDiagram({
  workers, queue, capacity,
}: { workers: ThreadRow[]; queue: BoxItem[]; capacity: number }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <Panel title={`Task Queue · ${queue.length} / ${capacity}`}>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: capacity }).map((_, i) => {
            const item = queue[i];
            return (
              <div key={i}
                className={`w-10 h-8 rounded flex items-center justify-center font-mono text-xs border ${
                  item
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                    : 'border-dashed border-[--border-default] text-[--text-muted]/40'
                }`}
                title={item?.value ?? 'empty'}
              >
                {item?.label ?? '·'}
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel title="Workers">
        <div className="grid grid-cols-2 gap-2">
          {workers.map((w, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2 rounded border ${
              w.active !== false ? 'border-[--border-default] bg-[--bg-elevated]' : 'opacity-40 border-[--border-muted]'
            }`}>
              <span className="font-mono text-xs text-[--text-primary]">{w.name}</span>
              <span className="text-[10px] uppercase font-bold" style={{ color: stateColor(w.state) }}>{w.state}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ─── Shared UI ─────────────────────────────────────────────────────────────

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 min-h-0">
      <div className="flex items-baseline gap-2 shrink-0">
        <span className="text-[11px] uppercase tracking-widest text-[--text-muted] font-semibold">{title}</span>
        {subtitle && <span className="text-[10px] text-[--text-muted]/70 italic">{subtitle}</span>}
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-[--text-muted] italic px-2 py-1">{children}</div>;
}

// ─── Config parser — exposed for the shell ────────────────────────────────

/**
 * Parses the raw MDX body of a `## VISUALIZATION_CONFIG` section and returns
 * a StepwiseConfig if the JSON contains a `steps` array, otherwise null.
 *
 * Accepts either a fenced code block:
 *   ```json
 *   { "steps": [...] }
 *   ```
 * or plain JSON pasted between the heading and the next `##`.
 */
export function parseStepwiseConfig(rawVisualLayer: string | undefined | null): StepwiseConfig | null {
  if (!rawVisualLayer) return null;
  const text = rawVisualLayer.trim();
  const fence = text.match(/```(?:json|json5)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed?.steps) && parsed.steps.length > 0) {
      return parsed as StepwiseConfig;
    }
    return null;
  } catch {
    return null;
  }
}

