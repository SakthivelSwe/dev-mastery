'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Play, Pause, SkipForward, RotateCcw, Shuffle, ChevronDown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
export type SortAlgorithm = 'bubble' | 'insertion' | 'selection' | 'merge' | 'quick';

export interface SortingVisualizerProps {
  data?: number[];
  speed?: number;
  algorithm?: SortAlgorithm;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

type BarState = 'default' | 'comparing' | 'swapping' | 'sorted';

interface SortStep {
  array: number[];
  states: BarState[];
  description: string;
  comparisons: number;
  swaps: number;
}

// ─── Colors ──────────────────────────────────────────────────────────────────
const BAR_COLORS: Record<BarState, string> = {
  default:   '#888780',
  comparing: '#EF9F27',
  swapping:  '#E24B4A',
  sorted:    '#639922',
};

const SPEED_TO_MS: Record<number, number> = { 1: 400, 2: 280, 3: 180, 4: 120, 5: 80 };

// ─── Step Generators ─────────────────────────────────────────────────────────
function bubbleSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let comps = 0, swaps = 0;
  const n = a.length;
  const sorted = new Array(n).fill(false);

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comps++;
      const states: BarState[] = a.map((_, k) => sorted[k] ? 'sorted' : 'default');
      states[j] = 'comparing'; states[j + 1] = 'comparing';
      steps.push({ array: [...a], states, description: `Comparing index ${j} (${a[j]}) and index ${j+1} (${a[j+1]})`, comparisons: comps, swaps });
      if (a[j] > a[j + 1]) {
        swaps++;
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        const swapStates: BarState[] = a.map((_, k) => sorted[k] ? 'sorted' : 'default');
        swapStates[j] = 'swapping'; swapStates[j + 1] = 'swapping';
        steps.push({ array: [...a], states: swapStates, description: `Swapping ${a[j+1]} ↔ ${a[j]}`, comparisons: comps, swaps });
      }
    }
    sorted[n - 1 - i] = true;
  }
  sorted[0] = true;
  const finalStates: BarState[] = a.map(() => 'sorted');
  steps.push({ array: [...a], states: finalStates, description: 'Sorting complete! ✓', comparisons: comps, swaps });
  return steps;
}

function insertionSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let comps = 0, swaps = 0;
  const n = a.length;

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      comps++;
      const states: BarState[] = new Array(n).fill('default');
      states[j] = 'comparing'; states[j + 1] = 'comparing';
      steps.push({ array: [...a], states, description: `Comparing index ${j} (${a[j]}) with key ${key}`, comparisons: comps, swaps });
      a[j + 1] = a[j];
      swaps++;
      j--;
    }
    a[j + 1] = key;
    steps.push({ array: [...a], states: new Array(n).fill('default'), description: `Placed ${key} at index ${j + 1}`, comparisons: comps, swaps });
  }
  steps.push({ array: [...a], states: new Array(n).fill('sorted'), description: 'Sorting complete! ✓', comparisons: comps, swaps });
  return steps;
}

function selectionSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let comps = 0, swaps = 0;
  const n = a.length;
  const sorted = new Array(n).fill(false);

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comps++;
      const states: BarState[] = a.map((_, k) => sorted[k] ? 'sorted' : 'default');
      states[minIdx] = 'comparing'; states[j] = 'comparing';
      steps.push({ array: [...a], states, description: `Finding min: index ${j} (${a[j]}) vs current min index ${minIdx} (${a[minIdx]})`, comparisons: comps, swaps });
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      swaps++;
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      const states: BarState[] = a.map((_, k) => sorted[k] ? 'sorted' : 'default');
      states[i] = 'swapping'; states[minIdx] = 'swapping';
      steps.push({ array: [...a], states, description: `Swapping index ${i} (${a[minIdx]}) with min at index ${minIdx} (${a[i]})`, comparisons: comps, swaps });
    }
    sorted[i] = true;
  }
  sorted[n - 1] = true;
  steps.push({ array: [...a], states: new Array(n).fill('sorted'), description: 'Sorting complete! ✓', comparisons: comps, swaps });
  return steps;
}

function mergeSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let comps = 0, swaps = 0;

  function mergeParts(arr: number[], l: number, m: number, r: number) {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      comps++;
      const states: BarState[] = new Array(arr.length).fill('default');
      states[k] = 'comparing';
      steps.push({ array: [...arr], states, description: `Merging: comparing ${left[i]} and ${right[j]}`, comparisons: comps, swaps });
      if (left[i] <= right[j]) { arr[k++] = left[i++]; }
      else { arr[k++] = right[j++]; swaps++; }
    }
    while (i < left.length) { arr[k++] = left[i++]; }
    while (j < right.length) { arr[k++] = right[j++]; }
    const mergeStates: BarState[] = new Array(arr.length).fill('default');
    for (let x = l; x <= r; x++) mergeStates[x] = 'swapping';
    steps.push({ array: [...arr], states: mergeStates, description: `Merged subarray [${l}..${r}]`, comparisons: comps, swaps });
  }

  function sort(arr: number[], l: number, r: number) {
    if (l < r) {
      const m = Math.floor((l + r) / 2);
      sort(arr, l, m);
      sort(arr, m + 1, r);
      mergeParts(arr, l, m, r);
    }
  }

  sort(a, 0, a.length - 1);
  steps.push({ array: [...a], states: new Array(a.length).fill('sorted'), description: 'Merge Sort complete! ✓', comparisons: comps, swaps });
  return steps;
}

function quickSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const a = [...arr];
  let comps = 0, swaps = 0;

  function partition(arr: number[], low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comps++;
      const states: BarState[] = new Array(arr.length).fill('default');
      states[high] = 'comparing'; states[j] = 'comparing';
      steps.push({ array: [...arr], states, description: `Quick Sort: comparing ${arr[j]} with pivot ${pivot}`, comparisons: comps, swaps });
      if (arr[j] <= pivot) {
        i++;
        swaps++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        const swapStates: BarState[] = new Array(arr.length).fill('default');
        swapStates[i] = 'swapping'; swapStates[j] = 'swapping';
        steps.push({ array: [...arr], states: swapStates, description: `Swapping ${arr[j]} ↔ ${arr[i]}`, comparisons: comps, swaps });
      }
    }
    swaps++;
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }

  function sort(arr: number[], low: number, high: number) {
    if (low < high) {
      const pi = partition(arr, low, high);
      sort(arr, low, pi - 1);
      sort(arr, pi + 1, high);
    }
  }

  sort(a, 0, a.length - 1);
  steps.push({ array: [...a], states: new Array(a.length).fill('sorted'), description: 'Quick Sort complete! ✓', comparisons: comps, swaps });
  return steps;
}

const ALGO_GENERATORS: Record<SortAlgorithm, (arr: number[]) => SortStep[]> = {
  bubble: bubbleSort, insertion: insertionSort, selection: selectionSort,
  merge: mergeSort, quick: quickSort,
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function SortingVisualizer({
  data = [64, 34, 25, 12, 22, 11, 90, 45, 70, 20],
  speed = 2,
  algorithm: externalAlgo,
  isPlaying: externalPlaying,
  onPlayStateChange,
}: SortingVisualizerProps) {
  const svgRef     = useRef<SVGSVGElement>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const [array, setArray]             = useState<number[]>(data);
  const [algorithm, setAlgorithm]     = useState<SortAlgorithm>(externalAlgo ?? 'bubble');
  const [steps, setSteps]             = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlayingLocal] = useState(false);
  const [description, setDescription] = useState('Press Play to start sorting.');
  const [inputVal, setInputVal]       = useState(data.join(', '));

  const effectiveSpeed = Math.min(5, Math.max(1, speed));

  useEffect(() => { if (externalAlgo) setAlgorithm(externalAlgo); }, [externalAlgo]);
  useEffect(() => { if (externalPlaying !== undefined) setIsPlayingLocal(externalPlaying); }, [externalPlaying]);

  const setPlaying = useCallback((v: boolean) => {
    setIsPlayingLocal(v);
    onPlayStateChange?.(v);
  }, [onPlayStateChange]);

  const buildSteps = useCallback(() => {
    const s = ALGO_GENERATORS[algorithm]([...array]);
    setSteps(s);
    setCurrentStep(-1);
    setDescription('Press Play to start sorting.');
    setPlaying(false);
  }, [algorithm, array, setPlaying]);

  useEffect(() => { buildSteps(); }, [buildSteps]);

  // ─── D3 bar chart render ──────────────────────────────────────────────────
  const renderBars = useCallback((step: SortStep | null) => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current) return;

    const displayArr = step?.array ?? array;
    const displayStates = step?.states ?? new Array(displayArr.length).fill('default');

    const width = svgRef.current.parentElement?.clientWidth || 600;
    const height = 280;
    const barW = Math.max(20, Math.floor((width - 40) / displayArr.length) - 2);
    const maxVal = Math.max(...displayArr, 1);

    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', 'translate(20, 10)');

    displayArr.forEach((val, i) => {
      const barH = Math.max(4, Math.round((val / maxVal) * 260));
      const x = i * (barW + 2);
      const y = 260 - barH;
      const color = BAR_COLORS[displayStates[i] as BarState];

      g.append('rect')
        .attr('x', x).attr('y', y)
        .attr('width', barW).attr('height', barH)
        .attr('rx', 3)
        .style('fill', color)
        .style('transition', 'fill 0.1s');

      if (barW >= 24) {
        g.append('text')
          .attr('x', x + barW / 2).attr('y', y - 4)
          .attr('text-anchor', 'middle')
          .style('fill', 'var(--text-muted)')
          .style('font-size', '10px')
          .text(val);
      }
    });
  }, [array]);

  useEffect(() => {
    const step = steps[currentStep] ?? null;
    renderBars(step);
    if (step) {
      setDescription(step.description);
    }
  }, [currentStep, steps, renderBars]);

  useEffect(() => { renderBars(null); }, [array, renderBars]);

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

  const currentInfo = steps[currentStep] ?? { comparisons: 0, swaps: 0 };

  const handleShuffle = () => {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    setArray(shuffled);
    setInputVal(shuffled.join(', '));
  };

  const handleApply = () => {
    try {
      const parsed = inputVal.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) setArray(parsed);
    } catch (_) {}
  };

  const handleStep = () => {
    setPlaying(false);
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleReset = () => {
    setPlaying(false);
    setCurrentStep(-1);
    setDescription('Press Play to start sorting.');
    buildSteps();
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full p-2">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center bg-[--bg-elevated] rounded-xl p-3 border border-[--border-default]">
        <div className="relative">
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value as SortAlgorithm)}
            className="appearance-none bg-[--bg-surface] border border-[--border-default] text-[--text-primary] text-xs px-3 py-1.5 pr-7 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer">
            <option value="bubble">Bubble Sort</option>
            <option value="insertion">Insertion Sort</option>
            <option value="selection">Selection Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[--text-muted] pointer-events-none" />
        </div>

        <div className="h-4 w-px bg-[--border-default]" />

        <div className="flex gap-1">
          <button onClick={() => setPlaying(!isPlaying)} className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-amber-400 transition-colors">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={handleStep} className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] transition-colors">
            <SkipForward size={16} />
          </button>
          <button onClick={handleReset} className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary] transition-colors">
            <RotateCcw size={16} />
          </button>
          <button onClick={handleShuffle} className="p-2 rounded-lg hover:bg-[--bg-surface] text-[--text-secondary] hover:text-purple-400 transition-colors">
            <Shuffle size={16} />
          </button>
        </div>

        {/* Live counters */}
        <div className="ml-auto flex gap-3 text-xs font-mono">
          <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
            Comparisons: {currentInfo.comparisons}
          </span>
          <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/20">
            Swaps: {currentInfo.swaps}
          </span>
        </div>
      </div>

      {/* Color legend */}
      <div className="flex gap-4 text-xs">
        {(Object.entries(BAR_COLORS) as [BarState, string][]).map(([state, color]) => (
          <div key={state} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span className="text-[--text-muted] capitalize">{state}</span>
          </div>
        ))}
      </div>

      {/* SVG Bar Chart */}
      <div className="flex-1 flex flex-col items-center justify-center rounded-xl bg-[--bg-elevated] border border-[--border-default] p-3 overflow-hidden">
        <svg ref={svgRef} style={{ width: '100%' }} />
      </div>

      {/* Custom input */}
      <div className="flex gap-2 items-center">
        <input value={inputVal} onChange={e => setInputVal(e.target.value)}
          placeholder="e.g. 64, 34, 25, 12, 22, 11"
          className="flex-1 bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-[--text-muted]" />
        <button onClick={handleApply} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg transition-colors font-medium">Apply</button>
      </div>

      {/* Step description */}
      <div className="bg-[--bg-elevated] border border-[--border-default] rounded-xl px-4 py-3 text-sm text-[--text-secondary] min-h-[48px] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
        {description}
      </div>
    </div>
  );
}
