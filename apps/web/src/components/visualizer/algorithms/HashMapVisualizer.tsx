'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw, Plus, Search, Trash2 } from 'lucide-react';

interface HashMapVisualizerProps {
  data?: any;
  speed?: number;
  stepMode?: boolean;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface BucketNode {
  key: string;
  value: string;
  hash: number;
  highlight?: boolean;
  isNew?: boolean;
}

interface Bucket {
  index: number;
  nodes: BucketNode[];
  treeified?: boolean;
  highlight?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────
const DEFAULT_CAPACITY = 16;
const TREEIFY_THRESHOLD = 8;
const LOAD_FACTOR = 0.75;

// ─── Simple hash for display purposes ────────────────────────────────────
function simpleHash(key: string, capacity: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  }
  // Simulate Java's HashMap spread: (n - 1) & (h ^ (h >>> 16))
  const spread = h ^ (h >>> 16);
  return ((capacity - 1) & spread + capacity) % capacity;
}

function hashCode(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  }
  return h;
}

// ─── Scene tabs ───────────────────────────────────────────────────────────
const SCENES = [
  { id: 'interactive', title: 'Interactive Put / Get', subtitle: 'Build your own HashMap' },
  { id: 'collision',   title: 'Collision Resolution', subtitle: 'Chaining → TreeMap' },
  { id: 'rehash',      title: 'Rehashing',            subtitle: 'Load Factor & Resize' },
];

// ─── Bucket Visualization ────────────────────────────────────────────────

function BucketVisual({ bucket, capacity }: { bucket: Bucket; capacity: number }) {
  const isChain = bucket.nodes.length > 1;
  const isTree  = bucket.treeified;
  const isEmpty = bucket.nodes.length === 0;

  return (
    <div className={`flex items-start gap-1 py-1 px-1 rounded-md transition-all duration-300 ${
      bucket.highlight ? 'bg-indigo-500/10 ring-1 ring-indigo-500/40' : ''
    }`}>
      {/* Bucket index */}
      <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-xs font-mono font-bold border ${
        isEmpty
          ? 'text-[--text-muted] border-[--border-default] bg-[--bg-elevated]'
          : 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10'
      }`}>
        {bucket.index}
      </div>

      {/* Nodes */}
      {isEmpty ? (
        <div className="h-8 flex items-center text-xs text-[--text-muted] italic pl-1">null</div>
      ) : (
        <div className={`flex items-center gap-1 flex-wrap ${isTree ? 'pl-1' : ''}`}>
          {isTree && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5 mr-1 font-bold">
              🌳 Tree
            </span>
          )}
          {bucket.nodes.map((node, i) => (
            <React.Fragment key={`${node.key}-${i}`}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex flex-col items-center px-2.5 py-1 rounded border text-xs font-mono min-w-[64px] ${
                  node.highlight || node.isNew
                    ? 'border-green-500/60 bg-green-500/15 text-green-300'
                    : 'border-[--border-default] bg-[--bg-elevated] text-[--text-secondary]'
                }`}
              >
                <span className="text-[10px] text-[--text-muted] leading-none">{node.key}</span>
                <span className="font-bold">{node.value}</span>
              </motion.div>
              {i < bucket.nodes.length - 1 && (
                <span className="text-[--text-muted] text-xs">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Scene 1: Interactive Put/Get ─────────────────────────────────────────

function InteractiveScene() {
  const capacity = DEFAULT_CAPACITY;
  const [buckets, setBuckets] = useState<Bucket[]>(() =>
    Array.from({ length: capacity }, (_, i) => ({ index: i, nodes: [] }))
  );
  const [keyInput, setKeyInput]     = useState('');
  const [valueInput, setValueInput] = useState('');
  const [getKey, setGetKey]         = useState('');
  const [log, setLog]               = useState<string[]>([]);
  const [highlightBucket, setHighlightBucket] = useState<number | null>(null);
  const [getResult, setGetResult]   = useState<string | null>(null);
  const [totalEntries, setTotalEntries] = useState(0);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 8));
  }, []);

  const handlePut = useCallback(() => {
    const key = keyInput.trim();
    const val = valueInput.trim();
    if (!key || !val) return;

    const idx = simpleHash(key, capacity);
    const hc  = hashCode(key);

    setHighlightBucket(idx);
    setTimeout(() => setHighlightBucket(null), 1500);

    setBuckets(prev => {
      const next = prev.map(b => ({ ...b, highlight: false, nodes: b.nodes.map(n => ({ ...n, highlight: false, isNew: false })) }));
      const bucket = { ...next[idx], nodes: [...next[idx].nodes] };

      // Check if key already exists (update)
      const existing = bucket.nodes.findIndex(n => n.key === key);
      if (existing !== -1) {
        addLog(`🔄 UPDATE  bucket[${idx}] key="${key}" → "${val}"  (hash=${hc})`);
        bucket.nodes[existing] = { ...bucket.nodes[existing], value: val, isNew: true };
      } else {
        addLog(`➕ PUT  bucket[${idx}] key="${key}", value="${val}"  (hash=${hc})`);
        bucket.nodes.push({ key, value: val, hash: hc, isNew: true, highlight: false });
        setTotalEntries(t => t + 1);
      }

      // Treeify if needed
      if (bucket.nodes.length >= TREEIFY_THRESHOLD) {
        bucket.treeified = true;
        addLog(`🌳 TREEIFY! Bucket[${idx}] has ${bucket.nodes.length} nodes → converted to Red-Black Tree`);
      }

      bucket.highlight = true;
      next[idx] = bucket;
      return next;
    });

    setKeyInput('');
    setValueInput('');
  }, [keyInput, valueInput, capacity, addLog]);

  const handleGet = useCallback(() => {
    const key = getKey.trim();
    if (!key) return;

    const idx = simpleHash(key, capacity);
    const hc  = hashCode(key);
    setHighlightBucket(idx);
    setTimeout(() => setHighlightBucket(null), 1500);

    setBuckets(prev => prev.map((b, i) => ({
      ...b,
      highlight: i === idx,
      nodes: b.nodes.map(n => ({ ...n, highlight: n.key === key })),
    })));

    const bucket = buckets[idx];
    const found  = bucket.nodes.find(n => n.key === key);

    if (found) {
      setGetResult(`"${found.value}"`);
      addLog(`🔍 GET bucket[${idx}] key="${key}" → found "${found.value}"  (hash=${hc})`);
    } else {
      setGetResult('null');
      addLog(`🔍 GET bucket[${idx}] key="${key}" → not found  (hash=${hc})`);
    }

    setGetKey('');
    setTimeout(() => setGetResult(null), 3000);
  }, [getKey, buckets, capacity, addLog]);

  const handleReset = () => {
    setBuckets(Array.from({ length: capacity }, (_, i) => ({ index: i, nodes: [] })));
    setLog([]);
    setTotalEntries(0);
    setGetResult(null);
  };

  const usedBuckets  = buckets.filter(b => b.nodes.length > 0).length;
  const loadPercent  = Math.round((totalEntries / (capacity * LOAD_FACTOR)) * 100);
  const willRehash   = totalEntries >= Math.floor(capacity * LOAD_FACTOR);

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden">
      {/* Left: Bucket Array */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-bold text-[--text-muted] uppercase tracking-wider">
            Node[] table  (capacity={capacity})
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
            willRehash
              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
              : loadPercent > 60
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-green-500/20 text-green-400 border-green-500/40'
          }`}>
            load {loadPercent}%  {willRehash ? '⚠️ REHASH!' : ''}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          {buckets.map(bucket => (
            <BucketVisual
              key={bucket.index}
              bucket={{ ...bucket, highlight: bucket.index === highlightBucket || bucket.highlight }}
              capacity={capacity}
            />
          ))}
        </div>
      </div>

      {/* Right: Controls + Log */}
      <div className="w-64 flex flex-col gap-3 flex-shrink-0">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[--bg-elevated] rounded-lg p-2 border border-[--border-default] text-center">
            <div className="text-lg font-bold text-indigo-400">{totalEntries}</div>
            <div className="text-[10px] text-[--text-muted]">entries</div>
          </div>
          <div className="bg-[--bg-elevated] rounded-lg p-2 border border-[--border-default] text-center">
            <div className="text-lg font-bold text-purple-400">{usedBuckets}</div>
            <div className="text-[10px] text-[--text-muted]">buckets used</div>
          </div>
        </div>

        {/* PUT controls */}
        <div className="bg-[--bg-elevated] rounded-xl border border-[--border-default] p-3 flex flex-col gap-2">
          <div className="text-xs font-bold text-[--text-primary] flex items-center gap-1.5">
            <Plus size={12} className="text-green-400" /> map.put(key, value)
          </div>
          <input
            className="bg-[--bg-surface] border border-[--border-default] rounded-lg px-3 py-1.5 text-xs font-mono text-[--text-primary] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            placeholder="key"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePut()}
          />
          <input
            className="bg-[--bg-surface] border border-[--border-default] rounded-lg px-3 py-1.5 text-xs font-mono text-[--text-primary] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            placeholder="value"
            value={valueInput}
            onChange={e => setValueInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePut()}
          />
          <button
            onClick={handlePut}
            disabled={!keyInput.trim() || !valueInput.trim()}
            className="w-full py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold hover:bg-green-500/30 disabled:opacity-40 transition-colors"
          >
            put( )
          </button>
        </div>

        {/* GET controls */}
        <div className="bg-[--bg-elevated] rounded-xl border border-[--border-default] p-3 flex flex-col gap-2">
          <div className="text-xs font-bold text-[--text-primary] flex items-center gap-1.5">
            <Search size={12} className="text-blue-400" /> map.get(key)
          </div>
          <input
            className="bg-[--bg-surface] border border-[--border-default] rounded-lg px-3 py-1.5 text-xs font-mono text-[--text-primary] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            placeholder="key to look up"
            value={getKey}
            onChange={e => setGetKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGet()}
          />
          <button
            onClick={handleGet}
            disabled={!getKey.trim()}
            className="w-full py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/30 disabled:opacity-40 transition-colors"
          >
            get( )
          </button>
          <AnimatePresence>
            {getResult !== null && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-center text-sm font-bold font-mono rounded-lg py-1.5 border ${
                  getResult === 'null'
                    ? 'text-red-400 bg-red-500/10 border-red-500/30'
                    : 'text-green-400 bg-green-500/10 border-green-500/30'
                }`}
              >
                → {getResult}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-1.5 text-xs text-[--text-muted] hover:text-[--text-primary] py-1.5 rounded-lg border border-[--border-default] hover:border-[--border-muted] transition-colors"
        >
          <RotateCcw size={11} /> Reset Map
        </button>

        {/* Log */}
        <div className="flex-1 bg-[#0d1117] rounded-xl border border-[--border-default] overflow-hidden">
          <div className="px-3 py-1.5 border-b border-[--border-default] bg-[--bg-elevated] text-[10px] font-bold text-[--text-muted] uppercase tracking-wider">
            Operation Log
          </div>
          <div className="p-2 flex flex-col gap-1 overflow-y-auto max-h-40">
            {log.length === 0 ? (
              <div className="text-[10px] text-[--text-muted] italic text-center mt-4">
                Try put("name", "Alice")
              </div>
            ) : (
              log.map((entry, i) => (
                <div key={i} className={`text-[10px] font-mono leading-relaxed ${i === 0 ? 'text-[--text-secondary]' : 'text-[--text-muted]'}`}>
                  {entry}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 2: Collision Resolution ───────────────────────────────────────

const COLLISION_STEPS = [
  {
    title: 'Start: Empty HashMap (capacity=4 for demo)',
    desc: 'We use a tiny capacity=4 to force collisions easily. The bucket array has 4 slots (index 0–3).',
    buckets: [
      { index: 0, nodes: [], highlight: false },
      { index: 1, nodes: [], highlight: false },
      { index: 2, nodes: [], highlight: false },
      { index: 3, nodes: [], highlight: false },
    ] as Bucket[],
    hashCalc: '',
  },
  {
    title: 'put("cat", 1)  →  hash("cat") & 3 = 2',
    desc: 'hashCode("cat") = 98262  →  spread = 98262 ^ (98262 >>> 16) = 98261  →  98261 & 3 = 1. Placed at bucket[1].',
    buckets: [
      { index: 0, nodes: [], highlight: false },
      { index: 1, nodes: [{ key: 'cat', value: '1', hash: 98262, isNew: true }], highlight: true },
      { index: 2, nodes: [], highlight: false },
      { index: 3, nodes: [], highlight: false },
    ] as Bucket[],
    hashCalc: 'hash("cat") & (4-1) = bucket[1]',
  },
  {
    title: 'put("dog", 2)  →  Collision! Same bucket[1]',
    desc: 'hash("dog") also maps to bucket[1]. Java creates a singly-linked list: cat → dog. Both entries coexist in the same bucket.',
    buckets: [
      { index: 0, nodes: [], highlight: false },
      { index: 1, nodes: [
        { key: 'cat', value: '1', hash: 98262 },
        { key: 'dog', value: '2', hash: 99304, isNew: true },
      ], highlight: true },
      { index: 2, nodes: [], highlight: false },
      { index: 3, nodes: [], highlight: false },
    ] as Bucket[],
    hashCalc: 'hash("dog") & 3 = bucket[1]  ← COLLISION',
  },
  {
    title: 'get("dog")  →  Linear scan within bucket[1]',
    desc: 'HashMap goes to bucket[1], then walks the linked list: node.key == "cat"? No. node.key == "dog"? Yes! Returns 2. This is why many collisions hurt: O(n) scan within bucket.',
    buckets: [
      { index: 0, nodes: [], highlight: false },
      { index: 1, nodes: [
        { key: 'cat', value: '1', hash: 98262, highlight: false },
        { key: 'dog', value: '2', hash: 99304, highlight: true },
      ], highlight: true },
      { index: 2, nodes: [], highlight: false },
      { index: 3, nodes: [], highlight: false },
    ] as Bucket[],
    hashCalc: 'Scan: cat≠dog → dog==dog ✓ → return 2',
  },
  {
    title: 'Java 8: After 8 nodes → TREEIFY to Red-Black Tree',
    desc: 'When a bucket has ≥8 nodes (TREEIFY_THRESHOLD), Java converts the linked list into a Red-Black Tree. O(n) lookup becomes O(log n). This protects against hash-flooding denial-of-service attacks.',
    buckets: [
      { index: 0, nodes: [], highlight: false },
      { index: 1, nodes: [
        { key: 'a1', value: 'v', hash: 1 },
        { key: 'a2', value: 'v', hash: 2 },
        { key: 'a3', value: 'v', hash: 3 },
        { key: 'a4', value: 'v', hash: 4 },
        { key: 'a5', value: 'v', hash: 5 },
        { key: 'a6', value: 'v', hash: 6 },
        { key: 'a7', value: 'v', hash: 7 },
        { key: 'a8', value: 'v', hash: 8, isNew: true },
      ], treeified: true, highlight: true },
      { index: 2, nodes: [], highlight: false },
      { index: 3, nodes: [], highlight: false },
    ] as Bucket[],
    hashCalc: `bucket.size() >= ${TREEIFY_THRESHOLD} → TreeNode.treeify()`,
  },
];

function CollisionScene() {
  const [step, setStep] = useState(0);
  const current = COLLISION_STEPS[step];

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Step stepper */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {COLLISION_STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-7 h-7 rounded-full text-xs font-bold border transition-all ${
                i === step
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : i < step
                  ? 'bg-[--bg-elevated] text-indigo-400 border-indigo-500/40'
                  : 'bg-[--bg-elevated] text-[--text-muted] border-[--border-default]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep(0)}
          className="flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--text-primary] transition-colors"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      {/* Step title + description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
              Step {step + 1}/{COLLISION_STEPS.length}
            </span>
            <span className="text-sm font-semibold text-[--text-primary] font-mono">{current.title}</span>
          </div>
          <p className="text-sm text-[--text-secondary] leading-relaxed bg-[--bg-elevated] rounded-xl p-3 border border-[--border-default]">
            {current.desc}
          </p>
          {current.hashCalc && (
            <div className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              🔢 {current.hashCalc}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bucket array */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`buckets-${step}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-1 flex-1"
        >
          <span className="text-[10px] font-bold text-[--text-muted] uppercase tracking-wider mb-1">
            Node[] table (capacity=4)
          </span>
          {current.buckets.map(bucket => (
            <BucketVisual key={bucket.index} bucket={bucket} capacity={4} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-auto">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[--border-default] text-xs text-[--text-muted] hover:text-[--text-primary] hover:border-[--border-muted] disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={13} /> Previous
        </button>
        <button
          onClick={() => setStep(s => Math.min(COLLISION_STEPS.length - 1, s + 1))}
          disabled={step === COLLISION_STEPS.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-500/25 disabled:opacity-30 transition-all"
        >
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Scene 3: Rehashing ───────────────────────────────────────────────────

const REHASH_STEPS = [
  {
    title: 'Initial HashMap: capacity=4, load factor=0.75',
    desc: 'Rehash threshold = capacity × loadFactor = 4 × 0.75 = 3 entries. When the 4th entry is added, a resize is triggered.',
    capacity: 4,
    entries: 0,
    threshold: 3,
    phase: 'normal' as const,
  },
  {
    title: 'Add 3 entries → 75% full (at threshold)',
    desc: 'The map now has 3 entries (threshold reached). Next put() will trigger a resize. Note: even though 25% of buckets are empty, the LOAD FACTOR determines resize timing — not bucket fullness.',
    capacity: 4,
    entries: 3,
    threshold: 3,
    phase: 'warning' as const,
  },
  {
    title: 'Add 4th entry → RESIZE triggered!',
    desc: 'The map doubles: new capacity = 8. Every existing entry is rehashed against the new capacity and moved. This is an O(n) operation — all n entries must be re-inserted.',
    capacity: 8,
    entries: 4,
    threshold: 6,
    phase: 'resize' as const,
  },
  {
    title: 'After resize: 8 buckets, new threshold = 6',
    desc: 'All entries are rehashed with the new capacity. Some entries may move to completely different buckets because the index formula uses the new capacity: (newCapacity - 1) & hash. The map can now grow to 6 entries before the next resize.',
    capacity: 8,
    entries: 4,
    threshold: 6,
    phase: 'done' as const,
  },
];

function RehashScene() {
  const [step, setStep] = useState(0);
  const current = REHASH_STEPS[step];

  const buckets = Array.from({ length: current.capacity }, (_, i) => ({
    index: i,
    filled: i < current.entries,
    highlight: current.phase === 'resize' && i < 4,
  }));

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {REHASH_STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-7 h-7 rounded-full text-xs font-bold border transition-all ${
                i === step ? 'bg-amber-500 text-white border-amber-500'
                : i < step  ? 'bg-[--bg-elevated] text-amber-400 border-amber-500/40'
                : 'bg-[--bg-elevated] text-[--text-muted] border-[--border-default]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button onClick={() => setStep(0)} className="flex items-center gap-1 text-xs text-[--text-muted] hover:text-[--text-primary]">
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      {/* Step info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${
              current.phase === 'resize' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
              : current.phase === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : current.phase === 'done'   ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'bg-[--bg-elevated] text-[--text-muted] border-[--border-default]'
            }`}>
              {current.phase === 'resize' ? '⚡ REHASHING' : `Step ${step + 1}`}
            </span>
            <span className="text-sm font-semibold text-[--text-primary]">{current.title}</span>
          </div>
          <p className="text-sm text-[--text-secondary] leading-relaxed bg-[--bg-elevated] rounded-xl p-3 border border-[--border-default]">
            {current.desc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Visual bucket array */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`rehash-${step}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-bold text-[--text-muted] uppercase tracking-wider">
              capacity = {current.capacity}
            </span>
            <span className="text-xs font-bold text-[--text-muted]">
              threshold = {current.threshold}
            </span>
            <div className="flex-1 bg-[--bg-elevated] rounded-full h-2 overflow-hidden border border-[--border-default]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  current.entries >= current.threshold ? 'bg-red-500' : current.entries / current.threshold > 0.6 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (current.entries / current.threshold) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-[--text-muted]">{current.entries}/{current.capacity}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {buckets.map(b => (
              <motion.div
                key={b.index}
                initial={current.phase === 'resize' && b.index >= 4 ? { opacity: 0, scale: 0.5 } : {}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: b.index * 0.05 }}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition-all ${
                  b.filled
                    ? current.phase === 'resize'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                    : current.phase === 'resize' && b.index >= 4
                    ? 'bg-green-500/10 border-green-500/30 text-green-400 animate-pulse'
                    : 'bg-[--bg-elevated] border-[--border-default] text-[--text-muted]'
                }`}
              >
                <span className="font-mono font-bold">[{b.index}]</span>
                <span className="text-[10px]">{b.filled ? '● entry' : '◌ empty'}</span>
              </motion.div>
            ))}
          </div>

          {current.phase === 'resize' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-mono">
              ⚠️  Rehash: All {current.entries - 1} entries recalculated with newCapacity={current.capacity}.
              New index = (capacity - 1) &amp; hash — O(n) cost!
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-auto">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[--border-default] text-xs text-[--text-muted] hover:text-[--text-primary] disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={13} /> Previous
        </button>
        <button
          onClick={() => setStep(s => Math.min(REHASH_STEPS.length - 1, s + 1))}
          disabled={step === REHASH_STEPS.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/25 disabled:opacity-30 transition-all"
        >
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────

export default function HashMapVisualizer({ data, speed, stepMode }: HashMapVisualizerProps) {
  const [activeScene, setActiveScene] = useState(0);

  return (
    <div className="flex flex-col h-full bg-[--bg-primary] overflow-hidden">
      {/* Scene Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-[--border-default] bg-[--bg-surface]/50 flex-shrink-0">
        {SCENES.map((scene, i) => (
          <button
            key={scene.id}
            onClick={() => setActiveScene(i)}
            className={`flex flex-col pb-2.5 px-3 border-b-2 text-left transition-all ${
              i === activeScene
                ? 'border-indigo-500 text-[--text-primary]'
                : 'border-transparent text-[--text-muted] hover:text-[--text-secondary]'
            }`}
          >
            <span className="text-xs font-bold">{scene.title}</span>
            <span className="text-[10px] text-[--text-muted]">{scene.subtitle}</span>
          </button>
        ))}
      </div>

      {/* Scene Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScene}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeScene === 0 && <InteractiveScene />}
            {activeScene === 1 && <CollisionScene />}
            {activeScene === 2 && <RehashScene />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

