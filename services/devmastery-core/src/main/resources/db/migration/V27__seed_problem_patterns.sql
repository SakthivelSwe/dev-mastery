-- =============================================================
-- V27 — Seed the 30 canonical coding-interview patterns and
--       6 representative LeetCode problems per pattern (~180 rows).
--
-- Curated from the standard "Grokking the Coding Interview" set
-- plus widely-cited additions (Trie, Union-Find, Monotonic Stack,
-- Prefix Sum, Graph BFS/DFS, Backtracking, Matrix, Hash Map).
-- =============================================================

-- ── Patterns: upsert by slug so the 4 existing ones get refreshed
--    descriptions and the 26 new ones get inserted. ───────────
INSERT INTO problem_patterns (name, slug, description, difficulty_level) VALUES
  ('Sliding Window',                'sliding-window',                'Run a contiguous "window" over the data and slide it forward, expanding/shrinking to satisfy a constraint. Perfect for "longest/shortest/contains" subarray/substring problems.', 'Medium'),
  ('Two Pointers',                  'two-pointers',                  'Place two indices on the data (opposite ends, or same end at different speeds) and converge them based on conditions. Great for sorted arrays, pair sums, and palindromes.', 'Easy'),
  ('Fast & Slow Pointers',          'fast-slow-pointers',            'Floyd''s tortoise & hare — one pointer moves twice as fast as the other to detect cycles, find midpoints, or locate cycle starts.', 'Medium'),
  ('Merge Intervals',               'merge-intervals',               'Sort intervals by start, then walk and merge or split overlaps. Handles meeting rooms, employee free time, and interval intersection problems.', 'Medium'),
  ('Cyclic Sort',                   'cyclic-sort',                   'When inputs are bounded in [1..N], place each value at index value-1 in O(n). Finds duplicates / missing numbers without extra space.', 'Medium'),
  ('In-place Linked List Reversal', 'in-place-linked-list-reversal', 'Reverse a sublist of a singly linked list by rewiring next pointers in place — O(1) extra space.', 'Medium'),
  ('Tree BFS',                      'tree-bfs',                      'Level-order traversal with a queue. Used for shortest paths in unweighted trees, level views, and zigzag traversal.', 'Medium'),
  ('Tree DFS',                      'tree-dfs',                      'Recursion / explicit stack to dive deep before going wide. Path sums, subtree problems, and tree comparisons.', 'Medium'),
  ('Two Heaps',                     'two-heaps',                     'Split data into a max-heap (lower half) and min-heap (upper half) to track medians or partition by rank in O(log n).', 'Hard'),
  ('Subsets / Combinations',        'subsets',                       'BFS-style expansion: start with [[]], for each input clone every existing subset and append the new element. Powers permutations and combinations too.', 'Medium'),
  ('Modified Binary Search',        'modified-binary-search',        'Binary search on rotated/duplicated/sorted-by-property arrays, or on the answer space itself.', 'Medium'),
  ('Bitwise XOR',                   'bitwise-xor',                   'XOR cancels duplicates (a ^ a = 0). Used for "single number", missing number, and bit-manipulation tricks.', 'Easy'),
  ('Top K Elements',                'top-k-elements',                'Maintain a heap of size K to find the K largest/smallest/most-frequent elements in O(n log k).', 'Medium'),
  ('K-way Merge',                   'k-way-merge',                   'Use a min-heap seeded with the head of each list/array to merge K sorted sequences in O(N log k).', 'Hard'),
  ('Topological Sort',              'topological-sort',              'Kahn''s algorithm (BFS with in-degrees) or DFS post-order — orders DAG nodes so every edge points forward.', 'Medium'),
  ('0/1 Knapsack DP',               '0-1-knapsack-dp',               'Each item used at most once. 2D table dp[i][w] = best value using first i items within weight w. Powers subset-sum, partition, and target-sum problems.', 'Hard'),
  ('Unbounded Knapsack DP',         'unbounded-knapsack-dp',         'Items reusable. 1D table iterated from low to high. Coin change, rod cutting, word break, perfect squares.', 'Hard'),
  ('Fibonacci DP',                  'fibonacci-dp',                  'Linear DP where each state depends on the previous one or two — climbing stairs, house robber, decode ways.', 'Easy'),
  ('Palindromic Subsequence DP',    'palindromic-subsequence-dp',    '2D interval DP — dp[i][j] answers a question about the substring from i to j by expanding from inside out.', 'Hard'),
  ('Longest Common Subsequence DP', 'longest-common-subsequence-dp', '2D grid DP comparing two strings — LCS, edit distance, repeated subarray, longest increasing subsequence variants.', 'Hard'),
  ('Monotonic Stack',               'monotonic-stack',               'Maintain a stack whose elements are strictly increasing or decreasing. Answers "next greater" / "next smaller" / histogram-area problems in O(n).', 'Medium'),
  ('Prefix Sum',                    'prefix-sum',                    'Precompute cumulative sums so any range sum is O(1). Combined with a hash map it solves "subarray sums equal to K".', 'Easy'),
  ('Trie',                          'trie',                          'Prefix tree of characters. O(L) insert/search for autocomplete, word search II, replace-words, and XOR-of-array problems.', 'Medium'),
  ('Union Find (DSU)',              'union-find',                    'Disjoint-set with path compression + union by rank — near O(α(n)) per op. Connectivity, redundant edges, accounts merge.', 'Medium'),
  ('Greedy',                        'greedy',                        'Make the locally optimal choice at each step. Jump game, gas station, interval scheduling, partition labels.', 'Medium'),
  ('Backtracking',                  'backtracking',                  'DFS with explicit undo — try a choice, recurse, then revert. N-Queens, Sudoku, combination sum, word search.', 'Hard'),
  ('Matrix Traversal',              'matrix-traversal',              'Flood-fill or directional walks over a 2D grid. Number of islands, surrounded regions, set zeroes, spiral order.', 'Medium'),
  ('Graph BFS',                     'graph-bfs',                     'Shortest path in an unweighted graph using a FIFO queue. Word ladder, rotting oranges, 01-matrix, open the lock.', 'Medium'),
  ('Graph DFS',                     'graph-dfs',                     'Explore as deep as possible before backtracking. Connected components, cycle detection, clone graph, Pacific-Atlantic.', 'Medium'),
  ('Hash Map / Frequency Counting', 'hash-map-frequency',            'Use a dictionary to map values → counts/positions for O(1) lookup. Two sum, group anagrams, valid anagram, first unique char.', 'Easy')
ON CONFLICT (slug) DO UPDATE
   SET name             = EXCLUDED.name,
       description      = EXCLUDED.description,
       difficulty_level = EXCLUDED.difficulty_level;

-- ── Prevent duplicate problems per pattern on re-runs ────────
CREATE UNIQUE INDEX IF NOT EXISTS uq_pattern_problems_pattern_title
  ON pattern_problems (pattern_id, title);

-- ── Problems: 6 per pattern, mixed difficulties, with LeetCode URLs.
INSERT INTO pattern_problems (pattern_id, title, difficulty, leetcode_url)
SELECT p.id, np.title, np.difficulty, np.url
FROM problem_patterns p
JOIN (VALUES
  -- Sliding Window
  ('sliding-window', 'Maximum Average Subarray I',                       'Easy',   'https://leetcode.com/problems/maximum-average-subarray-i/'),
  ('sliding-window', 'Longest Substring Without Repeating Characters',   'Medium', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'),
  ('sliding-window', 'Minimum Window Substring',                         'Hard',   'https://leetcode.com/problems/minimum-window-substring/'),
  ('sliding-window', 'Minimum Size Subarray Sum',                        'Medium', 'https://leetcode.com/problems/minimum-size-subarray-sum/'),
  ('sliding-window', 'Permutation in String',                            'Medium', 'https://leetcode.com/problems/permutation-in-string/'),
  ('sliding-window', 'Longest Repeating Character Replacement',          'Medium', 'https://leetcode.com/problems/longest-repeating-character-replacement/'),
  -- Two Pointers
  ('two-pointers', 'Two Sum II - Input Array Is Sorted',                 'Easy',   'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/'),
  ('two-pointers', 'Container With Most Water',                          'Medium', 'https://leetcode.com/problems/container-with-most-water/'),
  ('two-pointers', '3Sum',                                               'Medium', 'https://leetcode.com/problems/3sum/'),
  ('two-pointers', 'Sort Colors',                                        'Medium', 'https://leetcode.com/problems/sort-colors/'),
  ('two-pointers', 'Trapping Rain Water',                                'Hard',   'https://leetcode.com/problems/trapping-rain-water/'),
  ('two-pointers', 'Valid Palindrome',                                   'Easy',   'https://leetcode.com/problems/valid-palindrome/'),
  -- Fast & Slow Pointers
  ('fast-slow-pointers', 'Linked List Cycle',                            'Easy',   'https://leetcode.com/problems/linked-list-cycle/'),
  ('fast-slow-pointers', 'Linked List Cycle II',                         'Medium', 'https://leetcode.com/problems/linked-list-cycle-ii/'),
  ('fast-slow-pointers', 'Middle of the Linked List',                    'Easy',   'https://leetcode.com/problems/middle-of-the-linked-list/'),
  ('fast-slow-pointers', 'Happy Number',                                 'Easy',   'https://leetcode.com/problems/happy-number/'),
  ('fast-slow-pointers', 'Find the Duplicate Number',                    'Medium', 'https://leetcode.com/problems/find-the-duplicate-number/'),
  ('fast-slow-pointers', 'Palindrome Linked List',                       'Easy',   'https://leetcode.com/problems/palindrome-linked-list/'),
  -- Merge Intervals
  ('merge-intervals', 'Merge Intervals',                                 'Medium', 'https://leetcode.com/problems/merge-intervals/'),
  ('merge-intervals', 'Insert Interval',                                 'Medium', 'https://leetcode.com/problems/insert-interval/'),
  ('merge-intervals', 'Non-overlapping Intervals',                       'Medium', 'https://leetcode.com/problems/non-overlapping-intervals/'),
  ('merge-intervals', 'Meeting Rooms',                                   'Easy',   'https://leetcode.com/problems/meeting-rooms/'),
  ('merge-intervals', 'Meeting Rooms II',                                'Medium', 'https://leetcode.com/problems/meeting-rooms-ii/'),
  ('merge-intervals', 'Interval List Intersections',                     'Medium', 'https://leetcode.com/problems/interval-list-intersections/'),
  -- Cyclic Sort
  ('cyclic-sort', 'Missing Number',                                      'Easy',   'https://leetcode.com/problems/missing-number/'),
  ('cyclic-sort', 'Find All Numbers Disappeared in an Array',            'Easy',   'https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/'),
  ('cyclic-sort', 'Find the Duplicate Number',                           'Medium', 'https://leetcode.com/problems/find-the-duplicate-number/'),
  ('cyclic-sort', 'Find All Duplicates in an Array',                     'Medium', 'https://leetcode.com/problems/find-all-duplicates-in-an-array/'),
  ('cyclic-sort', 'First Missing Positive',                              'Hard',   'https://leetcode.com/problems/first-missing-positive/'),
  ('cyclic-sort', 'Set Mismatch',                                        'Easy',   'https://leetcode.com/problems/set-mismatch/'),
  -- In-place Linked List Reversal
  ('in-place-linked-list-reversal', 'Reverse Linked List',               'Easy',   'https://leetcode.com/problems/reverse-linked-list/'),
  ('in-place-linked-list-reversal', 'Reverse Linked List II',            'Medium', 'https://leetcode.com/problems/reverse-linked-list-ii/'),
  ('in-place-linked-list-reversal', 'Reverse Nodes in k-Group',          'Hard',   'https://leetcode.com/problems/reverse-nodes-in-k-group/'),
  ('in-place-linked-list-reversal', 'Swap Nodes in Pairs',               'Medium', 'https://leetcode.com/problems/swap-nodes-in-pairs/'),
  ('in-place-linked-list-reversal', 'Reorder List',                      'Medium', 'https://leetcode.com/problems/reorder-list/'),
  ('in-place-linked-list-reversal', 'Rotate List',                       'Medium', 'https://leetcode.com/problems/rotate-list/'),
  -- Tree BFS
  ('tree-bfs', 'Binary Tree Level Order Traversal',                      'Medium', 'https://leetcode.com/problems/binary-tree-level-order-traversal/'),
  ('tree-bfs', 'Binary Tree Level Order Traversal II',                   'Medium', 'https://leetcode.com/problems/binary-tree-level-order-traversal-ii/'),
  ('tree-bfs', 'Binary Tree Zigzag Level Order Traversal',               'Medium', 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/'),
  ('tree-bfs', 'Binary Tree Right Side View',                            'Medium', 'https://leetcode.com/problems/binary-tree-right-side-view/'),
  ('tree-bfs', 'Populating Next Right Pointers in Each Node',            'Medium', 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/'),
  ('tree-bfs', 'Minimum Depth of Binary Tree',                           'Easy',   'https://leetcode.com/problems/minimum-depth-of-binary-tree/'),
  -- Tree DFS
  ('tree-dfs', 'Maximum Depth of Binary Tree',                           'Easy',   'https://leetcode.com/problems/maximum-depth-of-binary-tree/'),
  ('tree-dfs', 'Path Sum',                                               'Easy',   'https://leetcode.com/problems/path-sum/'),
  ('tree-dfs', 'Path Sum II',                                            'Medium', 'https://leetcode.com/problems/path-sum-ii/'),
  ('tree-dfs', 'Path Sum III',                                           'Medium', 'https://leetcode.com/problems/path-sum-iii/'),
  ('tree-dfs', 'Binary Tree Maximum Path Sum',                           'Hard',   'https://leetcode.com/problems/binary-tree-maximum-path-sum/'),
  ('tree-dfs', 'Diameter of Binary Tree',                                'Easy',   'https://leetcode.com/problems/diameter-of-binary-tree/'),
  -- Two Heaps
  ('two-heaps', 'Find Median from Data Stream',                          'Hard',   'https://leetcode.com/problems/find-median-from-data-stream/'),
  ('two-heaps', 'Sliding Window Median',                                 'Hard',   'https://leetcode.com/problems/sliding-window-median/'),
  ('two-heaps', 'IPO',                                                   'Hard',   'https://leetcode.com/problems/ipo/'),
  ('two-heaps', 'Kth Largest Element in an Array',                       'Medium', 'https://leetcode.com/problems/kth-largest-element-in-an-array/'),
  ('two-heaps', 'Finding MK Average',                                    'Hard',   'https://leetcode.com/problems/finding-mk-average/'),
  ('two-heaps', 'Smallest Range Covering Elements from K Lists',         'Hard',   'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/'),
  -- Subsets / Combinations
  ('subsets', 'Subsets',                                                 'Medium', 'https://leetcode.com/problems/subsets/'),
  ('subsets', 'Subsets II',                                              'Medium', 'https://leetcode.com/problems/subsets-ii/'),
  ('subsets', 'Permutations',                                            'Medium', 'https://leetcode.com/problems/permutations/'),
  ('subsets', 'Permutations II',                                         'Medium', 'https://leetcode.com/problems/permutations-ii/'),
  ('subsets', 'Generate Parentheses',                                    'Medium', 'https://leetcode.com/problems/generate-parentheses/'),
  ('subsets', 'Letter Combinations of a Phone Number',                   'Medium', 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/'),
  -- Modified Binary Search
  ('modified-binary-search', 'Binary Search',                            'Easy',   'https://leetcode.com/problems/binary-search/'),
  ('modified-binary-search', 'Search in Rotated Sorted Array',           'Medium', 'https://leetcode.com/problems/search-in-rotated-sorted-array/'),
  ('modified-binary-search', 'Find First and Last Position in Sorted Array', 'Medium', 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/'),
  ('modified-binary-search', 'Find Minimum in Rotated Sorted Array',     'Medium', 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/'),
  ('modified-binary-search', 'Single Element in a Sorted Array',         'Medium', 'https://leetcode.com/problems/single-element-in-a-sorted-array/'),
  ('modified-binary-search', 'Median of Two Sorted Arrays',              'Hard',   'https://leetcode.com/problems/median-of-two-sorted-arrays/'),
  -- Bitwise XOR
  ('bitwise-xor', 'Single Number',                                       'Easy',   'https://leetcode.com/problems/single-number/'),
  ('bitwise-xor', 'Single Number II',                                    'Medium', 'https://leetcode.com/problems/single-number-ii/'),
  ('bitwise-xor', 'Single Number III',                                   'Medium', 'https://leetcode.com/problems/single-number-iii/'),
  ('bitwise-xor', 'Missing Number',                                      'Easy',   'https://leetcode.com/problems/missing-number/'),
  ('bitwise-xor', 'Number of 1 Bits',                                    'Easy',   'https://leetcode.com/problems/number-of-1-bits/'),
  ('bitwise-xor', 'Reverse Bits',                                        'Easy',   'https://leetcode.com/problems/reverse-bits/'),
  -- Top K Elements
  ('top-k-elements', 'Kth Largest Element in an Array',                  'Medium', 'https://leetcode.com/problems/kth-largest-element-in-an-array/'),
  ('top-k-elements', 'Top K Frequent Elements',                          'Medium', 'https://leetcode.com/problems/top-k-frequent-elements/'),
  ('top-k-elements', 'Top K Frequent Words',                             'Medium', 'https://leetcode.com/problems/top-k-frequent-words/'),
  ('top-k-elements', 'K Closest Points to Origin',                       'Medium', 'https://leetcode.com/problems/k-closest-points-to-origin/'),
  ('top-k-elements', 'Sort Characters By Frequency',                     'Medium', 'https://leetcode.com/problems/sort-characters-by-frequency/'),
  ('top-k-elements', 'Kth Largest Element in a Stream',                  'Easy',   'https://leetcode.com/problems/kth-largest-element-in-a-stream/'),
  -- K-way Merge
  ('k-way-merge', 'Merge k Sorted Lists',                                'Hard',   'https://leetcode.com/problems/merge-k-sorted-lists/'),
  ('k-way-merge', 'Merge Two Sorted Lists',                              'Easy',   'https://leetcode.com/problems/merge-two-sorted-lists/'),
  ('k-way-merge', 'Kth Smallest Element in a Sorted Matrix',             'Medium', 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/'),
  ('k-way-merge', 'Find K Pairs with Smallest Sums',                     'Medium', 'https://leetcode.com/problems/find-k-pairs-with-smallest-sums/'),
  ('k-way-merge', 'Smallest Range Covering Elements from K Lists',       'Hard',   'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/'),
  ('k-way-merge', 'Merge Sorted Array',                                  'Easy',   'https://leetcode.com/problems/merge-sorted-array/'),
  -- Topological Sort
  ('topological-sort', 'Course Schedule',                                'Medium', 'https://leetcode.com/problems/course-schedule/'),
  ('topological-sort', 'Course Schedule II',                             'Medium', 'https://leetcode.com/problems/course-schedule-ii/'),
  ('topological-sort', 'Alien Dictionary',                               'Hard',   'https://leetcode.com/problems/alien-dictionary/'),
  ('topological-sort', 'Minimum Height Trees',                           'Medium', 'https://leetcode.com/problems/minimum-height-trees/'),
  ('topological-sort', 'Sequence Reconstruction',                        'Medium', 'https://leetcode.com/problems/sequence-reconstruction/'),
  ('topological-sort', 'All Ancestors of a Node in a DAG',               'Medium', 'https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph/'),
  -- 0/1 Knapsack DP
  ('0-1-knapsack-dp', 'Partition Equal Subset Sum',                      'Medium', 'https://leetcode.com/problems/partition-equal-subset-sum/'),
  ('0-1-knapsack-dp', 'Target Sum',                                      'Medium', 'https://leetcode.com/problems/target-sum/'),
  ('0-1-knapsack-dp', 'Ones and Zeroes',                                 'Medium', 'https://leetcode.com/problems/ones-and-zeroes/'),
  ('0-1-knapsack-dp', 'Last Stone Weight II',                            'Medium', 'https://leetcode.com/problems/last-stone-weight-ii/'),
  ('0-1-knapsack-dp', 'Profitable Schemes',                              'Hard',   'https://leetcode.com/problems/profitable-schemes/'),
  ('0-1-knapsack-dp', 'Tallest Billboard',                               'Hard',   'https://leetcode.com/problems/tallest-billboard/'),
  -- Unbounded Knapsack DP
  ('unbounded-knapsack-dp', 'Coin Change',                               'Medium', 'https://leetcode.com/problems/coin-change/'),
  ('unbounded-knapsack-dp', 'Coin Change II',                            'Medium', 'https://leetcode.com/problems/coin-change-ii/'),
  ('unbounded-knapsack-dp', 'Combination Sum IV',                        'Medium', 'https://leetcode.com/problems/combination-sum-iv/'),
  ('unbounded-knapsack-dp', 'Perfect Squares',                           'Medium', 'https://leetcode.com/problems/perfect-squares/'),
  ('unbounded-knapsack-dp', 'Minimum Cost For Tickets',                  'Medium', 'https://leetcode.com/problems/minimum-cost-for-tickets/'),
  ('unbounded-knapsack-dp', 'Word Break',                                'Medium', 'https://leetcode.com/problems/word-break/'),
  -- Fibonacci DP
  ('fibonacci-dp', 'Climbing Stairs',                                    'Easy',   'https://leetcode.com/problems/climbing-stairs/'),
  ('fibonacci-dp', 'Fibonacci Number',                                   'Easy',   'https://leetcode.com/problems/fibonacci-number/'),
  ('fibonacci-dp', 'House Robber',                                       'Medium', 'https://leetcode.com/problems/house-robber/'),
  ('fibonacci-dp', 'House Robber II',                                    'Medium', 'https://leetcode.com/problems/house-robber-ii/'),
  ('fibonacci-dp', 'Min Cost Climbing Stairs',                           'Easy',   'https://leetcode.com/problems/min-cost-climbing-stairs/'),
  ('fibonacci-dp', 'Decode Ways',                                        'Medium', 'https://leetcode.com/problems/decode-ways/'),
  -- Palindromic Subsequence DP
  ('palindromic-subsequence-dp', 'Longest Palindromic Substring',        'Medium', 'https://leetcode.com/problems/longest-palindromic-substring/'),
  ('palindromic-subsequence-dp', 'Longest Palindromic Subsequence',      'Medium', 'https://leetcode.com/problems/longest-palindromic-subsequence/'),
  ('palindromic-subsequence-dp', 'Palindromic Substrings',               'Medium', 'https://leetcode.com/problems/palindromic-substrings/'),
  ('palindromic-subsequence-dp', 'Palindrome Partitioning',              'Medium', 'https://leetcode.com/problems/palindrome-partitioning/'),
  ('palindromic-subsequence-dp', 'Palindrome Partitioning II',           'Hard',   'https://leetcode.com/problems/palindrome-partitioning-ii/'),
  ('palindromic-subsequence-dp', 'Minimum Insertion Steps to Make a String Palindrome', 'Hard', 'https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/'),
  -- Longest Common Subsequence DP
  ('longest-common-subsequence-dp', 'Longest Common Subsequence',        'Medium', 'https://leetcode.com/problems/longest-common-subsequence/'),
  ('longest-common-subsequence-dp', 'Delete Operation for Two Strings',  'Medium', 'https://leetcode.com/problems/delete-operation-for-two-strings/'),
  ('longest-common-subsequence-dp', 'Minimum ASCII Delete Sum for Two Strings', 'Medium', 'https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/'),
  ('longest-common-subsequence-dp', 'Edit Distance',                     'Medium', 'https://leetcode.com/problems/edit-distance/'),
  ('longest-common-subsequence-dp', 'Maximum Length of Repeated Subarray','Medium', 'https://leetcode.com/problems/maximum-length-of-repeated-subarray/'),
  ('longest-common-subsequence-dp', 'Longest Increasing Subsequence',    'Medium', 'https://leetcode.com/problems/longest-increasing-subsequence/'),
  -- Monotonic Stack
  ('monotonic-stack', 'Next Greater Element I',                          'Easy',   'https://leetcode.com/problems/next-greater-element-i/'),
  ('monotonic-stack', 'Next Greater Element II',                         'Medium', 'https://leetcode.com/problems/next-greater-element-ii/'),
  ('monotonic-stack', 'Daily Temperatures',                              'Medium', 'https://leetcode.com/problems/daily-temperatures/'),
  ('monotonic-stack', 'Largest Rectangle in Histogram',                  'Hard',   'https://leetcode.com/problems/largest-rectangle-in-histogram/'),
  ('monotonic-stack', 'Trapping Rain Water',                             'Hard',   'https://leetcode.com/problems/trapping-rain-water/'),
  ('monotonic-stack', 'Online Stock Span',                               'Medium', 'https://leetcode.com/problems/online-stock-span/'),
  -- Prefix Sum
  ('prefix-sum', 'Range Sum Query - Immutable',                          'Easy',   'https://leetcode.com/problems/range-sum-query-immutable/'),
  ('prefix-sum', 'Range Sum Query 2D - Immutable',                       'Medium', 'https://leetcode.com/problems/range-sum-query-2d-immutable/'),
  ('prefix-sum', 'Subarray Sum Equals K',                                'Medium', 'https://leetcode.com/problems/subarray-sum-equals-k/'),
  ('prefix-sum', 'Subarray Sums Divisible by K',                         'Medium', 'https://leetcode.com/problems/subarray-sums-divisible-by-k/'),
  ('prefix-sum', 'Contiguous Array',                                     'Medium', 'https://leetcode.com/problems/contiguous-array/'),
  ('prefix-sum', 'Count Number of Nice Subarrays',                       'Medium', 'https://leetcode.com/problems/count-number-of-nice-subarrays/'),
  -- Trie
  ('trie', 'Implement Trie (Prefix Tree)',                               'Medium', 'https://leetcode.com/problems/implement-trie-prefix-tree/'),
  ('trie', 'Design Add and Search Words Data Structure',                 'Medium', 'https://leetcode.com/problems/design-add-and-search-words-data-structure/'),
  ('trie', 'Word Search II',                                             'Hard',   'https://leetcode.com/problems/word-search-ii/'),
  ('trie', 'Replace Words',                                              'Medium', 'https://leetcode.com/problems/replace-words/'),
  ('trie', 'Map Sum Pairs',                                              'Medium', 'https://leetcode.com/problems/map-sum-pairs/'),
  ('trie', 'Maximum XOR of Two Numbers in an Array',                     'Medium', 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/'),
  -- Union Find
  ('union-find', 'Number of Provinces',                                  'Medium', 'https://leetcode.com/problems/number-of-provinces/'),
  ('union-find', 'Number of Islands',                                    'Medium', 'https://leetcode.com/problems/number-of-islands/'),
  ('union-find', 'Redundant Connection',                                 'Medium', 'https://leetcode.com/problems/redundant-connection/'),
  ('union-find', 'Accounts Merge',                                       'Medium', 'https://leetcode.com/problems/accounts-merge/'),
  ('union-find', 'Number of Islands II',                                 'Hard',   'https://leetcode.com/problems/number-of-islands-ii/'),
  ('union-find', 'Largest Component Size by Common Factor',              'Hard',   'https://leetcode.com/problems/largest-component-size-by-common-factor/'),
  -- Greedy
  ('greedy', 'Jump Game',                                                'Medium', 'https://leetcode.com/problems/jump-game/'),
  ('greedy', 'Jump Game II',                                             'Medium', 'https://leetcode.com/problems/jump-game-ii/'),
  ('greedy', 'Gas Station',                                              'Medium', 'https://leetcode.com/problems/gas-station/'),
  ('greedy', 'Best Time to Buy and Sell Stock II',                       'Medium', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/'),
  ('greedy', 'Non-overlapping Intervals',                                'Medium', 'https://leetcode.com/problems/non-overlapping-intervals/'),
  ('greedy', 'Partition Labels',                                         'Medium', 'https://leetcode.com/problems/partition-labels/'),
  -- Backtracking
  ('backtracking', 'N-Queens',                                           'Hard',   'https://leetcode.com/problems/n-queens/'),
  ('backtracking', 'Sudoku Solver',                                      'Hard',   'https://leetcode.com/problems/sudoku-solver/'),
  ('backtracking', 'Word Search',                                        'Medium', 'https://leetcode.com/problems/word-search/'),
  ('backtracking', 'Combination Sum',                                    'Medium', 'https://leetcode.com/problems/combination-sum/'),
  ('backtracking', 'Combination Sum II',                                 'Medium', 'https://leetcode.com/problems/combination-sum-ii/'),
  ('backtracking', 'Palindrome Partitioning',                            'Medium', 'https://leetcode.com/problems/palindrome-partitioning/'),
  -- Matrix Traversal
  ('matrix-traversal', 'Number of Islands',                              'Medium', 'https://leetcode.com/problems/number-of-islands/'),
  ('matrix-traversal', 'Max Area of Island',                             'Medium', 'https://leetcode.com/problems/max-area-of-island/'),
  ('matrix-traversal', 'Surrounded Regions',                             'Medium', 'https://leetcode.com/problems/surrounded-regions/'),
  ('matrix-traversal', 'Set Matrix Zeroes',                              'Medium', 'https://leetcode.com/problems/set-matrix-zeroes/'),
  ('matrix-traversal', 'Rotate Image',                                   'Medium', 'https://leetcode.com/problems/rotate-image/'),
  ('matrix-traversal', 'Spiral Matrix',                                  'Medium', 'https://leetcode.com/problems/spiral-matrix/'),
  -- Graph BFS
  ('graph-bfs', 'Rotting Oranges',                                       'Medium', 'https://leetcode.com/problems/rotting-oranges/'),
  ('graph-bfs', 'Word Ladder',                                           'Hard',   'https://leetcode.com/problems/word-ladder/'),
  ('graph-bfs', '01 Matrix',                                             'Medium', 'https://leetcode.com/problems/01-matrix/'),
  ('graph-bfs', 'Walls and Gates',                                       'Medium', 'https://leetcode.com/problems/walls-and-gates/'),
  ('graph-bfs', 'Open the Lock',                                         'Medium', 'https://leetcode.com/problems/open-the-lock/'),
  ('graph-bfs', 'Shortest Path in Binary Matrix',                        'Medium', 'https://leetcode.com/problems/shortest-path-in-binary-matrix/'),
  -- Graph DFS
  ('graph-dfs', 'Clone Graph',                                           'Medium', 'https://leetcode.com/problems/clone-graph/'),
  ('graph-dfs', 'Pacific Atlantic Water Flow',                           'Medium', 'https://leetcode.com/problems/pacific-atlantic-water-flow/'),
  ('graph-dfs', 'Max Area of Island',                                    'Medium', 'https://leetcode.com/problems/max-area-of-island/'),
  ('graph-dfs', 'Reconstruct Itinerary',                                 'Hard',   'https://leetcode.com/problems/reconstruct-itinerary/'),
  ('graph-dfs', 'All Paths From Source to Target',                       'Medium', 'https://leetcode.com/problems/all-paths-from-source-to-target/'),
  ('graph-dfs', 'Find if Path Exists in Graph',                          'Easy',   'https://leetcode.com/problems/find-if-path-exists-in-graph/'),
  -- Hash Map / Frequency
  ('hash-map-frequency', 'Two Sum',                                      'Easy',   'https://leetcode.com/problems/two-sum/'),
  ('hash-map-frequency', 'Group Anagrams',                               'Medium', 'https://leetcode.com/problems/group-anagrams/'),
  ('hash-map-frequency', 'Valid Anagram',                                'Easy',   'https://leetcode.com/problems/valid-anagram/'),
  ('hash-map-frequency', 'First Unique Character in a String',           'Easy',   'https://leetcode.com/problems/first-unique-character-in-a-string/'),
  ('hash-map-frequency', 'Majority Element',                             'Easy',   'https://leetcode.com/problems/majority-element/'),
  ('hash-map-frequency', 'Contains Duplicate',                           'Easy',   'https://leetcode.com/problems/contains-duplicate/')
) AS np(pattern_slug, title, difficulty, url)
ON p.slug = np.pattern_slug
ON CONFLICT (pattern_id, title) DO NOTHING;

