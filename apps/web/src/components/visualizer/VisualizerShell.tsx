'use client';

import React, { useMemo, useState } from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { visualizerRegistry } from './VisualizerRegistry';
import CustomInputPanel from './CustomInputPanel';
import StepwiseVisualizer, { parseStepwiseConfig } from './StepwiseVisualizer';

/**
 * VisualizerShell is the entry point rendered by the topic page's "Visualizer" tab.
 *
 * Rendering priority:
 *   1. If the topic's MDX `## VISUALIZATION_CONFIG` block contains a
 *      `{"steps":[...]}` schema  the data-driven {@link StepwiseVisualizer}.
 *      Works for ANY topic  no registry entry required.
 *   2. Otherwise, if `topicSlug` is registered in {@link visualizerRegistry}
 *      the legacy specialised visualiser (BST / Heap / Graph / ) with a
 *      working play/pause/step/reset controller wired to a re-mount key.
 *   3. Otherwise, an informative placeholder.
 */
export default function VisualizerShell({
  topicSlug = 'binary-search-tree',
  visualLayer,
}: {
  topicSlug?: string;
  visualLayer?: string;
}) {
  // 1) Stepwise config from MDX  what most topics use going forward.
  const stepwise = useMemo(() => parseStepwiseConfig(visualLayer), [visualLayer]);
  if (stepwise) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full">
        <StepwiseVisualizer config={stepwise} />
      </div>
    );
  }

  // 2) Legacy specialised visualiser
  const visualizerConfig = visualizerRegistry[topicSlug];
  if (!visualizerConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-[--bg-elevated] border border-[--border-default] flex items-center justify-center mb-4">
          <Play size={22} className="text-[--text-muted]" />
        </div>
        <h3 className="text-lg font-semibold text-[--text-primary] mb-1">No visualiser for this topic yet</h3>
        <p className="text-sm text-[--text-secondary] max-w-md">
          This topic doesn&apos;t define a visual step schema in its MDX
          <code className="mx-1 px-1 rounded bg-[--bg-elevated] text-xs">VISUALIZATION_CONFIG</code>
          block. Add a <code className="mx-1 px-1 rounded bg-[--bg-elevated] text-xs">{'{"steps":[…]}'}</code>
          config there and the interactive walkthrough will appear here automatically.
        </p>
      </div>
    );
  }
  return <LegacyVisualizerShell topicSlug={topicSlug} config={visualizerConfig} />;
}

// ─── Legacy shell (BST / Heap / Trie / … D3 animations) ───────────────────

function LegacyVisualizerShell({
  topicSlug,
  config,
}: {
  topicSlug: string;
  config: {
    component: React.ComponentType<any>;
    inputType: 'array' | 'string' | 'number' | 'graph';
    defaultData: any;
  };
}) {
  const VisualizerComponent = config.component;

  const [data, setData]           = useState<any>(config.defaultData);
  const [speed, setSpeed]         = useState(1);
  const [playToken, setPlayToken] = useState(0);
  const [playing, setPlaying]     = useState(true);

  const defaultInputStr = typeof config.defaultData === 'string'
    ? config.defaultData
    : Array.isArray(config.defaultData)
      ? config.defaultData.join(',')
      : JSON.stringify(config.defaultData);
  const [inputVal, setInputVal] = useState(defaultInputStr);

  const handleUpdate = () => {
    try {
      if (config.inputType === 'array') {
        const parsed = inputVal.split(',').map((s) => {
          const num = parseInt(s.trim());
          return isNaN(num) ? s.trim() : num;
        });
        setData(parsed);
      } else if (config.inputType === 'graph') {
        setData(JSON.parse(inputVal));
      } else {
        setData(inputVal);
      }
      setPlayToken((n) => n + 1);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Invalid input format', e);
    }
  };

  const restart  = () => setPlayToken((n) => n + 1);
  const pause    = () => setPlaying(false);
  const play     = () => { setPlaying(true); setPlayToken((n) => n + 1); };
  const stepOnce = () => setPlayToken((n) => n + 1);

  const sampleCode =
    SAMPLE_CODE_BY_SLUG[topicSlug] ??
    `// Interactive visualiser for "${topicSlug}".\n// Adjust the input above then press Play to replay the animation.`;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Left panel */}
      <div className="w-[60%] flex flex-col border-r border-[--border-default] p-4 gap-4">
        <div className="flex justify-between items-center bg-[--bg-elevated] p-3 rounded-lg border border-[--border-default]">
          <CustomInputPanel
            inputType={config.inputType}
            value={inputVal}
            onChange={setInputVal}
            onApply={handleUpdate}
          />

          <div className="flex gap-1 items-center">
            <ShellIcon title="Play"  onClick={play}><Play size={16} /></ShellIcon>
            <ShellIcon title="Pause" onClick={pause} disabled={!playing}><Pause size={16} /></ShellIcon>
            <ShellIcon title="Step"  onClick={stepOnce}><StepForward size={16} /></ShellIcon>
            <ShellIcon title="Reset" onClick={restart}><RotateCcw size={16} /></ShellIcon>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-[--text-muted]">Speed:</span>
              <input
                type="range" min="0.25" max="4" step="0.25"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-24 accent-indigo-500"
              />
              <span className="text-xs">{speed}x</span>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-lg overflow-hidden relative bg-[--bg-primary] border border-[--border-default]">
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <span className="bg-[--bg-elevated]/80 backdrop-blur text-xs px-2 py-1 border border-[--border-default] rounded text-emerald-400">
              Time: O(log n)
            </span>
            <span className="bg-[--bg-elevated]/80 backdrop-blur text-xs px-2 py-1 border border-[--border-default] rounded text-blue-400">
              Space: O(n)
            </span>
          </div>
          {/* Re-mount to force the D3 animation to restart on play / reset */}
          <VisualizerComponent key={playToken} data={data} speed={speed} stepMode={false} />
        </div>

        <div className="bg-[--bg-elevated] border border-[--border-default] rounded-lg p-3 text-sm text-[--text-secondary] min-h-[72px]">
          <strong className="text-[--text-primary]">Hint:</strong> change the input above and press
          <em className="mx-1">Apply</em>to feed new data in, or press
          <em className="mx-1">Play</em>/<em className="mx-1">Reset</em>to replay the animation.
        </div>
      </div>

      {/* Right panel — code sample */}
      <div className="w-[40%] flex flex-col bg-[#1e1e1e]">
        <div className="border-b border-[#333] p-2 flex text-xs text-gray-400 gap-4">
          <span className="px-2 py-1 border-b-2 border-amber-400 text-white">
            {topicSlug.split('-').map((w) => (w[0] ?? '').toUpperCase() + w.slice(1)).join('')}.java
          </span>
        </div>
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
            value={sampleCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              lineHeight: 20,
              padding: { top: 12 },
              wordWrap: 'on',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ShellIcon({
  children, onClick, title, disabled,
}: { children: React.ReactNode; onClick: () => void; title: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'hover:bg-[--bg-surface] text-[--text-secondary] hover:text-[--text-primary]'
      }`}
    >
      {children}
    </button>
  );
}

const SAMPLE_CODE_BY_SLUG: Record<string, string> = {
  'binary-search-tree': `class BST {
    Node root;
    void insert(int v) { root = insertRec(root, v); }
    private Node insertRec(Node n, int v) {
        if (n == null) return new Node(v);
        if (v < n.val)      n.left  = insertRec(n.left,  v);
        else if (v > n.val) n.right = insertRec(n.right, v);
        return n;
    }
    static class Node { int val; Node left, right; Node(int v){val=v;} }
}`,
  'linked-list-singly': `class LinkedList {
    Node head;
    void add(int v) {
        Node n = new Node(v);
        if (head == null) { head = n; return; }
        Node cur = head;
        while (cur.next != null) cur = cur.next;
        cur.next = n;
    }
    static class Node { int val; Node next; Node(int v){val=v;} }
}`,
  stack: `Deque<Integer> stack = new ArrayDeque<>();
stack.push(10);
stack.push(20);
stack.push(30);
int top = stack.pop();  // 30`,
  'heap-maxheap': `PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
heap.offer(50); heap.offer(80); heap.offer(30);
int max = heap.poll();  // 80`,
  trie: `class Trie {
    static class Node { Map<Character,Node> next = new HashMap<>(); boolean end; }
    Node root = new Node();
    void insert(String s) {
        Node c = root;
        for (char ch : s.toCharArray()) c = c.next.computeIfAbsent(ch, k -> new Node());
        c.end = true;
    }
}`,
  'hashmap-internals': `Map<String, String> m = new HashMap<>();
m.put("name", "Alice");
// 1) hash("name") -> int
// 2) index = hash & (capacity - 1)
// 3) bucket[index] = new Node(hash, "name", "Alice", null)`,
};

