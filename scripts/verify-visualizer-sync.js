/**
 * verify-visualizer-sync.js
 * Checks that all registry slugs have has_visualizer=true in DB,
 * and lists any registry slugs that don't exist in DB at all.
 */
const { Client } = require('pg');

const REGISTRY_SLUGS = [
  // BST
  'binary-search-tree','avl-tree','red-black-tree','binary-tree','segment-tree','treemap-and-treeset',
  // Linked List
  'linked-list','linked-list-singly','linked-list-doubly','linked-list-circular','arraylist-vs-linkedlist',
  // Stack/Queue
  'stack','queue','deque','priority-queue',
  // Heap
  'heap','heap-maxheap','heap-minheap','priorityqueue',
  // Trie
  'trie',
  // Graph
  'graph-algorithms','graph-representation','bfs','dfs','topological-sort',
  'shortest-path-dijkstra','shortest-path-bellman-ford','shortest-path-floyd-warshall',
  'minimum-spanning-tree-kruskal','minimum-spanning-tree-prim','union-find',
  // DP
  'dynamic-programming','dynamic-programming-intro','dp-1d-problems','dp-2d-problems','dp-strings','dp-trees',
  // Sort/Search
  'sorting-intro','searching-intro','binary-search-advanced','divide-and-conquer',
  // Arrays
  'array-basics','array-operations','prefix-sum','sliding-window',
  'two-pointers-patterns','monotonic-stack-patterns','interval-problems',
  // HashMap
  'hashmap-internals','hashing-advanced','collections-overview','linkedhashmap',
  // Java
  'wrapper-classes','data-types-and-variables',
];

const c = new Client({
  connectionString: 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
});

c.connect().then(async () => {
  const dbTopics = await c.query(`
    SELECT slug, has_visualizer FROM topics WHERE slug = ANY($1)
  `, [REGISTRY_SLUGS]);

  const dbMap = {};
  dbTopics.rows.forEach(r => { dbMap[r.slug] = r.has_visualizer; });

  let ok = 0, missingFlag = 0, notInDB = 0;

  console.log('=== Registry vs DB Check ===\n');

  for (const slug of REGISTRY_SLUGS) {
    if (!(slug in dbMap)) {
      console.log(`  ❌ NOT IN DB:     ${slug}`);
      notInDB++;
    } else if (!dbMap[slug]) {
      console.log(`  ⚠️  FLAG NOT SET: ${slug}`);
      missingFlag++;
    } else {
      ok++;
    }
  }

  console.log(`\n✅ OK: ${ok}/${REGISTRY_SLUGS.length}`);
  if (missingFlag) console.log(`⚠️  Missing has_visualizer flag: ${missingFlag}`);
  if (notInDB)    console.log(`❌ Not in DB at all: ${notInDB}`);

  await c.end();
}).catch(e => { console.error(e.message); c.end(); });

