'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// ─── Dynamic imports (no SSR — D3 requires browser) ─────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ArrayVisualizer      = dynamic(() => import('./ArrayVisualizer'),     { ssr: false }) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BSTVisualizer        = dynamic(() => import('../visualizer/algorithms/BSTVisualizer'),       { ssr: false }) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkedListVisualizer = dynamic(() => import('../visualizer/algorithms/LinkedListVisualizer'), { ssr: false }) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StackVisualizer      = dynamic(() => import('../visualizer/algorithms/StackVisualizer'),     { ssr: false }) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HeapVisualizer       = dynamic(() => import('../visualizer/algorithms/HeapVisualizer'),      { ssr: false }) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TrieVisualizer       = dynamic(() => import('../visualizer/algorithms/TrieVisualizer'),      { ssr: false }) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DPVisualizer         = dynamic(() => import('../visualizer/algorithms/DPVisualizer'),        { ssr: false }) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GraphVisualizer      = dynamic(() => import('../visualizer/algorithms/GraphVisualizer'),     { ssr: false }) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SortingVisualizer    = dynamic(() => import('./SortingVisualizer'),    { ssr: false }) as React.ComponentType<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TwoPointerVisualizer = dynamic(() => import('./TwoPointerVisualizer'), { ssr: false }) as React.ComponentType<any>;

// ─── Shared props interface for all visualizers ──────────────────────────────
// Kept intentionally permissive — existing visualizers (BST, LinkedList, etc.)
// each have their own specific prop types (including `stepMode`).
// The router passes props through; type safety lives at the call site.
export interface VisualizerProps {
  data?: number[];
  speed?: number;         // 1–5
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  stepMode?: boolean;     // legacy prop for older visualizers
  [key: string]: unknown; // allow extra props per visualizer
}

// ─── Slug → Component map ────────────────────────────────────────────────────
// IMPORTANT: Default fallback is ALWAYS ArrayVisualizer — NEVER BSTVisualizer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SLUG_TO_VISUALIZER: Record<string, React.ComponentType<any>> = {
  // Binary Search Tree
  'binary-search-tree':    BSTVisualizer,

  // Linked List
  'linked-list-singly':    LinkedListVisualizer,
  'linked-list':           LinkedListVisualizer,
  'linked-list-doubly':    LinkedListVisualizer,

  // Stack
  'stack':                 StackVisualizer,

  // Heap
  'heap':                  HeapVisualizer,
  'heap-minheap':          HeapVisualizer,
  'heap-maxheap':          HeapVisualizer,

  // Trie
  'trie':                  TrieVisualizer,
  'trie-pattern':          TrieVisualizer,

  // Dynamic Programming
  'dynamic-programming':   DPVisualizer,
  'dp-tabulation':         DPVisualizer,
  'dp-memoization':        DPVisualizer,

  // Graph
  'graph-algorithms':      GraphVisualizer,
  'bfs':                   GraphVisualizer,
  'dfs':                   GraphVisualizer,
  'graph-bfs':             GraphVisualizer,
  'graph-dfs':             GraphVisualizer,

  // Sorting
  'sorting-algorithms':    SortingVisualizer,
  'bubble-sort':           SortingVisualizer,
  'merge-sort':            SortingVisualizer,
  'quick-sort':            SortingVisualizer,
  'insertion-sort':        SortingVisualizer,
  'selection-sort':        SortingVisualizer,

  // Two Pointers
  'two-pointers':          TwoPointerVisualizer,
  'two-sum':               TwoPointerVisualizer,
  'three-sum':             TwoPointerVisualizer,
  'container-with-water':  TwoPointerVisualizer,
};

interface VisualizerRouterProps extends VisualizerProps {
  topicSlug: string;
}

// ─── Loading skeleton shown during dynamic import ────────────────────────────
function VisualizerSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4 animate-pulse">
      <div className="flex gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-[--bg-elevated] border border-[--border-muted]"
            style={{ width: 60, height: 60 + i * 8, opacity: 0.4 + i * 0.08 }}
          />
        ))}
      </div>
      <div className="h-3 w-48 rounded-full bg-[--bg-elevated] opacity-40" />
    </div>
  );
}

// ─── Main Router Component ───────────────────────────────────────────────────
/**
 * VisualizerRouter — resolves the correct visualizer for a given topicSlug.
 *
 * Default fallback: ArrayVisualizer (covers array-basics, binary-search,
 * sliding-window, prefix-sum, and any other unmapped slug).
 * The fallback is NEVER BSTVisualizer.
 */
export default function VisualizerRouter({ topicSlug, ...props }: VisualizerRouterProps) {
  // Resolve component — default to ArrayVisualizer for all unknown slugs
  const VisualizerComponent = SLUG_TO_VISUALIZER[topicSlug] ?? ArrayVisualizer;

  return (
    <Suspense fallback={<VisualizerSkeleton />}>
      <VisualizerComponent {...props} />
    </Suspense>
  );
}
