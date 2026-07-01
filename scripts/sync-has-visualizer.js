/**
 * sync-has-visualizer.js
 * Sets has_visualizer = true for all topics that have a registered visualizer,
 * and has_visualizer = false for topics that don't.
 * Run: node scripts/sync-has-visualizer.js
 */
const { Client } = require('pg');

const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

// All slugs that have a visualizer in VisualizerRegistry.ts
const VISUALIZER_SLUGS = new Set([
  // BST / Trees
  'binary-search-tree', 'avl-tree', 'red-black-tree', 'binary-tree', 'segment-tree', 'treemap-and-treeset',
  // Linked List
  'linked-list', 'linked-list-singly', 'linked-list-doubly', 'linked-list-circular', 'arraylist-vs-linkedlist',
  // Stack / Queue / Deque
  'stack', 'queue', 'deque', 'priority-queue',
  // Heap
  'heap', 'heap-maxheap', 'heap-minheap', 'priorityqueue',
  // Trie
  'trie',
  // Graph
  'graph-algorithms', 'graph-representation', 'bfs', 'dfs', 'topological-sort',
  'shortest-path-dijkstra', 'shortest-path-bellman-ford', 'shortest-path-floyd-warshall',
  'minimum-spanning-tree-kruskal', 'minimum-spanning-tree-prim', 'union-find',
  // Dynamic Programming
  'dynamic-programming', 'dynamic-programming-intro', 'dp-1d-problems', 'dp-2d-problems', 'dp-strings', 'dp-trees',
  // Sorting / Searching
  'sorting-intro', 'searching-intro', 'binary-search-advanced', 'divide-and-conquer',
  // Arrays / Sliding Window etc
  'array-basics', 'array-operations', 'prefix-sum', 'sliding-window',
  'two-pointers-patterns', 'monotonic-stack-patterns', 'interval-problems',
  // HashMap
  'hashmap-internals', 'hashing-advanced', 'collections-overview', 'linkedhashmap',
  // Java Mastery
  'wrapper-classes', 'data-types-and-variables',
]);

async function run() {
  await c.connect();

  // Get current state
  const allTopics = await c.query('SELECT id, slug, has_visualizer FROM topics ORDER BY slug');
  console.log(`Total topics in DB: ${allTopics.rows.length}`);

  let enabled = 0, disabled = 0, unchanged = 0;

  for (const topic of allTopics.rows) {
    const shouldHave = VISUALIZER_SLUGS.has(topic.slug);
    if (shouldHave && !topic.has_visualizer) {
      await c.query('UPDATE topics SET has_visualizer = true WHERE id = $1', [topic.id]);
      console.log(`  ✅ ENABLED  ${topic.slug}`);
      enabled++;
    } else if (!shouldHave && topic.has_visualizer) {
      await c.query('UPDATE topics SET has_visualizer = false WHERE id = $1', [topic.id]);
      console.log(`  ❌ DISABLED ${topic.slug}`);
      disabled++;
    } else {
      unchanged++;
    }
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Enabled:   ${enabled}`);
  console.log(`Disabled:  ${disabled}`);
  console.log(`Unchanged: ${unchanged}`);

  // Verify
  const withViz = await c.query('SELECT COUNT(*) FROM topics WHERE has_visualizer = true');
  console.log(`\nTopics with visualizer: ${withViz.rows[0].count}`);

  await c.end();
}

run().catch(e => { console.error(e.message); c.end(); });

