'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw, Play, Zap } from 'lucide-react';

interface WrapperClassVisualizerProps {
  data?: any;
  speed?: number;
  stepMode?: boolean;
}

// ─── Scene Definitions ─────────────────────────────────────────────────────

const SCENES = [
  { id: 'memory', title: 'Memory Model', subtitle: 'Stack vs Heap' },
  { id: 'cache',  title: 'Integer Cache', subtitle: 'The == Trap' },
  { id: 'methods',title: 'Utility Methods', subtitle: 'Interactive Demo' },
];

// ─── Autoboxing Memory Model Scene ─────────────────────────────────────────

const MEMORY_STEPS = [
  {
    label: 'Declare a primitive int',
    code: 'int x = 42;',
    stack: [{ name: 'x', value: '42', type: 'int', highlight: true }],
    heap: [],
    arrow: false,
    explain: 'A primitive int is stored directly on the Thread Stack. It takes exactly 4 bytes. There is NO object header overhead — just the raw value 42.',
  },
  {
    label: 'Autobox to Integer',
    code: 'Integer obj = x; // Integer.valueOf(42)',
    stack: [
      { name: 'x',   value: '42',        type: 'int',     highlight: false },
      { name: 'obj', value: '@0x1a4f',   type: 'Integer', highlight: true  },
    ],
    heap: [{ id: 'obj', label: 'Integer', value: '42', header: '16B header', highlight: true }],
    arrow: true,
    explain: 'Autoboxing calls Integer.valueOf(42). The JVM creates an Integer object on the Heap with a 16-byte object header + 4-byte int field = 20 bytes total. The "obj" variable on the Stack does NOT store 42 — it stores a memory address (@0x1a4f) pointing to the Heap object.',
  },
  {
    label: 'Unbox back to primitive',
    code: 'int n = obj; // obj.intValue()',
    stack: [
      { name: 'x',   value: '42',      type: 'int',     highlight: false },
      { name: 'obj', value: '@0x1a4f', type: 'Integer', highlight: false },
      { name: 'n',   value: '42',      type: 'int',     highlight: true  },
    ],
    heap: [{ id: 'obj', label: 'Integer', value: '42', header: '16B header', highlight: false }],
    arrow: true,
    explain: 'Unboxing calls obj.intValue() behind the scenes. The integer value (42) is extracted from the Heap object and stored directly as a new primitive on the Stack. The Integer object on the Heap is now eligible for Garbage Collection if nothing else references it.',
  },
  {
    label: 'Null danger!',
    code: 'Integer nullable = null;\nint boom = nullable + 1; // NPE!',
    stack: [
      { name: 'nullable', value: 'null', type: 'Integer', highlight: true, danger: true },
    ],
    heap: [],
    arrow: false,
    explain: '⚠️ DANGER: nullable holds null (no Heap object pointed to). When the compiler tries to unbox it by calling nullable.intValue(), it calls a method on null → NullPointerException! Always null-check before unboxing: if (nullable != null) { int val = nullable; }',
  },
];

function MemoryModelScene() {
  const [step, setStep] = useState(0);
  const current = MEMORY_STEPS[step];

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {MEMORY_STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-8 h-8 rounded-full text-xs font-bold border transition-all ${
                i === step
                  ? 'bg-indigo-500 border-indigo-400 text-white scale-110'
                  : i < step
                  ? 'bg-green-500/30 border-green-500/50 text-green-400'
                  : 'bg-[--bg-elevated] border-[--border-default] text-[--text-muted]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="p-1.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-muted] disabled:opacity-30 hover:text-[--text-primary] transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setStep(Math.min(MEMORY_STEPS.length - 1, step + 1))}
            disabled={step === MEMORY_STEPS.length - 1}
            className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 disabled:opacity-30 hover:bg-indigo-500/30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setStep(0)}
            className="p-1.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-muted] hover:text-[--text-primary] transition-all"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Code line */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0d1117] border border-[--border-default] rounded-lg px-4 py-3 font-mono text-sm"
      >
        <span className="text-[--text-muted] text-xs mr-3">Step {step + 1}:</span>
        {current.code.split('\n').map((line, i) => (
          <div key={i} className="text-green-300">{line}</div>
        ))}
      </motion.div>

      {/* Memory Layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Thread Stack */}
        <div className="flex-1 flex flex-col">
          <div className="text-xs font-bold text-indigo-400 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            THREAD STACK  <span className="text-[--text-muted] font-normal">(fast · per-thread · auto-managed)</span>
          </div>
          <div className="flex-1 bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 flex flex-col-reverse gap-2">
            <AnimatePresence mode="popLayout">
              {current.stack.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`relative flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-mono transition-all ${
                    (item as any).danger
                      ? 'bg-red-900/40 border-red-500/60 text-red-300'
                      : item.highlight
                      ? 'bg-indigo-500/20 border-indigo-400/60 text-indigo-200'
                      : 'bg-[#0d1117]/60 border-[--border-muted] text-[--text-secondary]'
                  }`}
                >
                  <span className="text-xs text-[--text-muted]">{item.type}</span>
                  <span className="font-bold">{item.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    (item as any).danger ? 'bg-red-500/20 text-red-300' :
                    item.highlight ? 'bg-indigo-500/30 text-indigo-300' : 'bg-[--bg-elevated] text-[--text-muted]'
                  }`}>
                    {item.value}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {current.stack.length === 0 && (
              <div className="text-center text-[--text-muted] text-xs py-4">empty</div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center w-12">
          <AnimatePresence>
            {current.arrow && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="text-xs text-amber-400 font-bold text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  ref →
                </div>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="text-amber-400"
                >
                  →
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* JVM Heap */}
        <div className="flex-1 flex flex-col">
          <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            JVM HEAP  <span className="text-[--text-muted] font-normal">(shared · GC-managed · larger)</span>
          </div>
          <div className="flex-1 bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {current.heap.map((obj) => (
                <motion.div
                  key={obj.id}
                  initial={{ opacity: 0, scale: 0.7, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7, y: -20 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className={`rounded-xl border overflow-hidden ${
                    obj.highlight
                      ? 'border-amber-400/60 bg-amber-900/30'
                      : 'border-[--border-default] bg-[#0d1117]/60'
                  }`}
                >
                  {/* Object header */}
                  <div className="bg-amber-500/10 px-3 py-1.5 border-b border-amber-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 font-mono">{obj.label}</span>
                    <span className="text-xs text-[--text-muted]">{obj.header}</span>
                  </div>
                  {/* Value field */}
                  <div className="px-3 py-2 flex items-center justify-between font-mono text-sm">
                    <span className="text-[--text-muted] text-xs">value (int)</span>
                    <span className="text-green-300 font-bold">{obj.value}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {current.heap.length === 0 && (
              <div className="text-center text-[--text-muted] text-xs py-4">empty (no objects)</div>
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <motion.div
        key={`explain-${step}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm leading-relaxed p-4 rounded-xl border ${
          (current as any).danger
            ? 'bg-red-900/20 border-red-500/30 text-red-200'
            : 'bg-[--bg-elevated] border-[--border-default] text-[--text-secondary]'
        }`}
      >
        <span className="text-[--text-primary] font-semibold mr-2">📌 {current.label}:</span>
        {current.explain}
      </motion.div>
    </div>
  );
}

// ─── Integer Cache Scene ────────────────────────────────────────────────────

const CACHE_STEPS = [
  {
    a: 100, b: 100,
    aLabel: 'Integer a = 100;',
    bLabel: 'Integer b = 100;',
    explain: 'Both a and b hold the value 100, which is inside the cache range (-128 to 127). Both calls to Integer.valueOf(100) return the SAME cached object.',
    result: { op: 'a == b', value: 'true ✅', correct: true, reason: 'Same object in cache → same memory address' },
    equals: { op: 'a.equals(b)', value: 'true ✅', reason: 'Same value' },
  },
  {
    a: 200, b: 200,
    aLabel: 'Integer x = 200;',
    bLabel: 'Integer y = 200;',
    explain: '200 is OUTSIDE the cache range. Each Integer.valueOf(200) call creates a brand new object on the Heap. x and y point to different memory addresses.',
    result: { op: 'x == y', value: 'false ❌', correct: false, reason: 'Different objects → different memory addresses' },
    equals: { op: 'x.equals(y)', value: 'true ✅', reason: 'Same value, different objects' },
  },
  {
    a: -128, b: -128,
    aLabel: 'Integer p = -128;',
    bLabel: 'Integer q = -128;',
    explain: '-128 is the LOWER bound of the cache (index 0). Still cached → same object.',
    result: { op: 'p == q', value: 'true ✅', correct: true, reason: '-128 is the first entry in the cache' },
    equals: { op: 'p.equals(q)', value: 'true ✅', reason: 'Same value' },
  },
  {
    a: 127, b: 127,
    aLabel: 'Integer p = 127;',
    bLabel: 'Integer q = 127;',
    explain: '127 is the UPPER bound of the cache (index 255). Still cached → same object.',
    result: { op: 'p == q', value: 'true ✅', correct: true, reason: '127 is the last entry in the cache' },
    equals: { op: 'p.equals(q)', value: 'true ✅', reason: 'Same value' },
  },
  {
    a: 128, b: 128,
    aLabel: 'Integer p = 128;',
    bLabel: 'Integer q = 128;',
    explain: '128 is just ONE above the cache upper bound. No caching! Two new Integer objects are created on the Heap. This is THE classic Java interview trap.',
    result: { op: 'p == q', value: 'false ❌', correct: false, reason: '128 is outside cache → new objects!' },
    equals: { op: 'p.equals(q)', value: 'true ✅', reason: 'Same value — always use .equals()!' },
  },
];

function CacheScene() {
  const [caseIdx, setCaseIdx] = useState(0);
  const c = CACHE_STEPS[caseIdx];

  const inCache = (v: number) => v >= -128 && v <= 127;
  const cacheA = inCache(c.a);

  // Build the -128..127 visual range
  const ranges = [
    { label: '-128', val: -128 },
    { label: '-64',  val: -64  },
    { label: '0',    val: 0    },
    { label: '64',   val: 64   },
    { label: '127',  val: 127  },
  ];

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Case selector */}
      <div className="flex gap-2 flex-wrap">
        {CACHE_STEPS.map((cs, i) => (
          <button
            key={i}
            onClick={() => setCaseIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              i === caseIdx
                ? 'bg-indigo-500/30 border-indigo-400/60 text-indigo-200'
                : 'bg-[--bg-elevated] border-[--border-default] text-[--text-muted] hover:border-indigo-400/40'
            }`}
          >
            {cs.a}
          </button>
        ))}
        <span className="text-xs text-[--text-muted] self-center ml-1">← Test these values</span>
      </div>

      {/* Cache strip visualisation */}
      <div className="bg-[--bg-elevated] border border-[--border-default] rounded-xl p-4">
        <div className="text-xs font-bold text-[--text-primary] mb-3">
          JVM Integer Cache Pool  <span className="text-[--text-muted] font-normal">(256 pre-created objects, indexes 0–255)</span>
        </div>
        <div className="relative">
          {/* The bar */}
          <div className="h-8 bg-gradient-to-r from-indigo-900/60 via-indigo-600/40 to-indigo-900/60 rounded-lg border border-indigo-500/40 relative overflow-hidden">
            {/* Cached range label */}
            <div className="absolute inset-0 flex items-center justify-center text-xs text-indigo-300 font-semibold">
              ← Cached: -128 to 127 →
            </div>
            {/* Highlighted value marker */}
            <AnimatePresence>
              {inCache(c.a) && (
                <motion.div
                  key={c.a}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 bottom-0 flex items-center justify-center"
                  style={{
                    left: `${((c.a + 128) / 255) * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="w-3 h-8 bg-amber-400/70 rounded-sm" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Labels */}
          <div className="flex justify-between mt-1 text-xs text-[--text-muted] font-mono">
            {ranges.map(r => <span key={r.val}>{r.label}</span>)}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className={`px-2 py-1 rounded-md font-mono font-bold ${inCache(c.a) ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}`}>
            {c.a} is {inCache(c.a) ? '✅ IN cache' : '❌ NOT in cache'}
          </span>
        </div>
      </div>

      {/* The two variables */}
      <div className="grid grid-cols-2 gap-4">
        {/* Variable A */}
        <motion.div
          key={`a-${caseIdx}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`rounded-xl border p-4 ${cacheA ? 'bg-indigo-900/20 border-indigo-500/40' : 'bg-amber-900/20 border-amber-500/40'}`}
        >
          <div className="font-mono text-sm text-green-300 mb-2">{c.aLabel}</div>
          <div className="flex flex-col gap-1 text-xs font-mono">
            <div className="text-[--text-muted]">Stack slot:</div>
            <div className={`px-2 py-1 rounded border text-center font-bold ${cacheA ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200' : 'bg-amber-500/20 border-amber-400/50 text-amber-200'}`}>
              {cacheA ? '→ @pool[' + (c.a + 128) + ']' : '→ @heap_0x' + (Math.abs(c.a) * 31 % 0xFFFF).toString(16).padStart(4, '0')}
            </div>
            <div className="text-[--text-muted] mt-1">Heap object:</div>
            <div className={`px-2 py-1 rounded border text-center ${cacheA ? 'bg-indigo-500/10 border-indigo-400/30 text-indigo-300' : 'bg-amber-500/10 border-amber-400/30 text-amber-300'}`}>
              {cacheA ? `SHARED pool obj (${c.a})` : `NEW Integer(${c.a})`}
            </div>
          </div>
        </motion.div>

        {/* Variable B */}
        <motion.div
          key={`b-${caseIdx}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`rounded-xl border p-4 ${cacheA ? 'bg-indigo-900/20 border-indigo-500/40' : 'bg-red-900/20 border-red-500/40'}`}
        >
          <div className="font-mono text-sm text-green-300 mb-2">{c.bLabel}</div>
          <div className="flex flex-col gap-1 text-xs font-mono">
            <div className="text-[--text-muted]">Stack slot:</div>
            <div className={`px-2 py-1 rounded border text-center font-bold ${cacheA ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200' : 'bg-red-500/20 border-red-400/50 text-red-200'}`}>
              {cacheA ? '→ @pool[' + (c.a + 128) + '] ← SAME!' : '→ @heap_0x' + ((Math.abs(c.a) * 31 + 7) % 0xFFFF).toString(16).padStart(4, '0') + ' ← DIFFERENT!'}
            </div>
            <div className="text-[--text-muted] mt-1">Heap object:</div>
            <div className={`px-2 py-1 rounded border text-center ${cacheA ? 'bg-indigo-500/10 border-indigo-400/30 text-indigo-300' : 'bg-red-500/10 border-red-400/30 text-red-300'}`}>
              {cacheA ? `SHARED pool obj (${c.b})` : `NEW Integer(${c.b}) ← diff!`}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Result row */}
      <motion.div
        key={`result-${caseIdx}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className={`p-3 rounded-xl border text-center ${c.result.correct ? 'bg-green-900/20 border-green-500/40' : 'bg-red-900/20 border-red-500/40'}`}>
          <div className="font-mono text-sm font-bold text-[--text-primary]">{c.result.op}</div>
          <div className={`text-xl font-bold mt-1 ${c.result.correct ? 'text-green-400' : 'text-red-400'}`}>{c.result.value}</div>
          <div className="text-xs text-[--text-muted] mt-1">{c.result.reason}</div>
        </div>
        <div className="p-3 rounded-xl border bg-green-900/20 border-green-500/40 text-center">
          <div className="font-mono text-sm font-bold text-[--text-primary]">{c.equals.op}</div>
          <div className="text-xl font-bold mt-1 text-green-400">{c.equals.value}</div>
          <div className="text-xs text-[--text-muted] mt-1">{c.equals.reason}</div>
        </div>
      </motion.div>

      <div className={`text-xs p-3 rounded-xl border leading-relaxed ${cacheA ? 'bg-[--bg-elevated] border-[--border-default] text-[--text-secondary]' : 'bg-red-900/20 border-red-500/30 text-red-200'}`}>
        <span className="font-semibold text-[--text-primary]">💡 </span>{c.explain}
      </div>
    </div>
  );
}

// ─── Methods Demo Scene ─────────────────────────────────────────────────────

const METHOD_GROUPS = [
  {
    group: 'Parsing & Conversion',
    color: 'indigo',
    items: [
      { method: 'Integer.parseInt("255")',       result: () => String(parseInt('255')),           desc: 'String → primitive int' },
      { method: 'Integer.valueOf("255")',         result: () => String(parseInt('255')) + ' (Integer)', desc: 'String → Integer object' },
      { method: 'Integer.toString(255)',          result: () => String(255),                      desc: 'int → String' },
      { method: 'Integer.toBinaryString(255)',    result: () => (255).toString(2),                desc: 'int → binary String' },
      { method: 'Integer.toHexString(255)',       result: () => (255).toString(16),               desc: 'int → hex String' },
      { method: 'Double.parseDouble("3.14")',     result: () => String(3.14),                     desc: 'String → double' },
      { method: 'Boolean.parseBoolean("true")',   result: () => 'true',                           desc: 'String → boolean' },
    ],
  },
  {
    group: 'Math & Comparison',
    color: 'amber',
    items: [
      { method: 'Integer.max(10, 25)',    result: () => '25',           desc: 'Maximum of two values' },
      { method: 'Integer.min(10, 25)',    result: () => '10',           desc: 'Minimum of two values' },
      { method: 'Integer.sum(10, 25)',    result: () => '35',           desc: 'Sum (use as method reference)' },
      { method: 'Integer.compare(10,25)', result: () => '-1',           desc: 'Returns -1, 0, or 1' },
      { method: 'Integer.MAX_VALUE',      result: () => '2147483647',   desc: 'Largest int constant' },
      { method: 'Integer.MIN_VALUE',      result: () => '-2147483648',  desc: 'Smallest int constant' },
    ],
  },
  {
    group: 'Bit Operations',
    color: 'green',
    items: [
      { method: 'Integer.bitCount(60)',           result: () => '4',     desc: 'Count set bits in 60 = 00111100' },
      { method: 'Integer.highestOneBit(60)',       result: () => '32',    desc: 'Highest set bit = 32' },
      { method: 'Integer.lowestOneBit(60)',        result: () => '4',     desc: 'Lowest set bit = 4' },
      { method: 'Integer.numberOfLeadingZeros(60)',result: () => '26',    desc: '26 zeros before first 1' },
      { method: 'Integer.reverse(1)',              result: () => String(-2147483648), desc: 'Reverse all 32 bits' },
    ],
  },
  {
    group: 'Character Utilities',
    color: 'rose',
    items: [
      { method: "Character.isDigit('5')",       result: () => 'true',   desc: 'Is this char a digit?' },
      { method: "Character.isLetter('A')",       result: () => 'true',   desc: 'Is this char a letter?' },
      { method: "Character.isUpperCase('A')",    result: () => 'true',   desc: 'Is this char uppercase?' },
      { method: "Character.toLowerCase('A')",    result: () => 'a',      desc: 'Convert to lowercase' },
      { method: "Character.isWhitespace(' ')",   result: () => 'true',   desc: 'Is this whitespace?' },
      { method: "Character.isAlphabetic('ñ')",   result: () => 'true',   desc: 'Handles Unicode!' },
    ],
  },
];

const colorMap: Record<string, string> = {
  indigo: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20',
  amber:  'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
  green:  'border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20',
  rose:   'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
};

const headerColorMap: Record<string, string> = {
  indigo: 'text-indigo-400 border-indigo-500/30',
  amber:  'text-amber-400 border-amber-500/30',
  green:  'text-green-400 border-green-500/30',
  rose:   'text-rose-400 border-rose-500/30',
};

function MethodsScene() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [clicked, setClicked] = useState<string | null>(null);
  const group = METHOD_GROUPS[activeGroup];

  return (
    <div className="flex flex-col h-full gap-3 p-4">
      {/* Group tabs */}
      <div className="flex gap-2 flex-wrap">
        {METHOD_GROUPS.map((g, i) => (
          <button
            key={i}
            onClick={() => { setActiveGroup(i); setClicked(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              i === activeGroup
                ? headerColorMap[g.color] + ' bg-[--bg-elevated]'
                : 'border-[--border-default] text-[--text-muted] bg-[--bg-elevated] hover:text-[--text-primary]'
            }`}
          >
            {g.group}
          </button>
        ))}
      </div>

      {/* Methods grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGroup}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-2"
            >
              {group.items.map((item, i) => (
                <motion.button
                  key={item.method}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setClicked(clicked === item.method ? null : item.method)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${colorMap[group.color]}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-bold text-[--text-primary]">{item.method}</span>
                    <span className="text-xs text-[--text-muted]">{item.desc}</span>
                  </div>
                  <AnimatePresence>
                    {clicked === item.method ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="ml-4 px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[--border-default] font-mono text-sm font-bold text-green-300 whitespace-nowrap"
                      >
                        → {item.result()}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="ml-4 flex items-center gap-1 text-xs text-[--text-muted]"
                      >
                        <Play size={11} /> run
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="text-xs text-[--text-muted] text-center flex items-center justify-center gap-1">
        <Zap size={11} className="text-amber-400" />
        Click any method to see its output instantly
      </div>
    </div>
  );
}

// ─── Main Visualizer Shell ──────────────────────────────────────────────────

export default function WrapperClassVisualizer(_props: WrapperClassVisualizerProps) {
  const [activeScene, setActiveScene] = useState(0);

  return (
    <div className="flex flex-col h-full bg-[--bg-primary] overflow-hidden rounded-xl border border-[--border-default]">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-[--border-default] bg-[--bg-surface]/80 shrink-0">
        <div className="flex items-center gap-1 mr-3">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex gap-1">
          {SCENES.map((scene, i) => (
            <button
              key={scene.id}
              onClick={() => setActiveScene(i)}
              className={`flex flex-col items-start px-4 py-1.5 rounded-lg transition-all text-left ${
                i === activeScene
                  ? 'bg-indigo-500/20 border border-indigo-500/40'
                  : 'hover:bg-[--bg-elevated] border border-transparent'
              }`}
            >
              <span className={`text-xs font-bold ${i === activeScene ? 'text-indigo-300' : 'text-[--text-muted]'}`}>
                {scene.title}
              </span>
              <span className="text-xs text-[--text-muted]">{scene.subtitle}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-[--text-muted] bg-[--bg-elevated] px-2 py-1 rounded-md border border-[--border-muted]">
          Java Wrapper Classes
        </div>
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
            {activeScene === 0 && <MemoryModelScene />}
            {activeScene === 1 && <CacheScene />}
            {activeScene === 2 && <MethodsScene />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

