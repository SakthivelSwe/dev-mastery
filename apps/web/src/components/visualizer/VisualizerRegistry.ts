import dynamic from 'next/dynamic';

const BSTVisualizer = dynamic(() => import('./algorithms/BSTVisualizer'), { ssr: false });
const LinkedListVisualizer = dynamic(() => import('./algorithms/LinkedListVisualizer'), { ssr: false });
const StackVisualizer = dynamic(() => import('./algorithms/StackVisualizer'), { ssr: false });
const HeapVisualizer = dynamic(() => import('./algorithms/HeapVisualizer'), { ssr: false });
const TrieVisualizer = dynamic(() => import('./algorithms/TrieVisualizer'), { ssr: false });
const DPVisualizer = dynamic(() => import('./algorithms/DPVisualizer'), { ssr: false });
const GraphVisualizer = dynamic(() => import('./algorithms/GraphVisualizer'), { ssr: false });
const WrapperClassVisualizer = dynamic(() => import('./algorithms/WrapperClassVisualizer'), { ssr: false });

export const visualizerRegistry: Record<string, { component: React.ComponentType<any>; inputType: 'array' | 'string' | 'number' | 'graph'; defaultData: any }> = {
  'binary-search-tree': {
    component: BSTVisualizer,
    inputType: 'array',
    defaultData: [50, 30, 70, 20, 40, 60, 80],
  },
  'linked-list': {
    component: LinkedListVisualizer,
    inputType: 'array',
    defaultData: [1, 2, 3, 4, 5],
  },
  'stack': {
    component: StackVisualizer,
    inputType: 'array',
    defaultData: [10, 20, 30],
  },
  'heap': {
    component: HeapVisualizer,
    inputType: 'array',
    defaultData: [100, 50, 80, 20, 10, 30, 40],
  },
  'trie': {
    component: TrieVisualizer,
    inputType: 'array', // Will accept comma separated strings
    defaultData: ['apple', 'app', 'banana', 'bat'],
  },
  'dynamic-programming': {
    component: DPVisualizer,
    inputType: 'array',
    defaultData: [
      [1, 1, 1, 1],
      [1, 2, 3, 4],
      [1, 3, 6, 10]
    ],
  },
  'graph-algorithms': {
    component: GraphVisualizer,
    inputType: 'graph',
    defaultData: {
      nodes: [{ id: 'A' }, { id: 'B' }, { id: 'C' }],
      edges: [{ source: 'A', target: 'B' }, { source: 'B', target: 'C' }]
    },
  },
  'wrapper-classes': {
    component: WrapperClassVisualizer,
    inputType: 'number',
    defaultData: 42,
  },
  'data-types-and-variables': {
    component: WrapperClassVisualizer,
    inputType: 'number',
    defaultData: 42,
  },
};
