'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Play, Pause, SkipForward, RotateCcw, ChevronDown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Algorithm = 'traversal' | 'linear-search' | 'insert' | 'delete';

export interface ArrayVisualizerProps {
  data?: number[];
  speed?: number;            // 1–5
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

interface AnimationStep {
  type: 'highlight' | 'found' | 'notfound' | 'insert' | 'delete' | 'shift' | 'done';
  index: number;
  value?: number;
  description: string;
  array?: number[];
}

// ─── Constants ───────────────────────────────────────────────────────────────
const BOX_W    = 60;
const BOX_H    = 60;
const BOX_GAP  = 8;
const SVG_PAD  = 40;
const SVG_H    = 160; // boxes + index labels + pointer

const SPEED_TO_MS: Record<number, number> = { 1: 800, 2: 600, 3: 400, 4: 260, 5: 160 };

const COMPLEXITY: Record<Algorithm, string> = {
  'traversal':      'O(n) time · O(1) space',
  'linear-search':  'O(n) time · O(1) space',
  'insert':         'O(n) time · O(n) space',
  'delete':         'O(n) time · O(n) space',
};

// ─── Step generators ─────────────────────────────────────────────────────────
function traversalSteps(arr: number[]): AnimationStep[] {
  const steps: AnimationStep[] = arr.map((v, i) => ({
    type: 'highlight' as const,
    index: i,
    value: v,
    description: `Visiting index ${i} → value: ${v}`,
  }));
  steps.push({ type: 'done', index: -1, description: 'Traversal complete ✓' });
  return steps;
}

function linearSearchSteps(arr: number[], target: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  let found = false;
  for (let i = 0; i < arr.length; i++) {
    steps.push({ type: 'highlight', index: i, value: arr[i], description: `Checking index ${i}: ${arr[i]} === ${target}?` });
    if (arr[i] === target) {
      steps.push({ type: 'found', index: i, value: arr[i], description: `Found ${target} at index ${i} ✓` });
      found = true;
      break;
    }
  }
  if (!found) steps.push({ type: 'notfound', index: -1, description: `${target} not found in array ✗` });
  return steps;
}

function insertSteps(arr: number[], insertIdx: number, insertVal: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const copy = [...arr];
  // shift right from end to insertIdx
  for (let i = copy.length - 1; i >= insertIdx; i--) {
    steps.push({ type: 'shift', index: i, value: copy[i], description: `Shifting index ${i} → ${i + 1} to make room` });
  }
  copy.splice(insertIdx, 0, insertVal);
  steps.push({ type: 'insert', index: insertIdx, value: insertVal, array: [...copy], description: `Inserted ${insertVal} at index ${insertIdx} ✓` });
  steps.push({ type: 'done', index: -1, array: [...copy], description: 'Insert complete ✓' });
  return steps;
}

function deleteSteps(arr: number[], delIdx: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const copy = [...arr];
  const delVal = copy[delIdx];
  steps.push({ type: 'highlight', index: delIdx, value: delVal, description: `Removing index ${delIdx}: value ${delVal}` });
  for (let i = delIdx + 1; i < copy.length; i++) {
    steps.push({ type: 'shift', index: i, value: copy[i], description: `Shifting index ${i} → ${i - 1}` });
  }
  copy.splice(delIdx, 1);
  steps.push({ type: 'delete', index: -1, array: [...copy], description: `Deleted ${delVal}, array length is now ${copy.length} ✓` });
  return steps;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ArrayVisualizer({
  data = [12, 45, 7, 23, 67, 34, 89, 15],
  speed = 2,
  isPlaying: externalPlaying,
  onPlayStateChange,
}: ArrayVisualizerProps) {
  const svgRef       = useRef<SVGSVGElement>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const [array, setArray]               = useState<number[]>(data);
  const [algorithm, setAlgorithm]       = useState<Algorithm>('traversal');
  const [currentStep, setCurrentStep]   = useState(-1);
  const [steps, setSteps]               = useState<AnimationStep[]>([]);
  const [isPlaying, setIsPlayingLocal]  = useState(false);
  const [description, setDescription]  = useState('Press Play to start the animation.');
  const [inputVal, setInputVal]         = useState(data.join(', '));
  const [targetVal, setTargetVal]       = useState('67');
  const [insertIdx, setInsertIdx]       = useState('2');
  const [insertVal, setInsertVal]       = useState('99');
  const [deleteIdx, setDeleteIdx]       = useState('3');

  const effectiveSpeed = Math.min(5, Math.max(1, speed));

  // ─── Sync external isPlaying ─────────────────────────────────────────────
  useEffect(() => {
    if (externalPlaying !== undefined) setIsPlayingLocal(externalPlaying);
  }, [externalPlaying]);

  const setPlaying = useCallback((v: boolean) => {
    setIsPlayingLocal(v);
    onPlayStateChange?.(v);
  }, [onPlayStateChange]);

  // ─── Build steps when algorithm / array changes ──────────────────────────
  const buildSteps = useCallback(() => {
    let s: AnimationStep[] = [];
    switch (algorithm) {
      case 'traversal':     s = traversalSteps(array); break;
      case 'linear-search': s = linearSearchSteps(array, parseInt(targetVal) || 0); break;
      case 'insert':        s = insertSteps(array, parseInt(insertIdx) || 0, parseInt(insertVal) || 0); break;
      case 'delete':        s = deleteSteps(array, parseInt(deleteIdx) || 0); break;
    }
    setSteps(s);
    setCurrentStep(-1);
    setDescription('Press Play to start the animation.');
    setPlaying(false);
  }, [algorithm, array, targetVal, insertIdx, insertVal, deleteIdx, setPlaying]);

  useEffect(() => { buildSteps(); }, [buildSteps]);

  // ─── D3 render ───────────────────────────────────────────────────────────
  const renderArray = useCallback((displayArray: number[], highlightIdx: number, stepType: string) => {
    const svg = d3.select(svgRef.current);
    if (!svg || !svgRef.current) return;

    const svgWidth = SVG_PAD * 2 + displayArray.length * (BOX_W + BOX_GAP) - BOX_GAP;
    svg.attr('width', svgWidth).attr('height', SVG_H);

    // Clear and redraw
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${SVG_PAD}, 30)`);

    displayArray.forEach((val, i) => {
      const x = i * (BOX_W + BOX_GAP);
      const isHighlighted = i === highlightIdx;
      const isFound = stepType === 'found' && i === highlightIdx;
      const isNotFound = stepType === 'notfound';
      const isShifting = stepType === 'shift' && i === highlightIdx;

      // Box
      g.append('rect')
        .attr('x', x).attr('y', 0)
        .attr('width', BOX_W).attr('height', BOX_H)
        .attr('rx', 8)
        .style('fill', isFound ? 'rgba(34,197,94,0.15)' :
               isHighlighted && !isFound ? 'rgba(55,138,221,0.15)' :
               isShifting ? 'rgba(239,159,39,0.15)' :
               'var(--bg-elevated)')
        .style('stroke', isFound ? '#22c55e' :
               isHighlighted ? '#378ADD' :
               isShifting ? '#EF9F27' :
               'var(--border-default)')
        .style('stroke-width', isHighlighted || isFound || isShifting ? 2 : 1)
        .style('transition', 'all 0.2s');

      // Value text
      g.append('text')
        .attr('x', x + BOX_W / 2).attr('y', BOX_H / 2 + 5)
        .attr('text-anchor', 'middle')
        .style('fill', isFound ? '#22c55e' :
               isHighlighted ? '#378ADD' :
               'var(--text-primary)')
        .style('font-size', '16px')
        .style('font-weight', isHighlighted || isFound ? '700' : '500')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(val);

      // Index label
      g.append('text')
        .attr('x', x + BOX_W / 2).attr('y', BOX_H + 18)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-muted)')
        .style('font-size', '11px')
        .text(`[${i}]`);

      // Orange downward arrow pointer above active box
      if (isHighlighted && stepType !== 'done') {
        const arrowX = x + BOX_W / 2;
        g.append('text')
          .attr('x', arrowX).attr('y', -8)
          .attr('text-anchor', 'middle')
          .style('fill', '#EF9F27')
          .style('font-size', '18px')
          .text('▼');
      }
    });
  }, []);

  // ─── Animation loop ───────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isPlaying || steps.length === 0) return;

    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setPlaying(false);
          return prev;
        }
        const step = steps[next];
        setDescription(step.description);
        // If step mutates array (insert/delete), update array state
        if (step.array) setArray(step.array);
        return next;
      });
    }, SPEED_TO_MS[effectiveSpeed]);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, steps, effectiveSpeed, setPlaying]);

  // ─── Re-render SVG when step changes ─────────────────────────────────────
  useEffect(() => {
    const step = steps[currentStep];
    renderArray(array, step?.index ?? -1, step?.type ?? '');
  }, [currentStep, array, steps, renderArray]);

  // Initial render
  useEffect(() => { renderArray(array, -1, ''); }, [array, renderArray]);

  const handleStep = () => {
    setPlaying(false);
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, steps.length - 1);
      const step = steps[next];
      if (step) {
        setDescription(step.description);
        if (step.array) setArray(step.array);
      }
      return next;
    });
  };

  const handleReset = () => {
    setPlaying(false);
    setArray(data);
    setCurrentStep(-1);
    setDescription('Press Play to start the animation.');
    renderArray(data, -1, '');
    buildSteps();
  };

  const handleApply = () => {
    try {
      const parsed = inputVal.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) { setArray(parsed); }
    } catch (_) {}
  };

  const svgWidth = SVG_PAD * 2 + array.length * (BOX_W + BOX_GAP) - BOX_GAP;

  return (
    <div className="flex flex-col gap-4 w-full h-full p-2">
      {/* Controls Row */}
      <div className="flex flex-wrap gap-3 items-center bg-[--bg-elevated] rounded-xl p-3 border border-[--border-default]">
        {/* Algorithm selector */}
        <div className="relative">
          <select
            value={algorithm}
            onChange={e => setAlgorithm(e.target.value as Algorithm)}
            className="appearance-none bg-[--bg-surface] border border-[--border-default] text-[--text-primary] text-xs px-3 py-1.5 pr-7 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="traversal">Traversal</option>
            <option value="linear-search">Linear Search</option>
            <option value="insert">Insert at Index</option>
            <option value="delete">Delete at Index</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[--text-muted] pointer-events-none" />
        </div>

        {/* Algorithm-specific params */}
        {algorithm === 'linear-search' && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[--text-muted]">Target:</span>
            <input type="number" value={targetVal} onChange={e => setTargetVal(e.target.value)}
              className="w-16 bg-[--bg-surface] border border-[--border-default] text-[--text-primary] text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        )}
        {algorithm === 'insert' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[--text-muted]">At idx:</span>
              <input type="number" value={insertIdx} onChange={e => setInsertIdx(e.target.value)}
                className="w-14 bg-[--bg-surface] border border-[--border-default] text-[--text-primary] text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[--text-muted]">Value:</span>
              <input type="number" value={insertVal} onChange={e => setInsertVal(e.target.value)}
                className="w-14 bg-[--bg-surface] border border-[--border-default] text-[--text-primary] text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </>
        )}
        {algorithm === 'delete' && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[--text-muted]">Del idx:</span>
            <input type="number" value={deleteIdx} onChange={e => setDeleteIdx(e.target.value)}
              className="w-14 bg-[--bg-surface] border border-[--border-default] text-[--text-primary] text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        )}

        <div className="h-4 w-px bg-[--border-default] mx-1" />

        {/* Playback controls */}
        <div className="flex gap-1">
          <button onClick={() => setPlaying(!isPlaying)}
            className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-blue-400 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={handleStep}
            className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] transition-colors"
            title="Step">
            <SkipForward size={16} />
          </button>
          <button onClick={handleReset}
            className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] transition-colors"
            title="Reset">
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Complexity badge */}
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          {COMPLEXITY[algorithm]}
        </span>
      </div>

      {/* Custom input */}
      <div className="flex gap-2 items-center">
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="e.g. 12, 45, 7, 23, 67"
          className="flex-1 bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[--text-muted]"
        />
        <button onClick={handleApply}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors font-medium">
          Apply
        </button>
      </div>

      {/* SVG Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-x-auto">
        <svg ref={svgRef} width={svgWidth} height={SVG_H} style={{ overflow: 'visible' }} />
      </div>

      {/* Step description */}
      <div className="bg-[--bg-elevated] border border-[--border-default] rounded-xl px-4 py-3 text-sm text-[--text-secondary] min-h-[48px] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />
        {description}
      </div>
    </div>
  );
}
