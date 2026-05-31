-- V24__seed_comprehensive_code_examples.sql
-- Seeds 30 code examples across 10 DSA topics (easy, intermediate, advanced)
-- Uses INSERT ... ON CONFLICT DO NOTHING for idempotency.

INSERT INTO code_examples (
    topic_slug, difficulty_tier, language, title, code, explanation,
    time_complexity, space_complexity, tricks_json, pattern_name, is_published,
    created_at, updated_at
) VALUES 
-- ─── 1. Array Basics ─────────────────────────────────────────────
(
    'array-basics', 'intermediate', 'java', 'Two Sum',
$$class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}$$, 'Uses a Hash Map to find the target complement in a single pass.', 'O(n)', 'O(n)', '["Store elements as you iterate", "Check complement first to avoid self-pairing"]'::jsonb, 'Hash Map', TRUE, NOW(), NOW()
),
(
    'array-basics', 'advanced', 'java', 'Trapping Rain Water',
$$class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}$$, 'Uses the Two Pointers approach to calculate trapped water efficiently without extra space.', 'O(n)', 'O(1)', '["Maintain max heights from both ends", "Move the pointer with the smaller height"]'::jsonb, 'Two Pointers', TRUE, NOW(), NOW()
),

-- ─── 2. Linked List Singly ─────────────────────────────────────────────
(
    'linked-list-singly', 'easy', 'java', 'Reverse Linked List',
$$class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}$$, 'Reverses a singly linked list in-place using three pointers.', 'O(n)', 'O(1)', '["Keep track of the next node before overwriting curr.next", "Return prev as the new head"]'::jsonb, 'In-place Reversal', TRUE, NOW(), NOW()
),
(
    'linked-list-singly', 'intermediate', 'java', 'Linked List Cycle',
$$public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}$$, 'Floyd''s Cycle-Finding Algorithm using slow and fast pointers.', 'O(n)', 'O(1)', '["Fast pointer moves 2 steps, slow moves 1", "If they meet, there is a cycle"]'::jsonb, 'Fast & Slow Pointers', TRUE, NOW(), NOW()
),
(
    'linked-list-singly', 'advanced', 'java', 'Merge k Sorted Lists',
$$class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode node : lists) {
            if (node != null) pq.add(node);
        }
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        while (!pq.isEmpty()) {
            tail.next = pq.poll();
            tail = tail.next;
            if (tail.next != null) pq.add(tail.next);
        }
        return dummy.next;
    }
}$$, 'Uses a Min-Heap to continuously merge the smallest available nodes from k sorted lists.', 'O(N log k)', 'O(k)', '["Push the head of each list into a Min-Heap", "Pop the smallest, attach it, and push its next node"]'::jsonb, 'K-way Merge', TRUE, NOW(), NOW()
),

-- ─── 3. Stack ─────────────────────────────────────────────
(
    'stack', 'easy', 'java', 'Valid Parentheses',
$$class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}$$, 'Uses a Stack to keep track of expected closing brackets.', 'O(n)', 'O(n)', '["Push the expected closing bracket instead of the opening one for easier comparison"]'::jsonb, 'Stack', TRUE, NOW(), NOW()
),
(
    'stack', 'intermediate', 'java', 'Daily Temperatures',
$$class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int[] result = new int[temperatures.length];
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < temperatures.length; i++) {
            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
                int idx = stack.pop();
                result[idx] = i - idx;
            }
            stack.push(i);
        }
        return result;
    }
}$$, 'Monotonic decreasing stack to find the next greater element efficiently.', 'O(n)', 'O(n)', '["Store indices, not values", "Pop from stack when a warmer temperature is found"]'::jsonb, 'Monotonic Stack', TRUE, NOW(), NOW()
),
(
    'stack', 'advanced', 'java', 'Largest Rectangle in Histogram',
$$class Solution {
    public int largestRectangleArea(int[] heights) {
        int maxArea = 0;
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i <= heights.length; i++) {
            int h = (i == heights.length ? 0 : heights[i]);
            while (!stack.isEmpty() && h < heights[stack.peek()]) {
                int height = heights[stack.pop()];
                int width = stack.isEmpty() ? i : i - 1 - stack.peek();
                maxArea = Math.max(maxArea, height * width);
            }
            stack.push(i);
        }
        return maxArea;
    }
}$$, 'Uses a monotonic increasing stack to calculate max possible area.', 'O(n)', 'O(n)', '["Append a dummy 0 height at the end to flush the stack", "Width is calculated using the new top of stack"]'::jsonb, 'Monotonic Stack', TRUE, NOW(), NOW()
),

-- ─── 4. Queue ─────────────────────────────────────────────
(
    'queue', 'easy', 'java', 'Implement Queue using Stacks',
$$class MyQueue {
    Stack<Integer> input = new Stack<>();
    Stack<Integer> output = new Stack<>();

    public void push(int x) {
        input.push(x);
    }

    public int pop() {
        peek();
        return output.pop();
    }

    public int peek() {
        if (output.isEmpty()) {
            while (!input.isEmpty()) output.push(input.pop());
        }
        return output.peek();
    }

    public boolean empty() {
        return input.isEmpty() && output.isEmpty();
    }
}$$, 'Simulates a Queue using two Stacks. Amortized O(1) operations.', 'O(1)', 'O(n)', '["Only transfer elements from input to output when output is empty"]'::jsonb, 'Stack to Queue', TRUE, NOW(), NOW()
),
(
    'queue', 'advanced', 'java', 'Sliding Window Maximum',
$$class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            if (!dq.isEmpty() && dq.peek() < i - k + 1) dq.poll();
            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();
            dq.offer(i);
            if (i >= k - 1) result[i - k + 1] = nums[dq.peek()];
        }
        return result;
    }
}$$, 'Uses a Deque to maintain a monotonically decreasing sequence of indices.', 'O(n)', 'O(k)', '["Remove elements out of window bounds", "Remove smaller elements from the back of deque"]'::jsonb, 'Monotonic Queue', TRUE, NOW(), NOW()
),

-- ─── 5. Hash Table ─────────────────────────────────────────────
(
    'hash-table', 'easy', 'java', 'Contains Duplicate',
$$class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int n : nums) {
            if (!set.add(n)) return true;
        }
        return false;
    }
}$$, 'Using a HashSet to detect duplicates in O(1) lookup time.', 'O(n)', 'O(n)', '["Set.add() returns false if the element already exists"]'::jsonb, 'Hash Set', TRUE, NOW(), NOW()
),
(
    'hash-table', 'intermediate', 'java', 'Group Anagrams',
$$class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] ca = s.toCharArray();
            Arrays.sort(ca);
            String key = String.valueOf(ca);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}$$, 'Groups anagrams by sorting the characters to form a unified key.', 'O(N * K log K)', 'O(N * K)', '["Sorted strings serve as canonical keys"]'::jsonb, 'Hash Map String Key', TRUE, NOW(), NOW()
),

-- ─── 6. Binary Search Tree ─────────────────────────────────────────────
(
    'binary-search-tree', 'easy', 'java', 'Search in a BST',
$$class Solution {
    public TreeNode searchBST(TreeNode root, int val) {
        while (root != null && root.val != val) {
            root = val < root.val ? root.left : root.right;
        }
        return root;
    }
}$$, 'Leverages BST properties to search efficiently without recursion.', 'O(log n)', 'O(1)', '["If val < root.left, go left, else go right"]'::jsonb, 'BST Traversal', TRUE, NOW(), NOW()
),
(
    'binary-search-tree', 'intermediate', 'java', 'Validate BST',
$$class Solution {
    public boolean isValidBST(TreeNode root) {
        return validate(root, null, null);
    }
    private boolean validate(TreeNode node, Integer low, Integer high) {
        if (node == null) return true;
        if ((low != null && node.val <= low) || (high != null && node.val >= high)) return false;
        return validate(node.left, low, node.val) && validate(node.right, node.val, high);
    }
}$$, 'Top-down recursive approach maintaining valid low and high ranges.', 'O(n)', 'O(h)', '["Pass updated bounds to left and right children"]'::jsonb, 'DFS Tree Bounds', TRUE, NOW(), NOW()
),

-- ─── 7. Heap ─────────────────────────────────────────────
(
    'heap', 'easy', 'java', 'Kth Largest Element in a Stream',
$$class KthLargest {
    private PriorityQueue<Integer> pq;
    private int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        pq = new PriorityQueue<>();
        for (int n : nums) add(n);
    }
    
    public int add(int val) {
        pq.offer(val);
        if (pq.size() > k) pq.poll();
        return pq.peek();
    }
}$$, 'Maintains a min-heap of size K. The root is always the Kth largest element.', 'O(N log K)', 'O(K)', '["Min-heap size K keeps the largest elements", "Root is the smallest of the K largest"]'::jsonb, 'Top K Heap', TRUE, NOW(), NOW()
),
(
    'heap', 'advanced', 'java', 'Find Median from Data Stream',
$$class MedianFinder {
    PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder());
    PriorityQueue<Integer> large = new PriorityQueue<>();

    public void addNum(int num) {
        small.offer(num);
        large.offer(small.poll());
        if (small.size() < large.size()) {
            small.offer(large.poll());
        }
    }

    public double findMedian() {
        if (small.size() > large.size()) return small.peek();
        return (small.peek() + large.peek()) / 2.0;
    }
}$$, 'Uses two heaps (Max-Heap and Min-Heap) to dynamically balance elements.', 'O(log n)', 'O(n)', '["Max-heap stores lower half, Min-heap stores upper half"]'::jsonb, 'Two Heaps', TRUE, NOW(), NOW()
),

-- ─── 8. Graph Algorithms ─────────────────────────────────────────────
(
    'graph-algorithms', 'easy', 'java', 'Find Center of Star Graph',
$$class Solution {
    public int findCenter(int[][] edges) {
        int[] first = edges[0];
        int[] second = edges[1];
        if (first[0] == second[0] || first[0] == second[1]) return first[0];
        return first[1];
    }
}$$, 'A star graph center must appear in every edge, so just compare the first two edges.', 'O(1)', 'O(1)', '["Look for the common node in just the first two edges"]'::jsonb, 'Graph Basics', TRUE, NOW(), NOW()
),
(
    'graph-algorithms', 'intermediate', 'java', 'Number of Islands',
$$class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[i].length; j++) {
                if (grid[i][j] == '1') {
                    dfs(grid, i, j);
                    count++;
                }
            }
        }
        return count;
    }
    private void dfs(char[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] == '0') return;
        grid[i][j] = '0';
        dfs(grid, i+1, j); dfs(grid, i-1, j); dfs(grid, i, j+1); dfs(grid, i, j-1);
    }
}$$, 'Iterates through the grid and uses DFS to sink connected land components.', 'O(m*n)', 'O(m*n)', '["Modify the grid in-place to save visited state"]'::jsonb, 'Matrix DFS', TRUE, NOW(), NOW()
),

-- ─── 9. Dynamic Programming ─────────────────────────────────────────────
(
    'dynamic-programming', 'easy', 'java', 'Climbing Stairs',
$$class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
}$$, 'Classic Fibonacci sequence DP optimized to O(1) space.', 'O(n)', 'O(1)', '["Only the last two steps matter for the current step"]'::jsonb, '1D DP', TRUE, NOW(), NOW()
),
(
    'dynamic-programming', 'intermediate', 'java', 'Coin Change',
$$class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (a - c >= 0) {
                    dp[a] = Math.min(dp[a], 1 + dp[a - c]);
                }
            }
        }
        return dp[amount] != amount + 1 ? dp[amount] : -1;
    }
}$$, 'Bottom-up dynamic programming computing minimum coins for every amount up to target.', 'O(amount * coins.length)', 'O(amount)', '["Initialize DP array with amount + 1 (infinity equivalent)"]'::jsonb, 'Knapsack DP', TRUE, NOW(), NOW()
),

-- ─── 10. Sorting Algorithms ─────────────────────────────────────────────
(
    'sorting-algorithms', 'easy', 'java', 'Bubble Sort',
$$class Solution {
    public void bubbleSort(int[] arr) {
        int n = arr.length;
        boolean swapped;
        for (int i = 0; i < n - 1; i++) {
            swapped = false;
            for (int j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}$$, 'Simple swapping algorithm that pushes the largest element to the end.', 'O(n^2)', 'O(1)', '["Use a swapped flag to break early if already sorted"]'::jsonb, 'In-place Sort', TRUE, NOW(), NOW()
),
(
    'sorting-algorithms', 'intermediate', 'java', 'Merge Sort',
$$class Solution {
    public void mergeSort(int[] arr, int l, int r) {
        if (l < r) {
            int m = l + (r - l) / 2;
            mergeSort(arr, l, m);
            mergeSort(arr, m + 1, r);
            merge(arr, l, m, r);
        }
    }
    private void merge(int[] arr, int l, int m, int r) {
        int[] L = Arrays.copyOfRange(arr, l, m + 1);
        int[] R = Arrays.copyOfRange(arr, m + 1, r + 1);
        int i = 0, j = 0, k = l;
        while (i < L.length && j < R.length) {
            if (L[i] <= R[j]) arr[k++] = L[i++];
            else arr[k++] = R[j++];
        }
        while (i < L.length) arr[k++] = L[i++];
        while (j < R.length) arr[k++] = R[j++];
    }
}$$, 'Divide and conquer algorithm that splits arrays and merges them in sorted order.', 'O(N log N)', 'O(N)', '["Uses extra space for the temporary left and right arrays"]'::jsonb, 'Divide and Conquer', TRUE, NOW(), NOW()
)
ON CONFLICT (topic_slug, difficulty_tier, language) DO NOTHING;
