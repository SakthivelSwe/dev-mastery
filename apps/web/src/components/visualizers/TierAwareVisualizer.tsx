'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, Info, AlertTriangle, BarChart2, Layers } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
export type Tier = 'easy' | 'intermediate' | 'expert' | 'advanced';

export interface TierAwareVisualizerProps {
  tier?: Tier;
  topicSlug: string;
  data?: number[];
  speed?: number;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

// ─── Dynamic child visualizer (resolved by VisualizerRouter) ─────────────────
const VisualizerRouter = dynamic(() => import('./VisualizerRouter'), { ssr: false });

// ─── Tier Configurations ──────────────────────────────────────────────────────
const TIER_CONFIG = {
  easy: {
    boxSize: 70,
    defaultSpeed: 1,
    label: 'Easy',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    description: 'Large, slow, fully explained. Perfect for learning the concept.',
  },
  intermediate: {
    boxSize: 60,
    defaultSpeed: 2,
    label: 'Intermediate',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    description: 'Normal speed with realistic data. Includes edge case toggles.',
  },
  expert: {
    boxSize: 48,
    defaultSpeed: 3,
    label: 'Expert',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    description: 'Fast paced. Complexity graph overlay and call stack panel shown.',
  },
  advanced: {
    boxSize: 48,
    defaultSpeed: 4,
    label: 'Advanced',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    description: 'Expert + memory layout and Java stream equivalent panel.',
  },
} as const;

// ─── Edge Case Datasets for Intermediate ─────────────────────────────────────
const EDGE_CASES: Record<string, { label: string; data: number[] }[]> = {
  default: [
    { label: 'Empty array',      data: [] },
    { label: 'All duplicates',   data: [5, 5, 5, 5, 5] },
    { label: 'Already sorted',   data: [1, 2, 3, 4, 5, 6, 7] },
    { label: 'Reverse sorted',   data: [9, 8, 7, 6, 5, 4, 3, 2, 1] },
    { label: 'With negatives',   data: [-3, 1, -7, 4, 0, -1, 8] },
  ],
};

// ─── Complexity Reference Lines (Expert+) ────────────────────────────────────
function ComplexityGraph({ highlighted = 'O(n)' }: { highlighted?: string }) {
  return (
    <div className="bg-[--bg-surface] border border-[--border-default] rounded-xl p-3 w-56">
      <div className="flex items-center gap-1.5 mb-2">
        <BarChart2 size={12} className="text-[--text-muted]" />
        <span className="text-xs text-[--text-muted] font-medium">Complexity Reference</span>
      </div>
      {[
        { label: 'O(1)',       color: '#22c55e', height: 8 },
        { label: 'O(log n)',   color: '#3b82f6', height: 18 },
        { label: 'O(n)',       color: '#f59e0b', height: 38 },
        { label: 'O(n log n)', color: '#f97316', height: 52 },
        { label: 'O(n²)',      color: '#ef4444', height: 72 },
      ].map(({ label, color, height }) => (
        <div key={label} className="flex items-end gap-2 mb-1">
          <div
            className="w-3 rounded-sm"
            style={{ height, backgroundColor: color, opacity: label === highlighted ? 1 : 0.3 }}
          />
          <span className={`text-xs font-mono ${label === highlighted ? 'font-bold' : 'text-[--text-muted]'}`}
            style={{ color: label === highlighted ? color : undefined }}>
            {label} {label === highlighted && '← current'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Recursion Call Stack Panel (Expert+) ─────────────────────────────────────
function CallStackPanel({ frames }: { frames: string[] }) {
  return (
    <div className="bg-[--bg-surface] border border-[--border-default] rounded-xl p-3 w-56">
      <div className="flex items-center gap-1.5 mb-2">
        <Layers size={12} className="text-[--text-muted]" />
        <span className="text-xs text-[--text-muted] font-medium">Call Stack</span>
      </div>
      <div className="flex flex-col-reverse gap-1">
        {frames.length === 0 ? (
          <span className="text-xs text-[--text-muted] italic">Stack is empty</span>
        ) : (
          frames.map((frame, i) => (
            <div key={i} className={`text-xs font-mono px-2 py-1 rounded border ${
              i === frames.length - 1
                ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                : 'bg-[--bg-elevated] border-[--border-muted] text-[--text-secondary]'
            }`}>
              {frame}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Memory Layout Panel (Advanced) ──────────────────────────────────────────
function MemoryLayoutPanel({ data }: { data: number[] }) {
  const BASE_ADDR = 0x1000;
  return (
    <div className="bg-[--bg-surface] border border-[--border-default] rounded-xl p-3 w-64">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs text-[--text-muted] font-medium">🧠 Heap Memory Layout</span>
      </div>
      <div className="font-mono text-xs">
        <div className="flex gap-2 text-[--text-muted] mb-1">
          <span className="w-20">Address</span>
          <span className="w-12">Index</span>
          <span>Value</span>
        </div>
        {data.slice(0, 8).map((val, i) => (
          <div key={i} className={`flex gap-2 py-0.5 px-1 rounded ${i % 2 === 0 ? 'bg-[--bg-elevated]' : ''}`}>
            <span className="w-20 text-purple-400">0x{(BASE_ADDR + i * 4).toString(16).toUpperCase()}</span>
            <span className="w-12 text-blue-400">[{i}]</span>
            <span className="text-[--text-primary]">{val}</span>
          </div>
        ))}
        {data.length > 8 && (
          <div className="text-[--text-muted] text-center py-1">... {data.length - 8} more elements</div>
        )}
        <div className="mt-2 text-[--text-muted] text-xs">
          Each int = 4 bytes · Contiguous block = {data.length * 4} bytes
        </div>
      </div>
    </div>
  );
}

// ─── Java Stream Equivalent (Advanced) ───────────────────────────────────────
function JavaStreamPanel({ topicSlug }: { topicSlug: string }) {
  const streamExamples: Record<string, string> = {
    'sorting-algorithms': `// Java Stream equivalent
int[] sorted = Arrays.stream(arr)
    .sorted()
    .toArray();`,
    'two-pointers': `// Java Stream (less idiomatic)
// Two-pointer is inherently imperative;
// streams don't map cleanly here.
// Use: IntStream.rangeClosed(0, arr.length-1)
//   to iterate indices.`,
    default: `// Java Stream equivalent
int[] result = Arrays.stream(arr)
    .filter(x -> x > 0)
    .map(x -> x * 2)
    .toArray();

// Statistics in one pass:
IntSummaryStatistics stats =
    Arrays.stream(arr).summaryStatistics();`,
  };

  const code = streamExamples[topicSlug] ?? streamExamples['default'];

  return (
    <div className="bg-[--bg-surface] border border-[--border-default] rounded-xl p-3">
      <div className="text-xs text-[--text-muted] font-medium mb-2">☕ Java Stream Equivalent</div>
      <pre className="text-xs font-mono text-[--text-secondary] leading-relaxed whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TierAwareVisualizer({
  tier: externalTier,
  topicSlug,
  data = [12, 45, 7, 23, 67, 34, 89, 15],
  speed: externalSpeed,
  isPlaying,
  onPlayStateChange,
}: TierAwareVisualizerProps) {
  const [tier, setTier]         = useState<Tier>(externalTier ?? 'easy');
  const [activeData, setActiveData] = useState<number[]>(data);
  const [isPlayingLocal, setIsPlayingLocal] = useState(isPlaying ?? false);

  const config = TIER_CONFIG[tier];
  const effectiveSpeed = externalSpeed ?? config.defaultSpeed;

  // ─── Render tier-specific overlays ───────────────────────────────────────
  const renderTierExtras = () => {
    if (tier === 'easy') {
      return (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-300 flex gap-2 items-start">
          <Info size={16} className="shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <strong className="block mb-1">What is happening?</strong>
            <span className="text-emerald-200/80 text-xs">
              Watch each element get highlighted one by one. The orange arrow points to the
              current position. Blue means &quot;active&quot;, green means &quot;found/done&quot;.
              Each step is fully explained below the array.
            </span>
          </div>
        </div>
      );
    }

    if (tier === 'intermediate') {
      return (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-[--text-muted] self-center">Try edge cases:</span>
          {(EDGE_CASES['default']).map(({ label, data: edgeData }) => (
            <button key={label} onClick={() => setActiveData(edgeData)}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors">
              {label}
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Tier selector */}
      <div className="flex items-center gap-3 bg-[--bg-elevated] rounded-xl p-3 border border-[--border-default]">
        <span className="text-xs text-[--text-muted] font-medium">Difficulty Tier:</span>
        <div className="flex gap-2">
          {(['easy', 'intermediate', 'expert', 'advanced'] as Tier[]).map(t => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                tier === t
                  ? `${TIER_CONFIG[t].bg} ${TIER_CONFIG[t].border} ${TIER_CONFIG[t].color}`
                  : 'bg-[--bg-surface] border-[--border-default] text-[--text-muted] hover:text-[--text-primary]'
              }`}
            >
              {TIER_CONFIG[t].label}
            </button>
          ))}
        </div>
        <span className={`ml-auto text-xs ${config.color} italic`}>{config.description}</span>
      </div>

      {/* Tier-specific extras (top) */}
      {renderTierExtras()}

      {/* Main visualizer + expert panels */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Visualizer */}
        <div className="flex-1 min-h-0">
          <VisualizerRouter
            topicSlug={topicSlug}
            data={activeData}
            speed={effectiveSpeed}
            isPlaying={isPlayingLocal}
            onPlayStateChange={(v) => { setIsPlayingLocal(v); onPlayStateChange?.(v); }}
          />
        </div>

        {/* Expert+ right panel */}
        {(tier === 'expert' || tier === 'advanced') && (
          <div className="flex flex-col gap-3 w-60 shrink-0">
            <ComplexityGraph highlighted="O(n)" />
            <CallStackPanel frames={[]} />
            {tier === 'advanced' && (
              <>
                <MemoryLayoutPanel data={activeData} />
                <JavaStreamPanel topicSlug={topicSlug} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Advanced: worst-case button */}
      {tier === 'expert' && (
        <button
          onClick={() => setActiveData([...Array(12)].map((_, i) => 12 - i))} // Reverse sorted — worst case for most
          className="flex items-center gap-2 text-xs px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/15 transition-colors w-fit"
        >
          <AlertTriangle size={12} />
          Generate Worst-Case Input
        </button>
      )}
    </div>
  );
}
