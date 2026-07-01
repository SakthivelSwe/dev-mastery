import dynamic from 'next/dynamic';

const BSTVisualizer = dynamic(() => import('./algorithms/BSTVisualizer'), { ssr: false });
const LinkedListVisualizer = dynamic(() => import('./algorithms/LinkedListVisualizer'), { ssr: false });
const StackVisualizer = dynamic(() => import('./algorithms/StackVisualizer'), { ssr: false });
const HeapVisualizer = dynamic(() => import('./algorithms/HeapVisualizer'), { ssr: false });
const TrieVisualizer = dynamic(() => import('./algorithms/TrieVisualizer'), { ssr: false });
const DPVisualizer = dynamic(() => import('./algorithms/DPVisualizer'), { ssr: false });
const GraphVisualizer = dynamic(() => import('./algorithms/GraphVisualizer'), { ssr: false });
const WrapperClassVisualizer = dynamic(() => import('./algorithms/WrapperClassVisualizer'), { ssr: false });
const HashMapVisualizer = dynamic(() => import('./algorithms/HashMapVisualizer'), { ssr: false });

const DEFAULT_GRAPH = {
  nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
  edges: [
    { source: 'A', target: 'B' }, { source: 'A', target: 'C' },
    { source: 'B', target: 'D' }, { source: 'C', target: 'D' }, { source: 'D', target: 'E' }
  ]
};

export const visualizerRegistry: Record<string, { component: React.ComponentType<any>; inputType: 'array' | 'string' | 'number' | 'graph'; defaultData: any }> = {

  // ─── Binary Search Tree ──────────────────────────────────────────────────────
  'binary-search-tree': { component: BSTVisualizer, inputType: 'array', defaultData: [50, 30, 70, 20, 40, 60, 80] },
  'avl-tree':           { component: BSTVisualizer, inputType: 'array', defaultData: [40, 20, 60, 10, 30, 50, 70] },
  'red-black-tree':     { component: BSTVisualizer, inputType: 'array', defaultData: [50, 30, 70, 20, 40, 60, 80] },
  'binary-tree':        { component: BSTVisualizer, inputType: 'array', defaultData: [1, 2, 3, 4, 5, 6, 7] },
  'segment-tree':       { component: BSTVisualizer, inputType: 'array', defaultData: [1, 3, 5, 7, 9, 11] },
  // Java Mastery
  'treemap-and-treeset':{ component: BSTVisualizer, inputType: 'array', defaultData: [50, 25, 75, 10, 35, 60, 90] },

  // ─── Linked List ─────────────────────────────────────────────────────────────
  'linked-list-singly':   { component: LinkedListVisualizer, inputType: 'array', defaultData: [10, 20, 30, 40, 50] },
  'linked-list-doubly':   { component: LinkedListVisualizer, inputType: 'array', defaultData: [10, 20, 30, 40, 50] },
  'linked-list-circular': { component: LinkedListVisualizer, inputType: 'array', defaultData: [1, 2, 3, 4, 5] },
  // Java Mastery
  'arraylist-vs-linkedlist': { component: LinkedListVisualizer, inputType: 'array', defaultData: [5, 10, 15, 20, 25] },

  // ─── Stack / Queue / Deque ───────────────────────────────────────────────────
  'stack':          { component: StackVisualizer, inputType: 'array', defaultData: [10, 20, 30] },
  'queue':          { component: StackVisualizer, inputType: 'array', defaultData: [10, 20, 30, 40] },
  'deque':          { component: StackVisualizer, inputType: 'array', defaultData: [5, 10, 15, 20] },
  'priority-queue': { component: HeapVisualizer,  inputType: 'array', defaultData: [100, 50, 80, 20, 10, 30] },

  // ─── Heap ─────────────────────────────────────────────────────────────────────
  'heap-maxheap':   { component: HeapVisualizer, inputType: 'array', defaultData: [100, 90, 80, 70, 60, 50, 40] },
  'heap-minheap':   { component: HeapVisualizer, inputType: 'array', defaultData: [10, 20, 30, 40, 50, 60, 70] },
  // Java Mastery
  'priorityqueue':  { component: HeapVisualizer, inputType: 'array', defaultData: [100, 80, 60, 40, 20] },

  // ─── Trie ─────────────────────────────────────────────────────────────────────
  'trie': { component: TrieVisualizer, inputType: 'array', defaultData: ['apple', 'app', 'banana', 'bat'] },

  // ─── Graph ────────────────────────────────────────────────────────────────────
  'graph-representation':          { component: GraphVisualizer, inputType: 'graph', defaultData: DEFAULT_GRAPH },
  'bfs':                           { component: GraphVisualizer, inputType: 'graph', defaultData: DEFAULT_GRAPH },
  'dfs':                           { component: GraphVisualizer, inputType: 'graph', defaultData: DEFAULT_GRAPH },
  'topological-sort':              { component: GraphVisualizer, inputType: 'graph', defaultData: {
    nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }],
    edges: [{ source: 'A', target: 'C' }, { source: 'B', target: 'C' }, { source: 'B', target: 'D' }, { source: 'C', target: 'E' }, { source: 'D', target: 'E' }]
  }},
  'shortest-path-dijkstra':        { component: GraphVisualizer, inputType: 'graph', defaultData: DEFAULT_GRAPH },
  'shortest-path-bellman-ford':    { component: GraphVisualizer, inputType: 'graph', defaultData: DEFAULT_GRAPH },
  'shortest-path-floyd-warshall':  { component: GraphVisualizer, inputType: 'graph', defaultData: DEFAULT_GRAPH },
  'minimum-spanning-tree-kruskal': { component: GraphVisualizer, inputType: 'graph', defaultData: DEFAULT_GRAPH },
  'minimum-spanning-tree-prim':    { component: GraphVisualizer, inputType: 'graph', defaultData: DEFAULT_GRAPH },
  'union-find':                    { component: GraphVisualizer, inputType: 'graph', defaultData: DEFAULT_GRAPH },

  // ─── Dynamic Programming ──────────────────────────────────────────────────────
  'dynamic-programming-intro': { component: DPVisualizer, inputType: 'array', defaultData: [0, 1, 1, 2, 3, 5, 8, 13, 21] },
  'dp-1d-problems': { component: DPVisualizer, inputType: 'array', defaultData: [0, 1, 1, 2, 3, 5, 8, 13] },
  'dp-2d-problems': { component: DPVisualizer, inputType: 'array', defaultData: [[1,1,1],[1,2,3],[1,3,6]] },
  'dp-strings':     { component: DPVisualizer, inputType: 'array', defaultData: [[0,1,1,1],[1,1,2,2],[1,2,2,3]] },
  'dp-trees':       { component: DPVisualizer, inputType: 'array', defaultData: [1, 2, 3, 4, 5, 6, 7] },

  // ─── Sorting / Searching ──────────────────────────────────────────────────────
  'sorting-intro':   { component: StackVisualizer, inputType: 'array', defaultData: [64, 34, 25, 12, 22, 11, 90] },
  'searching-intro': { component: BSTVisualizer,   inputType: 'array', defaultData: [10, 20, 30, 40, 50, 60, 70] },
  'binary-search-advanced': { component: BSTVisualizer, inputType: 'array', defaultData: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91] },
  'divide-and-conquer':     { component: StackVisualizer, inputType: 'array', defaultData: [38, 27, 43, 3, 9, 82, 10] },

  // ─── Arrays / String / Prefix Sum ────────────────────────────────────────────
  'array-basics':        { component: StackVisualizer, inputType: 'array', defaultData: [3, 1, 4, 1, 5, 9, 2, 6] },
  'array-operations':    { component: StackVisualizer, inputType: 'array', defaultData: [1, 2, 3, 4, 5, 6, 7, 8] },
  'prefix-sum':          { component: StackVisualizer, inputType: 'array', defaultData: [1, 2, 3, 4, 5, 6] },
  'sliding-window':      { component: StackVisualizer, inputType: 'array', defaultData: [2, 1, 5, 1, 3, 2] },
  'two-pointers-patterns':{ component: StackVisualizer, inputType: 'array', defaultData: [1, 2, 3, 4, 5, 6, 7, 8] },
  'monotonic-stack-patterns': { component: StackVisualizer, inputType: 'array', defaultData: [2, 1, 5, 3, 6, 4, 8, 9, 7] },
  'interval-problems':   { component: StackVisualizer, inputType: 'array', defaultData: [1, 3, 2, 6, 8, 10, 15, 18] },

  // ─── HashMap ──────────────────────────────────────────────────────────────────
  'hashmap-internals':   { component: HashMapVisualizer, inputType: 'string', defaultData: 'name=Alice' },
  'hashing-advanced':    { component: HashMapVisualizer, inputType: 'string', defaultData: 'key=value' },
  'collections-overview':{ component: HashMapVisualizer, inputType: 'string', defaultData: 'name=Alice' },
  'linkedhashmap':       { component: HashMapVisualizer, inputType: 'string', defaultData: 'key=value' },

  // ─── Java Mastery ────────────────────────────────────────────────────────────
  'wrapper-classes':          { component: WrapperClassVisualizer, inputType: 'number', defaultData: 42 },
  'data-types-and-variables': { component: WrapperClassVisualizer, inputType: 'number', defaultData: 42 },
};
