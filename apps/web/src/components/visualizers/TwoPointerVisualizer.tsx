'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Play, Pause, SkipForward, RotateCcw, ChevronDown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type TwoPointerAlgorithm = 'two-sum' | 'container-with-water' | 'remove-duplicates';

export interface TwoPointerVisualizerProps {
  data?: number[];
  speed?: number;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

type BoxState = 'default' | 'left' | 'right' | 'match' | 'nomatch' | 'processed';

interface TwoPointerStep {
  array: number[];
  left: number;
  right: number;
  states: BoxState[];
  description: string;
  infoLine: string;
  result?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const BOX_W  = 60;
const BOX_H  = 60;
const BOX_GAP = 8;
const SVG_H  = 180;
const SVG_PAD = 40;
const SPEED_TO_MS: Record<number, number> = { 1: 600, 2: 450, 3: 300, 4: 200, 5: 120 };

// ─── Step Generators ─────────────────────────────────────────────────────────
function twoSumSteps(arr: number[], target: number): TwoPointerStep[] {
  const a = [...arr].sort((x, y) => x - y);
  const steps: TwoPointerStep[] = [];
  let l = 0, r = a.length - 1;

  while (l < r) {
    const sum = a[l] + a[r];
    const states: BoxState[] = a.map((_, i) => i === l ? 'left' : i === r ? 'right' : 'default');
    const infoLine = `L=${l} (val: ${a[l]}) | R=${r} (val: ${a[r]}) | Sum=${sum} | Target=${target}`;

    if (sum === target) {
      const matchStates = states.map((s, i) => (i === l || i === r) ? 'match' : s);
      steps.push({ array: a, left: l, right: r, states: matchStates, description: `Found pair! ${a[l]} + ${a[r]} = ${target} ✓`, infoLine, result: `Pair found: [${a[l]}, ${a[r]}]` });
      break;
    } else if (sum < target) {
      steps.push({ array: a, left: l, right: r, states, description: `Sum ${sum} < ${target} → move left pointer right`, infoLine });
      l++;
    } else {
      steps.push({ array: a, left: l, right: r, states, description: `Sum ${sum} > ${target} → move right pointer left`, infoLine });
      r--;
    }
  }

  if (l >= r) {
    const noMatchStates: BoxState[] = a.map(() => 'nomatch');
    steps.push({ array: a, left: l, right: r, states: noMatchStates, description: `No pair found that sums to ${target}`, infoLine: `No solution found`, result: 'No pair found' });
  }

  return steps;
}

function containerWithWaterSteps(arr: number[]): TwoPointerStep[] {
  const a = [...arr];
  const steps: TwoPointerStep[] = [];
  let l = 0, r = a.length - 1;
  let maxArea = 0;

  while (l < r) {
    const area = Math.min(a[l], a[r]) * (r - l);
    maxArea = Math.max(maxArea, area);
    const states: BoxState[] = a.map((_, i) => i === l ? 'left' : i === r ? 'right' : 'default');
    const infoLine = `L=${l} (h: ${a[l]}) | R=${r} (h: ${a[r]}) | Area = min(${a[l]},${a[r]}) × (${r}-${l}) = ${area} | Max=${maxArea}`;
    steps.push({ array: a, left: l, right: r, states, description: `Area = ${area}, max so far = ${maxArea}`, infoLine });

    if (a[l] < a[r]) {
      steps.push({ array: a, left: l + 1, right: r, states, description: `Left height ${a[l]} is smaller → move left right`, infoLine });
      l++;
    } else {
      steps.push({ array: a, left: l, right: r - 1, states, description: `Right height ${a[r]} is smaller → move right left`, infoLine });
      r--;
    }
  }

  const finalStates: BoxState[] = a.map(() => 'match');
  steps.push({ array: a, left: l, right: r, states: finalStates, description: `Maximum water container area = ${maxArea} ✓`, infoLine: `Max area = ${maxArea}`, result: `Max area: ${maxArea}` });
  return steps;
}

function removeDuplicatesSteps(arr: number[]): TwoPointerStep[] {
  const a = [...arr].sort((x, y) => x - y);
  const steps: TwoPointerStep[] = [];
  let slow = 0;

  for (let fast = 1; fast < a.length; fast++) {
    const states: BoxState[] = a.map((_, i) => i === slow ? 'left' : i === fast ? 'right' : i < slow ? 'processed' : 'default');
    const infoLine = `Slow=${slow} (val: ${a[slow]}) | Fast=${fast} (val: ${a[fast]})`;
    if (a[fast] !== a[slow]) {
      slow++;
      steps.push({ array: a, left: slow, right: fast, states, description: `${a[fast]} ≠ ${a[slow - 1]} → advance slow, copy ${a[fast]} to index ${slow}`, infoLine });
      a[slow] = a[fast];
    } else {
      steps.push({ array: a, left: slow, right: fast, states, description: `${a[fast]} = ${a[slow]} → duplicate, fast advances`, infoLine });
    }
  }

  const finalStates: BoxState[] = a.map((_, i) => i <= slow ? 'match' : 'default');
  steps.push({ array: a, left: slow, right: a.length - 1, states: finalStates, description: `Done! Unique elements in [0..${slow}]: ${a.slice(0, slow + 1).join(', ')} ✓`, infoLine: `${slow + 1} unique elements`, result: `${slow + 1} unique values` });
  return steps;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function TwoPointerVisualizer({
  data = [2, 7, 11, 15, 1, 8, 3],
  speed = 2,
  isPlaying: externalPlaying,
  onPlayStateChange,
}: TwoPointerVisualizerProps) {
  const svgRef   = useRef<SVGSVGElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [algorithm, setAlgorithm]     = useState<TwoPointerAlgorithm>('two-sum');
  const [array, setArray]             = useState<number[]>(data);
  const [steps, setSteps]             = useState<TwoPointerStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlayingLocal] = useState(false);
  const [description, setDescription] = useState('Press Play to start.');
  const [infoLine, setInfoLine]       = useState('');
  const [result, setResult]           = useState('');
  const [inputVal, setInputVal]       = useState(data.join(', '));
  const [target, setTarget]           = useState('9');

  const effectiveSpeed = Math.min(5, Math.max(1, speed));

  useEffect(() => { if (externalPlaying !== undefined) setIsPlayingLocal(externalPlaying); }, [externalPlaying]);

  const setPlaying = useCallback((v: boolean) => {
    setIsPlayingLocal(v);
    onPlayStateChange?.(v);
  }, [onPlayStateChange]);

  const buildSteps = useCallback(() => {
    let s: TwoPointerStep[] = [];
    switch (algorithm) {
      case 'two-sum':            s = twoSumSteps(array, parseInt(target) || 9); break;
      case 'container-with-water': s = containerWithWaterSteps(array); break;
      case 'remove-duplicates':  s = removeDuplicatesSteps(array); break;
    }
    setSteps(s);
    setCurrentStep(-1);
    setDescription('Press Play to start.');
    setInfoLine('');
    setResult('');
    setPlaying(false);
  }, [algorithm, array, target, setPlaying]);

  useEffect(() => { buildSteps(); }, [buildSteps]);

  // ─── D3 render ───────────────────────────────────────────────────────────
  const renderArray = useCallback((step: TwoPointerStep | null, displayArr: number[]) => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current) return;

    const svgWidth = SVG_PAD * 2 + displayArr.length * (BOX_W + BOX_GAP) - BOX_GAP;
    svg.attr('width', svgWidth).attr('height', SVG_H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${SVG_PAD}, 50)`);

    const states = step?.states ?? new Array(displayArr.length).fill('default');
    const leftIdx = step?.left ?? -1;
    const rightIdx = step?.right ?? -1;

    displayArr.forEach((val, i) => {
      const x = i * (BOX_W + BOX_GAP);
      const state = states[i];

      const fillColor = state === 'match'     ? 'rgba(34,197,94,0.15)'   :
                        state === 'nomatch'   ? 'rgba(226,75,74,0.10)'   :
                        state === 'left'      ? 'rgba(59,130,246,0.15)'  :
                        state === 'right'     ? 'rgba(239,68,68,0.15)'   :
                        state === 'processed' ? 'rgba(99,153,34,0.10)'   :
                        'var(--bg-elevated)';

      const strokeColor = state === 'match'     ? '#22c55e' :
                          state === 'nomatch'   ? '#E24B4A' :
                          state === 'left'      ? '#3b82f6' :
                          state === 'right'     ? '#ef4444' :
                          state === 'processed' ? '#639922' :
                          'var(--border-default)';

      // Box
      g.append('rect')
        .attr('x', x).attr('y', 0)
        .attr('width', BOX_W).attr('height', BOX_H)
        .attr('rx', 8)
        .style('fill', fillColor)
        .style('stroke', strokeColor)
        .style('stroke-width', state !== 'default' ? 2 : 1);

      // Value
      g.append('text')
        .attr('x', x + BOX_W / 2).attr('y', BOX_H / 2 + 5)
        .attr('text-anchor', 'middle')
        .style('fill', state === 'default' ? 'var(--text-primary)' : strokeColor)
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(val);

      // Index
      g.append('text')
        .attr('x', x + BOX_W / 2).attr('y', BOX_H + 18)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-muted)')
        .style('font-size', '11px')
        .text(`[${i}]`);
    });

    // Left pointer triangle (blue, pointing up) below boxes
    if (leftIdx >= 0 && leftIdx < displayArr.length) {
      const x = leftIdx * (BOX_W + BOX_GAP) + BOX_W / 2;
      g.append('text')
        .attr('x', x).attr('y', BOX_H + 36)
        .attr('text-anchor', 'middle')
        .style('fill', '#3b82f6')
        .style('font-size', '16px')
        .text('▲');
      g.append('text')
        .attr('x', x).attr('y', BOX_H + 52)
        .attr('text-anchor', 'middle')
        .style('fill', '#3b82f6')
        .style('font-size', '10px')
        .style('font-weight', '700')
        .text('L');
    }

    // Right pointer triangle (red, pointing up) below boxes
    if (rightIdx >= 0 && rightIdx < displayArr.length && rightIdx !== leftIdx) {
      const x = rightIdx * (BOX_W + BOX_GAP) + BOX_W / 2;
      g.append('text')
        .attr('x', x).attr('y', BOX_H + 36)
        .attr('text-anchor', 'middle')
        .style('fill', '#ef4444')
        .style('font-size', '16px')
        .text('▲');
      g.append('text')
        .attr('x', x).attr('y', BOX_H + 52)
        .attr('text-anchor', 'middle')
        .style('fill', '#ef4444')
        .style('font-size', '10px')
        .style('font-weight', '700')
        .text('R');
    }
  }, []);

  useEffect(() => {
    const step = steps[currentStep] ?? null;
    renderArray(step, step?.array ?? array);
    if (step) {
      setDescription(step.description);
      setInfoLine(step.infoLine);
      if (step.result) setResult(step.result);
    }
  }, [currentStep, steps, array, renderArray]);

  useEffect(() => { renderArray(null, array); }, [array, renderArray]);

  // ─── Animation loop ───────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPlaying || steps.length === 0) return;

    timerRef.current = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) { setPlaying(false); return prev; }
        return next;
      });
    }, SPEED_TO_MS[effectiveSpeed]);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, steps, effectiveSpeed, setPlaying]);

  const handleStep = () => {
    setPlaying(false);
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleReset = () => {
    setPlaying(false);
    setCurrentStep(-1);
    buildSteps();
  };

  const handleApply = () => {
    try {
      const parsed = inputVal.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) setArray(parsed);
    } catch (_) {}
  };

  const svgWidth = SVG_PAD * 2 + array.length * (BOX_W + BOX_GAP) - BOX_GAP;

  return (
    <div className="flex flex-col gap-3 w-full h-full p-2">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center bg-[--bg-elevated] rounded-xl p-3 border border-[--border-default]">
        <div className="relative">
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value as TwoPointerAlgorithm)}
            className="appearance-none bg-[--bg-surface] border border-[--border-default] text-[--text-primary] text-xs px-3 py-1.5 pr-7 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer">
            <option value="two-sum">Two Sum (sorted)</option>
            <option value="container-with-water">Container With Water</option>
            <option value="remove-duplicates">Remove Duplicates</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[--text-muted] pointer-events-none" />
        </div>

        {algorithm === 'two-sum' && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[--text-muted]">Target:</span>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)}
              className="w-16 bg-[--bg-surface] border border-[--border-default] text-[--text-primary] text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        )}

        <div className="h-4 w-px bg-[--border-default]" />

        <div className="flex gap-1">
          <button onClick={() => setPlaying(!isPlaying)} className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-blue-400 transition-colors">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={handleStep} className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] transition-colors">
            <SkipForward size={16} />
          </button>
          <button onClick={handleReset} className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] transition-colors">
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Pointer legend */}
        <div className="ml-auto flex gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400 font-bold text-base leading-none">▲</span>
            <span className="text-[--text-muted]">Left (L)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 font-bold text-base leading-none">▲</span>
            <span className="text-[--text-muted]">Right (R)</span>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {infoLine && (
        <div className="bg-[--bg-elevated] border border-[--border-default] rounded-xl px-4 py-2 text-xs font-mono text-[--text-secondary]">
          {infoLine}
          {result && <span className="ml-3 text-emerald-400 font-bold">→ {result}</span>}
        </div>
      )}

      {/* SVG */}
      <div className="flex-1 flex items-center justify-center overflow-x-auto">
        <svg ref={svgRef} width={svgWidth} height={SVG_H} style={{ overflow: 'visible' }} />
      </div>

      {/* Custom input */}
      <div className="flex gap-2 items-center">
        <input value={inputVal} onChange={e => setInputVal(e.target.value)}
          placeholder="e.g. 2, 7, 11, 15"
          className="flex-1 bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[--text-muted]" />
        <button onClick={handleApply} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors font-medium">Apply</button>
      </div>

      {/* Step description */}
      <div className="bg-[--bg-elevated] border border-[--border-default] rounded-xl px-4 py-3 text-sm text-[--text-secondary] min-h-[48px] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />
        {description}
      </div>
    </div>
  );
}
