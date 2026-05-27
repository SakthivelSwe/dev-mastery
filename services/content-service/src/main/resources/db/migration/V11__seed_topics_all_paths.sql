-- =============================================================
-- V11: Seed Data — Topics for all 18 Learning Paths
-- Total ~989 topics
-- =============================================================

-- -------------------------------------------------------------
-- Path: Full Stack (full-stack)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'full-stack';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'internet-how-it-works', 'Internet How It Works', 1, 25, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'what-is-http', 'What Is Http', 1, 25, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'browsers-and-how-they-work', 'Browsers And How They Work', 1, 25, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dns-and-how-it-works', 'Dns And How It Works', 1, 25, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'what-is-a-domain-name', 'What Is A Domain Name', 1, 25, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'what-is-hosting', 'What Is Hosting', 1, 25, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'terminal-basics', 'Terminal Basics', 1, 25, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'version-control-basics', 'Version Control Basics', 1, 25, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'html-basics', 'Html Basics', 2, 35, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'css-basics', 'Css Basics', 2, 35, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'javascript-basics', 'Javascript Basics', 2, 35, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'npm-and-package-managers', 'Npm And Package Managers', 2, 35, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'module-bundlers', 'Module Bundlers', 2, 35, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'browser-devtools', 'Browser Devtools', 2, 35, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'fetch-and-xhr', 'Fetch And Xhr', 2, 35, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'json-and-rest', 'Json And Rest', 2, 35, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'react-or-angular-basics', 'React Or Angular Basics', 3, 50, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'typescript-basics', 'Typescript Basics', 3, 50, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nodejs-basics', 'Nodejs Basics', 3, 50, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'databases-intro', 'Databases Intro', 3, 50, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'rest-api-design', 'Rest Api Design', 3, 50, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'authentication-basics', 'Authentication Basics', 3, 50, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'git-workflow', 'Git Workflow', 3, 50, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'docker-basics', 'Docker Basics', 3, 50, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'react-or-angular-advanced', 'React Or Angular Advanced', 4, 60, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-or-nuxt', 'Nextjs Or Nuxt', 4, 60, 26, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-boot-or-nodejs-backend', 'Spring Boot Or Nodejs Backend', 4, 60, 27, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'orm-and-jpa', 'Orm And Jpa', 4, 60, 28, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'database-design', 'Database Design', 4, 60, 29, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'api-security', 'Api Security', 4, 60, 30, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'ci-cd-basics', 'Ci Cd Basics', 4, 60, 31, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'cloud-basics', 'Cloud Basics', 4, 60, 32, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'microservices-architecture', 'Microservices Architecture', 5, 75, 33, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'message-queues', 'Message Queues', 5, 75, 34, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'caching-strategies', 'Caching Strategies', 5, 75, 35, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'container-orchestration', 'Container Orchestration', 5, 75, 36, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'monitoring-and-logging', 'Monitoring And Logging', 5, 75, 37, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'performance-optimization', 'Performance Optimization', 5, 75, 38, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'web-security-advanced', 'Web Security Advanced', 5, 75, 39, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'system-design-basics', 'System Design Basics', 5, 75, 40, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: Java Mastery (java-mastery)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'java-mastery';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'java-intro', 'Java Intro', 1, 25, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'data-types-and-variables', 'Data Types And Variables', 1, 25, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'operators-and-expressions', 'Operators And Expressions', 1, 25, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'control-flow', 'Control Flow', 1, 25, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'arrays', 'Arrays', 1, 25, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'strings', 'Strings', 1, 25, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'methods', 'Methods', 1, 25, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'oop-intro', 'Oop Intro', 1, 25, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'inheritance', 'Inheritance', 2, 35, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'polymorphism', 'Polymorphism', 2, 35, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'abstraction', 'Abstraction', 2, 35, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'interfaces', 'Interfaces', 2, 35, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'encapsulation', 'Encapsulation', 2, 35, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'inner-classes', 'Inner Classes', 2, 35, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'enums', 'Enums', 2, 35, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'generics', 'Generics', 2, 35, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'collections-overview', 'Collections Overview', 3, 50, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'arraylist-vs-linkedlist', 'Arraylist Vs Linkedlist', 3, 50, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'hashmap-internals', 'Hashmap Internals', 3, 50, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'treemap-and-treeset', 'Treemap And Treeset', 3, 50, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'linkedhashmap', 'Linkedhashmap', 3, 50, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'priorityqueue', 'Priorityqueue', 3, 50, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'iterator-pattern', 'Iterator Pattern', 3, 50, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'lambda-expressions', 'Lambda Expressions', 3, 50, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'streams-api', 'Streams Api', 3, 50, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'optional', 'Optional', 3, 50, 26, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'functional-interfaces', 'Functional Interfaces', 3, 50, 27, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'comparator-and-comparable', 'Comparator And Comparable', 3, 50, 28, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'exception-handling', 'Exception Handling', 4, 60, 29, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'concurrency-basics', 'Concurrency Basics', 4, 60, 30, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'executorservice', 'Executorservice', 4, 60, 31, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'concurrency-utilities', 'Concurrency Utilities', 4, 60, 32, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'concurrent-collections', 'Concurrent Collections', 4, 60, 33, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'java-memory-model', 'Java Memory Model', 4, 60, 34, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'garbage-collection', 'Garbage Collection', 4, 60, 35, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'reflection', 'Reflection', 4, 60, 36, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'annotations', 'Annotations', 4, 60, 37, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'io-and-nio', 'Io And Nio', 4, 60, 38, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'serialization', 'Serialization', 4, 60, 39, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'jvm-architecture', 'Jvm Architecture', 5, 75, 40, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'virtual-threads', 'Virtual Threads', 5, 75, 41, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'records-and-sealed-classes', 'Records And Sealed Classes', 5, 75, 42, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'design-patterns-in-java', 'Design Patterns In Java', 5, 75, 43, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'java-modules', 'Java Modules', 5, 75, 44, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'performance-tuning', 'Performance Tuning', 5, 75, 45, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'testing-best-practices', 'Testing Best Practices', 5, 75, 46, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'build-tools', 'Build Tools', 5, 75, 47, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: DSA (dsa)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'dsa';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'array-basics', 'Array Basics', 1, 25, 1, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'array-operations', 'Array Operations', 1, 25, 2, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'sliding-window', 'Sliding Window', 1, 25, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'prefix-sum', 'Prefix Sum', 1, 25, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'string-basics', 'String Basics', 1, 25, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'string-manipulation', 'String Manipulation', 1, 25, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'sorting-intro', 'Sorting Intro', 1, 25, 7, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'searching-intro', 'Searching Intro', 1, 25, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'linked-list-singly', 'Linked List Singly', 2, 35, 9, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'linked-list-doubly', 'Linked List Doubly', 2, 35, 10, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'linked-list-circular', 'Linked List Circular', 2, 35, 11, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'stack', 'Stack', 2, 35, 12, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'queue', 'Queue', 2, 35, 13, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'deque', 'Deque', 2, 35, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'recursion-basics', 'Recursion Basics', 2, 35, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'recursion-advanced', 'Recursion Advanced', 2, 35, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'binary-tree', 'Binary Tree', 3, 50, 17, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'binary-search-tree', 'Binary Search Tree', 3, 50, 18, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'avl-tree', 'Avl Tree', 3, 50, 19, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'red-black-tree', 'Red Black Tree', 3, 50, 20, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'segment-tree', 'Segment Tree', 3, 50, 21, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'fenwick-tree', 'Fenwick Tree', 3, 50, 22, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'trie', 'Trie', 3, 50, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'heap-minheap', 'Heap Minheap', 3, 50, 24, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'heap-maxheap', 'Heap Maxheap', 3, 50, 25, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'priority-queue', 'Priority Queue', 3, 50, 26, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'graph-representation', 'Graph Representation', 4, 60, 27, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'bfs', 'Bfs', 4, 60, 28, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'dfs', 'Dfs', 4, 60, 29, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'topological-sort', 'Topological Sort', 4, 60, 30, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'shortest-path-dijkstra', 'Shortest Path Dijkstra', 4, 60, 31, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'shortest-path-bellman-ford', 'Shortest Path Bellman Ford', 4, 60, 32, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'shortest-path-floyd-warshall', 'Shortest Path Floyd Warshall', 4, 60, 33, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'minimum-spanning-tree-kruskal', 'Minimum Spanning Tree Kruskal', 4, 60, 34, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'minimum-spanning-tree-prim', 'Minimum Spanning Tree Prim', 4, 60, 35, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'union-find', 'Union Find', 4, 60, 36, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dynamic-programming-intro', 'Dynamic Programming Intro', 4, 60, 37, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dp-1d-problems', 'Dp 1d Problems', 4, 60, 38, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dp-2d-problems', 'Dp 2d Problems', 4, 60, 39, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dp-strings', 'Dp Strings', 4, 60, 40, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dp-trees', 'Dp Trees', 4, 60, 41, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'backtracking', 'Backtracking', 5, 75, 42, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'greedy-algorithms', 'Greedy Algorithms', 5, 75, 43, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'divide-and-conquer', 'Divide And Conquer', 5, 75, 44, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'binary-search-advanced', 'Binary Search Advanced', 5, 75, 45, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'bit-manipulation', 'Bit Manipulation', 5, 75, 46, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'hashing-advanced', 'Hashing Advanced', 5, 75, 47, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'string-algorithms', 'String Algorithms', 5, 75, 48, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'two-pointers-patterns', 'Two Pointers Patterns', 5, 75, 49, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'monotonic-stack-patterns', 'Monotonic Stack Patterns', 5, 75, 50, FALSE, TRUE, TRUE),
      (gen_random_uuid(), path_id, 'interval-problems', 'Interval Problems', 5, 75, 51, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: LeetCode Patterns (leetcode-patterns)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'leetcode-patterns';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'two-pointers-pattern', 'Two Pointers Pattern', 2, 35, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'sliding-window-pattern', 'Sliding Window Pattern', 2, 35, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'prefix-sum-pattern', 'Prefix Sum Pattern', 2, 35, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'binary-search-pattern', 'Binary Search Pattern', 2, 35, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'hashmap-frequency-pattern', 'Hashmap Frequency Pattern', 2, 35, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'stack-pattern', 'Stack Pattern', 2, 35, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'tree-traversal-pattern', 'Tree Traversal Pattern', 3, 50, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'merge-intervals-pattern', 'Merge Intervals Pattern', 3, 50, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'kadane-algorithm', 'Kadane Algorithm', 3, 50, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'fast-slow-pointers', 'Fast Slow Pointers', 3, 50, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'top-k-elements', 'Top K Elements', 3, 50, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'trie-pattern', 'Trie Pattern', 3, 50, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'backtracking-pattern', 'Backtracking Pattern', 3, 50, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dp-knapsack-pattern', 'Dp Knapsack Pattern', 4, 60, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dp-fibonacci-pattern', 'Dp Fibonacci Pattern', 4, 60, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dp-palindrome-pattern', 'Dp Palindrome Pattern', 4, 60, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dp-grid-pattern', 'Dp Grid Pattern', 4, 60, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'graph-bfs-pattern', 'Graph Bfs Pattern', 4, 60, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'graph-dfs-pattern', 'Graph Dfs Pattern', 4, 60, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'union-find-pattern', 'Union Find Pattern', 4, 60, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'segment-tree-pattern', 'Segment Tree Pattern', 5, 75, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'monotonic-stack-advanced', 'Monotonic Stack Advanced', 5, 75, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'hard-dp', 'Hard Dp', 5, 75, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'hard-graph', 'Hard Graph', 5, 75, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'hard-string', 'Hard String', 5, 75, 25, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: JavaScript (javascript)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'javascript';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'js-intro', 'Js Intro', 1, 25, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'variables', 'Variables', 1, 25, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'data-types', 'Data Types', 1, 25, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'type-coercion', 'Type Coercion', 1, 25, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'operators', 'Operators', 1, 25, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'control-flow-js', 'Control Flow Js', 1, 25, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'loops', 'Loops', 1, 25, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'functions-basics', 'Functions Basics', 1, 25, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'arrays-in-js', 'Arrays In Js', 2, 35, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'objects-in-js', 'Objects In Js', 2, 35, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'destructuring', 'Destructuring', 2, 35, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spread-and-rest', 'Spread And Rest', 2, 35, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'template-literals', 'Template Literals', 2, 35, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'closures', 'Closures', 2, 35, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'this-keyword', 'This Keyword', 2, 35, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'prototype-chain', 'Prototype Chain', 2, 35, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'classes-in-js', 'Classes In Js', 2, 35, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'error-handling-js', 'Error Handling Js', 2, 35, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'callbacks', 'Callbacks', 3, 50, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'promises', 'Promises', 3, 50, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'async-await', 'Async Await', 3, 50, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'event-loop', 'Event Loop', 3, 50, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'settimeout-vs-setinterval', 'Settimeout Vs Setinterval', 3, 50, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'fetch-api', 'Fetch Api', 3, 50, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'xhr-and-ajax', 'Xhr And Ajax', 3, 50, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'generators', 'Generators', 3, 50, 26, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'modules-es6', 'Modules Es6', 4, 60, 27, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'webpack-and-vite', 'Webpack And Vite', 4, 60, 28, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dom-manipulation', 'Dom Manipulation', 4, 60, 29, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'web-apis', 'Web Apis', 4, 60, 30, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'regular-expressions', 'Regular Expressions', 4, 60, 31, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'functional-programming-js', 'Functional Programming Js', 4, 60, 32, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'design-patterns-js', 'Design Patterns Js', 4, 60, 33, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'symbol-and-iterators', 'Symbol And Iterators', 4, 60, 34, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'proxy-and-reflect', 'Proxy And Reflect', 4, 60, 35, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'weakref-and-finalizationregistry', 'Weakref And Finalizationregistry', 4, 60, 36, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'v8-engine', 'V8 Engine', 5, 75, 37, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'memory-management-js', 'Memory Management Js', 5, 75, 38, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'event-loop-deep', 'Event Loop Deep', 5, 75, 39, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'performance-optimization-js', 'Performance Optimization Js', 5, 75, 40, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'security-js', 'Security Js', 5, 75, 41, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'testing-js', 'Testing Js', 5, 75, 42, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: TypeScript (typescript)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'typescript';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'ts-intro', 'Ts Intro', 2, 35, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'basic-types', 'Basic Types', 2, 35, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'arrays-and-tuples', 'Arrays And Tuples', 2, 35, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'objects-and-interfaces', 'Objects And Interfaces', 2, 35, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'functions-ts', 'Functions Ts', 2, 35, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'union-and-intersection', 'Union And Intersection', 2, 35, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'type-narrowing', 'Type Narrowing', 2, 35, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'generics-ts', 'Generics Ts', 3, 50, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'enums-ts', 'Enums Ts', 3, 50, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'classes-ts', 'Classes Ts', 3, 50, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'utility-types', 'Utility Types', 3, 50, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'mapped-types', 'Mapped Types', 3, 50, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'conditional-types', 'Conditional Types', 3, 50, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'template-literal-types', 'Template Literal Types', 3, 50, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'declaration-files', 'Declaration Files', 4, 60, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'module-resolution', 'Module Resolution', 4, 60, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'advanced-generics', 'Advanced Generics', 4, 60, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'decorators-ts', 'Decorators Ts', 4, 60, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'type-challenges', 'Type Challenges', 4, 60, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'tsconfig-deep', 'Tsconfig Deep', 4, 60, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'performance-ts', 'Performance Ts', 4, 60, 21, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: React (react)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'react';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'react-intro', 'React Intro', 2, 35, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'jsx', 'Jsx', 2, 35, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'components', 'Components', 2, 35, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'props', 'Props', 2, 35, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'state-usestate', 'State Usestate', 2, 35, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'event-handling-react', 'Event Handling React', 2, 35, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'conditional-rendering', 'Conditional Rendering', 2, 35, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'list-rendering', 'List Rendering', 2, 35, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'forms-react', 'Forms React', 2, 35, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'useeffect', 'Useeffect', 3, 50, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'useref', 'Useref', 3, 50, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'usecontext', 'Usecontext', 3, 50, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'usememo-usecallback', 'Usememo Usecallback', 3, 50, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'custom-hooks', 'Custom Hooks', 3, 50, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'react-router-v6', 'React Router V6', 3, 50, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'lifting-state-up', 'Lifting State Up', 3, 50, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'component-composition', 'Component Composition', 3, 50, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'state-management-redux', 'State Management Redux', 4, 60, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'state-management-zustand', 'State Management Zustand', 4, 60, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'react-query-tanstack', 'React Query Tanstack', 4, 60, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'lazy-loading-suspense', 'Lazy Loading Suspense', 4, 60, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'portals', 'Portals', 4, 60, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'concurrent-features', 'Concurrent Features', 4, 60, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'performance-react', 'Performance React', 4, 60, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'testing-react', 'Testing React', 4, 60, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'react-compiler', 'React Compiler', 5, 75, 26, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'server-components', 'Server Components', 5, 75, 27, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'react-19-features', 'React 19 Features', 5, 75, 28, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'nextjs-integration', 'Nextjs Integration', 5, 75, 29, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'micro-frontends-react', 'Micro Frontends React', 5, 75, 30, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'accessibility-react', 'Accessibility React', 5, 75, 31, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: Angular (angular)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'angular';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'angular-intro', 'Angular Intro', 2, 35, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'components-angular', 'Components Angular', 2, 35, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'templates', 'Templates', 2, 35, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'directives-built-in', 'Directives Built In', 2, 35, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pipes', 'Pipes', 2, 35, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'services-and-di', 'Services And Di', 2, 35, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'http-client', 'Http Client', 2, 35, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'forms-template-driven', 'Forms Template Driven', 2, 35, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'forms-reactive', 'Forms Reactive', 2, 35, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'routing-angular', 'Routing Angular', 3, 50, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'lazy-loading-angular', 'Lazy Loading Angular', 3, 50, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'lifecycle-hooks', 'Lifecycle Hooks', 3, 50, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'viewchild-contentchild', 'Viewchild Contentchild', 3, 50, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'change-detection', 'Change Detection', 3, 50, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'rxjs-in-angular', 'Rxjs In Angular', 3, 50, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'interceptors', 'Interceptors', 3, 50, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'guards', 'Guards', 3, 50, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'signals', 'Signals', 3, 50, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'state-management-ngrx', 'State Management Ngrx', 4, 60, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'state-management-signals', 'State Management Signals', 4, 60, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'standalone-components', 'Standalone Components', 4, 60, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'angular-universal', 'Angular Universal', 4, 60, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'angular-pwa', 'Angular Pwa', 4, 60, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'angular-material', 'Angular Material', 4, 60, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'custom-directives', 'Custom Directives', 4, 60, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'testing-angular', 'Testing Angular', 4, 60, 26, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'performance-angular', 'Performance Angular', 4, 60, 27, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'monorepo-nx', 'Monorepo Nx', 5, 75, 28, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'micro-frontends-angular', 'Micro Frontends Angular', 5, 75, 29, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'angular-cdktesting', 'Angular Cdktesting', 5, 75, 30, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'zonejs-deep', 'Zonejs Deep', 5, 75, 31, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'angular-compiler', 'Angular Compiler', 5, 75, 32, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'rxjs-advanced', 'Rxjs Advanced', 5, 75, 33, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: Spring Boot (spring-boot)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'spring-boot';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'spring-intro', 'Spring Intro', 2, 35, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-beans', 'Spring Beans', 2, 35, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dependency-injection', 'Dependency Injection', 2, 35, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'component-scanning', 'Component Scanning', 2, 35, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'bean-scope', 'Bean Scope', 2, 35, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-configuration', 'Spring Configuration', 2, 35, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-profiles', 'Spring Profiles', 2, 35, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-events', 'Spring Events', 2, 35, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-boot-intro', 'Spring Boot Intro', 3, 50, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'rest-controllers', 'Rest Controllers', 3, 50, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'request-response', 'Request Response', 3, 50, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'response-entity', 'Response Entity', 3, 50, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'exception-handling-spring', 'Exception Handling Spring', 3, 50, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'validation-spring', 'Validation Spring', 3, 50, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'springdoc-openapi', 'Springdoc Openapi', 3, 50, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'content-negotiation', 'Content Negotiation', 3, 50, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-data-jpa', 'Spring Data Jpa', 4, 60, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'jpa-entity-mapping', 'Jpa Entity Mapping', 4, 60, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'jpa-relationships', 'Jpa Relationships', 4, 60, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'jpql-and-criteria', 'Jpql And Criteria', 4, 60, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'flyway-migrations', 'Flyway Migrations', 4, 60, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-security-basics', 'Spring Security Basics', 4, 60, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'jwt-authentication', 'Jwt Authentication', 4, 60, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'oauth2-spring', 'Oauth2 Spring', 4, 60, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-cache', 'Spring Cache', 4, 60, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-cloud-gateway', 'Spring Cloud Gateway', 5, 75, 26, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-kafka', 'Spring Kafka', 5, 75, 27, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'resilience4j-spring', 'Resilience4j Spring', 5, 75, 28, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-actuator', 'Spring Actuator', 5, 75, 29, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'testcontainers-spring', 'Testcontainers Spring', 5, 75, 30, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-batch', 'Spring Batch', 5, 75, 31, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spring-webflux', 'Spring Webflux', 5, 75, 32, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'virtual-threads-spring', 'Virtual Threads Spring', 5, 75, 33, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'grpc-spring', 'Grpc Spring', 5, 75, 34, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: System Design (system-design)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'system-design';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'sd-requirements', 'Sd Requirements', 3, 50, 1, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-scalability', 'Sd Scalability', 3, 50, 2, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-load-balancing', 'Sd Load Balancing', 3, 50, 3, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-caching-intro', 'Sd Caching Intro', 3, 50, 4, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-cdn', 'Sd Cdn', 3, 50, 5, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-databases-overview', 'Sd Databases Overview', 3, 50, 6, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-cap-theorem', 'Sd Cap Theorem', 3, 50, 7, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-back-of-envelope', 'Sd Back Of Envelope', 3, 50, 8, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-sql-databases', 'Sd Sql Databases', 4, 60, 9, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-nosql-databases', 'Sd Nosql Databases', 4, 60, 10, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-database-replication', 'Sd Database Replication', 4, 60, 11, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-database-sharding', 'Sd Database Sharding', 4, 60, 12, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-database-indexing', 'Sd Database Indexing', 4, 60, 13, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-transactions', 'Sd Transactions', 4, 60, 14, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-caching-patterns', 'Sd Caching Patterns', 4, 60, 15, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-message-queues', 'Sd Message Queues', 4, 60, 16, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-api-gateway', 'Sd Api Gateway', 4, 60, 17, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-consistent-hashing', 'Sd Consistent Hashing', 4, 60, 18, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-distributed-id', 'Sd Distributed Id', 4, 60, 19, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'sd-search-engines', 'Sd Search Engines', 4, 60, 20, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-url-shortener', 'Design Url Shortener', 5, 75, 21, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-twitter', 'Design Twitter', 5, 75, 22, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-youtube', 'Design Youtube', 5, 75, 23, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-uber', 'Design Uber', 5, 75, 24, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-whatsapp', 'Design Whatsapp', 5, 75, 25, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-google-search', 'Design Google Search', 5, 75, 26, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-netflix', 'Design Netflix', 5, 75, 27, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-rate-limiter', 'Design Rate Limiter', 5, 75, 28, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-notification-system', 'Design Notification System', 5, 75, 29, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-distributed-cache', 'Design Distributed Cache', 5, 75, 30, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-payment-system', 'Design Payment System', 5, 75, 31, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'design-google-drive', 'Design Google Drive', 5, 75, 32, FALSE, FALSE, FALSE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: API Design (api-design)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'api-design';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'rest-principles', 'Rest Principles', 2, 35, 1, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'http-methods', 'Http Methods', 2, 35, 2, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'status-codes', 'Status Codes', 2, 35, 3, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'url-design', 'Url Design', 2, 35, 4, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'request-response-format', 'Request Response Format', 2, 35, 5, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'versioning-strategies', 'Versioning Strategies', 2, 35, 6, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'authentication-api', 'Authentication Api', 3, 50, 7, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'authorization-api', 'Authorization Api', 3, 50, 8, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'pagination-api', 'Pagination Api', 3, 50, 9, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'filtering-sorting', 'Filtering Sorting', 3, 50, 10, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'api-rate-limiting', 'Api Rate Limiting', 3, 50, 11, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'api-caching', 'Api Caching', 3, 50, 12, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'error-handling-api', 'Error Handling Api', 3, 50, 13, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'graphql-basics', 'Graphql Basics', 4, 60, 14, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'graphql-advanced', 'Graphql Advanced', 4, 60, 15, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'grpc-basics', 'Grpc Basics', 4, 60, 16, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'websockets-api', 'Websockets Api', 4, 60, 17, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'webhooks', 'Webhooks', 4, 60, 18, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'api-documentation', 'Api Documentation', 4, 60, 19, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'api-testing', 'Api Testing', 4, 60, 20, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'api-security-advanced', 'Api Security Advanced', 4, 60, 21, FALSE, FALSE, FALSE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: Software Architecture (software-architecture)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'software-architecture';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'solid-principles', 'Solid Principles', 3, 50, 1, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'dry-kiss-yagni', 'Dry Kiss Yagni', 3, 50, 2, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'clean-code', 'Clean Code', 3, 50, 3, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'code-smells', 'Code Smells', 3, 50, 4, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'refactoring', 'Refactoring', 3, 50, 5, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'tdd-basics', 'Tdd Basics', 3, 50, 6, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'layered-architecture', 'Layered Architecture', 4, 60, 7, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'clean-architecture', 'Clean Architecture', 4, 60, 8, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'hexagonal-architecture', 'Hexagonal Architecture', 4, 60, 9, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'cqrs', 'Cqrs', 4, 60, 10, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'event-sourcing', 'Event Sourcing', 4, 60, 11, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'domain-driven-design', 'Domain Driven Design', 4, 60, 12, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'microservices-patterns', 'Microservices Patterns', 4, 60, 13, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'distributed-transactions', 'Distributed Transactions', 5, 75, 14, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'eventual-consistency', 'Eventual Consistency', 5, 75, 15, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'observability', 'Observability', 5, 75, 16, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'service-mesh', 'Service Mesh', 5, 75, 17, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'platform-engineering', 'Platform Engineering', 5, 75, 18, FALSE, FALSE, FALSE),
      (gen_random_uuid(), path_id, 'arc42-documentation', 'Arc42 Documentation', 5, 75, 19, FALSE, FALSE, FALSE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: HTML (html)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'html';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'html-intro', 'Html Intro', 1, 25, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'text-elements', 'Text Elements', 1, 25, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'list-elements', 'List Elements', 1, 25, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'links-and-images', 'Links And Images', 1, 25, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'tables', 'Tables', 1, 25, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'forms-html', 'Forms Html', 1, 25, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'semantic-elements', 'Semantic Elements', 1, 25, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'accessibility-html', 'Accessibility Html', 2, 35, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'meta-tags-and-seo', 'Meta Tags And Seo', 2, 35, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'html5-apis', 'Html5 Apis', 2, 35, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'form-validation', 'Form Validation', 2, 35, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'html-attributes', 'Html Attributes', 2, 35, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'template-slot', 'Template Slot', 2, 35, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'web-components', 'Web Components', 3, 50, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'performance-html', 'Performance Html', 3, 50, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pwa-manifest', 'Pwa Manifest', 3, 50, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'internationalization', 'Internationalization', 3, 50, 17, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: CSS (css)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'css';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'css-intro', 'Css Intro', 1, 25, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'selectors', 'Selectors', 1, 25, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'box-model', 'Box Model', 1, 25, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'colors', 'Colors', 1, 25, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'typography', 'Typography', 1, 25, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'backgrounds', 'Backgrounds', 1, 25, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'units', 'Units', 1, 25, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'display-and-positioning', 'Display And Positioning', 2, 35, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'flexbox', 'Flexbox', 2, 35, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'css-grid', 'Css Grid', 2, 35, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'float-and-clear', 'Float And Clear', 2, 35, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'css-variables', 'Css Variables', 2, 35, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'responsive-design', 'Responsive Design', 2, 35, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'css-animations', 'Css Animations', 3, 50, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'css-transitions', 'Css Transitions', 3, 50, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'transforms', 'Transforms', 3, 50, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'filters-and-effects', 'Filters And Effects', 3, 50, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pseudo-classes-advanced', 'Pseudo Classes Advanced', 3, 50, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pseudo-elements-advanced', 'Pseudo Elements Advanced', 3, 50, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'css-functions', 'Css Functions', 3, 50, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'custom-properties-advanced', 'Custom Properties Advanced', 3, 50, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'css-architecture', 'Css Architecture', 4, 60, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'preprocessors', 'Preprocessors', 4, 60, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'postcss', 'Postcss', 4, 60, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'tailwind-deep', 'Tailwind Deep', 4, 60, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'css-in-js', 'Css In Js', 4, 60, 26, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'css-performance', 'Css Performance', 4, 60, 27, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'printing-css', 'Printing Css', 4, 60, 28, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: SQL (sql)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'sql';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'sql-intro', 'Sql Intro', 1, 25, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'ddl-basics', 'Ddl Basics', 1, 25, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'dml-basics', 'Dml Basics', 1, 25, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'select-deep', 'Select Deep', 1, 25, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'filtering', 'Filtering', 1, 25, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'aggregate-functions', 'Aggregate Functions', 1, 25, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'joins', 'Joins', 2, 35, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'subqueries', 'Subqueries', 2, 35, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'set-operations', 'Set Operations', 2, 35, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'string-functions', 'String Functions', 2, 35, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'date-functions', 'Date Functions', 2, 35, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'null-handling', 'Null Handling', 2, 35, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'case-expression', 'Case Expression', 2, 35, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'insert-update-delete-advanced', 'Insert Update Delete Advanced', 2, 35, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'window-functions', 'Window Functions', 3, 50, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'cte', 'Cte', 3, 50, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'indexes', 'Indexes', 3, 50, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'transactions', 'Transactions', 3, 50, 18, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'views', 'Views', 3, 50, 19, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'stored-procedures', 'Stored Procedures', 3, 50, 20, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'triggers', 'Triggers', 3, 50, 21, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'query-optimization', 'Query Optimization', 4, 60, 22, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'normalization', 'Normalization', 4, 60, 23, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'schema-design', 'Schema Design', 4, 60, 24, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'partitioning-sql', 'Partitioning Sql', 4, 60, 25, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'json-in-sql', 'Json In Sql', 4, 60, 26, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'full-text-search-sql', 'Full Text Search Sql', 4, 60, 27, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: PostgreSQL DBA (postgresql-dba)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'postgresql-dba';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'pg-architecture', 'Pg Architecture', 3, 50, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-storage', 'Pg Storage', 3, 50, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-write-ahead-log', 'Pg Write Ahead Log', 3, 50, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-configuration', 'Pg Configuration', 3, 50, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-vacuum', 'Pg Vacuum', 3, 50, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-statistics', 'Pg Statistics', 3, 50, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-backup', 'Pg Backup', 4, 60, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-replication', 'Pg Replication', 4, 60, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-high-availability', 'Pg High Availability', 4, 60, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-extensions', 'Pg Extensions', 4, 60, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-roles-security', 'Pg Roles Security', 4, 60, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-monitoring', 'Pg Monitoring', 4, 60, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-logical-replication', 'Pg Logical Replication', 4, 60, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-performance-tuning', 'Pg Performance Tuning', 5, 75, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-advanced-indexing', 'Pg Advanced Indexing', 5, 75, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-partitioning', 'Pg Partitioning', 5, 75, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-jsonb-advanced', 'Pg Jsonb Advanced', 5, 75, 17, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'pg-parallel-query', 'Pg Parallel Query', 5, 75, 18, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: MongoDB (mongodb)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'mongodb';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'mongodb-intro', 'Mongodb Intro', 2, 35, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'crud-operations', 'Crud Operations', 2, 35, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'query-operators', 'Query Operators', 2, 35, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'update-operators', 'Update Operators', 2, 35, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'projections', 'Projections', 2, 35, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'aggregation-pipeline', 'Aggregation Pipeline', 3, 50, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'aggregation-advanced', 'Aggregation Advanced', 3, 50, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'indexes-mongodb', 'Indexes Mongodb', 3, 50, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'schema-design-mongodb', 'Schema Design', 3, 50, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'transactions-mongodb', 'Transactions Mongodb', 3, 50, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'replication-mongodb', 'Replication Mongodb', 4, 60, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'sharding-mongodb', 'Sharding Mongodb', 4, 60, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'mongodb-atlas', 'Mongodb Atlas', 4, 60, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'mongodb-security', 'Mongodb Security', 4, 60, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'change-streams', 'Change Streams', 4, 60, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'mongodb-performance', 'Mongodb Performance', 4, 60, 16, FALSE, FALSE, TRUE);
  END IF;
END $$;

-- -------------------------------------------------------------
-- Path: Design System (design-system)
-- -------------------------------------------------------------
DO $$
DECLARE path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'design-system';
  IF path_id IS NOT NULL THEN
    INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
    VALUES
      (gen_random_uuid(), path_id, 'design-tokens', 'Design Tokens', 2, 35, 1, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'typography-system', 'Typography System', 2, 35, 2, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'color-system', 'Color System', 2, 35, 3, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'spacing-system', 'Spacing System', 2, 35, 4, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'iconography', 'Iconography', 2, 35, 5, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'button-component', 'Button Component', 3, 50, 6, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'input-and-form-components', 'Input And Form Components', 3, 50, 7, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'navigation-components', 'Navigation Components', 3, 50, 8, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'feedback-components', 'Feedback Components', 3, 50, 9, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'modal-and-overlay', 'Modal And Overlay', 3, 50, 10, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'data-display', 'Data Display', 3, 50, 11, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'storybook', 'Storybook', 4, 60, 12, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'component-api-design', 'Component Api Design', 4, 60, 13, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'theming-architecture', 'Theming Architecture', 4, 60, 14, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'accessibility-system', 'Accessibility System', 4, 60, 15, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'design-token-pipeline', 'Design Token Pipeline', 4, 60, 16, FALSE, FALSE, TRUE),
      (gen_random_uuid(), path_id, 'versioning-and-publishing', 'Versioning And Publishing', 4, 60, 17, FALSE, FALSE, TRUE);
  END IF;
END $$;

