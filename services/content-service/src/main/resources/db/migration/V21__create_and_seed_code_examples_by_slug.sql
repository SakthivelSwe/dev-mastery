-- V21__create_and_seed_code_examples_by_slug.sql
-- Extends the code_examples table with slug-based lookup columns for the
-- new tier-aware Code Lab feature. Adds topicSlug, difficultyTier, language,
-- tricksJson, patternName, and isPublished columns without breaking existing
-- FK-based rows. Seeds 5 easy-tier Java examples.

-- ─── Part 1: Extend table with new columns ──────────────────────────────────

ALTER TABLE code_examples
    ADD COLUMN IF NOT EXISTS topic_slug      VARCHAR(100),
    ADD COLUMN IF NOT EXISTS difficulty_tier VARCHAR(20)  CHECK (difficulty_tier IN ('easy', 'intermediate', 'expert', 'advanced')),
    ADD COLUMN IF NOT EXISTS tricks_json     JSONB        DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS pattern_name    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_published    BOOLEAN      DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ  DEFAULT NOW();

-- Drop NOT NULL constraints on legacy FK columns so we can insert slug-based examples
ALTER TABLE code_examples
    ALTER COLUMN topic_id DROP NOT NULL,
    ALTER COLUMN lesson_id DROP NOT NULL,
    ALTER COLUMN level DROP NOT NULL;

-- Language column already existed but was free text; add enum constraint if not present
ALTER TABLE code_examples
    ALTER COLUMN language SET DEFAULT 'java';

-- Unique constraint: one entry per (slug, tier, language) — prevents duplicate seeds
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_code_example_slug_tier_lang'
    ) THEN
        ALTER TABLE code_examples
            ADD CONSTRAINT uq_code_example_slug_tier_lang
            UNIQUE (topic_slug, difficulty_tier, language);
    END IF;
END
$$;

-- Index for slug-based lookups (primary Code Lab query path)
CREATE INDEX IF NOT EXISTS idx_code_examples_topic_slug    ON code_examples(topic_slug);
CREATE INDEX IF NOT EXISTS idx_code_examples_slug_tier     ON code_examples(topic_slug, difficulty_tier);
CREATE INDEX IF NOT EXISTS idx_code_examples_slug_tier_lang ON code_examples(topic_slug, difficulty_tier, language);

-- ─── Part 2: Seed data — 5 easy-tier Java examples ──────────────────────────
-- Uses INSERT ... ON CONFLICT DO NOTHING so the migration is idempotent.

-- 1. array-basics ─────────────────────────────────────────────────────────────
INSERT INTO code_examples (
    topic_slug, difficulty_tier, language, title, code, explanation,
    time_complexity, space_complexity, tricks_json, pattern_name, is_published,
    created_at, updated_at
) VALUES (
    'array-basics', 'easy', 'java',
    'Array Basics: Find Max and Min in One Pass',
$$public class ArrayBasics {
    public static void main(String[] args) {
        // Step 1: Declare and initialize an array of integers
        int[] numbers = {34, 7, 89, 12, 45, 23, 67, 15};

        // Step 2: Assume the first element is both max and min
        int max = numbers[0]; // start max at first element
        int min = numbers[0]; // start min at first element

        // Step 3: Iterate from index 1 (we already "saw" index 0)
        for (int i = 1; i < numbers.length; i++) {
            // If current element is bigger, update max
            if (numbers[i] > max) {
                max = numbers[i];
            }
            // If current element is smaller, update min
            if (numbers[i] < min) {
                min = numbers[i];
            }
        }

        // Step 4: Print results
        System.out.println("Array length: " + numbers.length); // 8
        System.out.println("Maximum: " + max);                 // 89
        System.out.println("Minimum: " + min);                 // 7
    }
}$$,
    'Demonstrates how to declare and traverse an array in Java, finding the maximum and minimum in a single O(n) pass. This is the foundation for nearly every array algorithm.',
    'O(n)', 'O(1)',
    '["Start max/min at index 0, NOT at 0 or Integer.MAX_VALUE — avoids edge case when all numbers are negative",
      "One pass for BOTH max and min: two comparisons per iteration, not two separate loops",
      "Mnemonic: imagine walking down a row of lockers and updating a running scoreboard"]'::jsonb,
    'Linear Scan', TRUE, NOW(), NOW()
) ON CONFLICT (topic_slug, difficulty_tier, language) DO NOTHING;

-- 2. linked-list-singly ───────────────────────────────────────────────────────
INSERT INTO code_examples (
    topic_slug, difficulty_tier, language, title, code, explanation,
    time_complexity, space_complexity, tricks_json, pattern_name, is_published,
    created_at, updated_at
) VALUES (
    'linked-list-singly', 'easy', 'java',
    'Singly Linked List: Node + addFirst + printAll',
$$public class SinglyLinkedList {

    // Each node holds a value and a pointer to the next node
    static class Node {
        int value;   // the data stored in this node
        Node next;   // reference to the next node (null if last)

        Node(int value) {
            this.value = value;
            this.next = null; // new nodes start disconnected
        }
    }

    Node head; // the first node in the list (null if list is empty)

    // Add a new node at the BEGINNING of the list — O(1)
    public void addFirst(int value) {
        Node newNode = new Node(value); // 1. create the new node
        newNode.next = head;            // 2. point it at current head
        head = newNode;                 // 3. make it the new head
    }

    // Add a new node at the END of the list — O(n)
    public void addLast(int value) {
        Node newNode = new Node(value);
        if (head == null) {        // empty list: new node becomes head
            head = newNode;
            return;
        }
        Node current = head;
        while (current.next != null) { // walk to the last node
            current = current.next;
        }
        current.next = newNode;    // link last node to new node
    }

    // Print all values from head to tail
    public void printAll() {
        Node current = head;
        while (current != null) {
            System.out.print(current.value + " → ");
            current = current.next; // advance pointer
        }
        System.out.println("null");
    }

    public static void main(String[] args) {
        SinglyLinkedList list = new SinglyLinkedList();
        list.addLast(1);  // list: 1 → null
        list.addLast(2);  // list: 1 → 2 → null
        list.addLast(3);  // list: 1 → 2 → 3 → null
        list.addLast(4);  // list: 1 → 2 → 3 → 4 → null
        list.printAll();  // Output: 1 → 2 → 3 → 4 → null
        list.addFirst(0); // list: 0 → 1 → 2 → 3 → 4 → null
        list.printAll();  // Output: 0 → 1 → 2 → 3 → 4 → null
    }
}$$,
    'Shows the fundamental building block of a linked list: the Node class with a value and a next pointer. Demonstrates addFirst (O(1)) and addLast (O(n)) to show how the list is built by manipulating references.',
    'O(n) for addLast/printAll', 'O(1) extra space',
    '["Think of nodes as train cars: each one hooks onto the next, with the engine (head) at the front",
      "addFirst is O(1) because you only change head; addLast is O(n) because you must walk to the end",
      "Always check if head == null before traversing — the most common null pointer crash"]'::jsonb,
    'Linked List Traversal', TRUE, NOW(), NOW()
) ON CONFLICT (topic_slug, difficulty_tier, language) DO NOTHING;

-- 3. stack ────────────────────────────────────────────────────────────────────
INSERT INTO code_examples (
    topic_slug, difficulty_tier, language, title, code, explanation,
    time_complexity, space_complexity, tricks_json, pattern_name, is_published,
    created_at, updated_at
) VALUES (
    'stack', 'easy', 'java',
    'Stack: Array-Based Implementation',
$$public class ArrayStack {

    private int[] data;  // internal storage array
    private int top;     // index of the top element (-1 = empty)
    private int capacity;

    // Constructor — create a stack with a fixed max size
    public ArrayStack(int capacity) {
        this.capacity = capacity;
        this.data = new int[capacity]; // allocate the backing array
        this.top = -1;                 // -1 means the stack is empty
    }

    // Push: add element on top — O(1)
    public void push(int value) {
        if (top == capacity - 1) { // check for overflow
            throw new RuntimeException("Stack overflow! Max size: " + capacity);
        }
        data[++top] = value; // increment top first, then assign
    }

    // Pop: remove and return top element — O(1)
    public int pop() {
        if (isEmpty()) {
            throw new RuntimeException("Stack underflow! Cannot pop from empty stack.");
        }
        return data[top--]; // return current top, then decrement
    }

    // Peek: see top element without removing it — O(1)
    public int peek() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty — nothing to peek!");
        }
        return data[top]; // just read, don't change top
    }

    // isEmpty: check if the stack has no elements — O(1)
    public boolean isEmpty() {
        return top == -1; // top = -1 means nothing was pushed
    }

    // size: how many elements are currently in the stack — O(1)
    public int size() {
        return top + 1; // top is 0-indexed, so size = top + 1
    }

    public static void main(String[] args) {
        ArrayStack stack = new ArrayStack(5);
        stack.push(10); // [10]
        stack.push(20); // [10, 20]
        stack.push(30); // [10, 20, 30]

        System.out.println("Peek: " + stack.peek()); // 30
        System.out.println("Pop:  " + stack.pop());  // 30
        System.out.println("Size: " + stack.size()); // 2
        System.out.println("Empty? " + stack.isEmpty()); // false
    }
}$$,
    'Implements a stack using a fixed-size int[] array with a top pointer. All core operations (push, pop, peek, isEmpty) are O(1), demonstrating why the stack is the gold standard for LIFO access patterns.',
    'O(1) all operations', 'O(n) for storage',
    '["LIFO = Last In, First Out: think of a stack of plates — you add to the top, take from the top",
      "top = -1 for empty is the standard trick: size() = top + 1, no need for a separate counter",
      "Common mistake: forgetting to check isEmpty() before pop/peek — always leads to a crash in interviews"]'::jsonb,
    'Stack LIFO', TRUE, NOW(), NOW()
) ON CONFLICT (topic_slug, difficulty_tier, language) DO NOTHING;

-- 4. queue ────────────────────────────────────────────────────────────────────
INSERT INTO code_examples (
    topic_slug, difficulty_tier, language, title, code, explanation,
    time_complexity, space_complexity, tricks_json, pattern_name, is_published,
    created_at, updated_at
) VALUES (
    'queue', 'easy', 'java',
    'Queue: Circular Array Implementation',
$$public class CircularQueue {

    private int[] data;  // backing array for queue elements
    private int head;    // index of the front element (dequeue from here)
    private int tail;    // index where next element will be inserted
    private int size;    // current number of elements in the queue
    private int capacity;

    public CircularQueue(int capacity) {
        this.capacity = capacity;
        this.data = new int[capacity];
        this.head = 0;  // front pointer starts at 0
        this.tail = 0;  // rear pointer starts at 0
        this.size = 0;
    }

    // Enqueue: add element at the rear — O(1)
    public void enqueue(int value) {
        if (isFull()) {
            throw new RuntimeException("Queue is full! Capacity: " + capacity);
        }
        data[tail] = value;                // store value at tail position
        tail = (tail + 1) % capacity;     // wrap tail around using modulo (circular!)
        size++;
    }

    // Dequeue: remove and return front element — O(1)
    public int dequeue() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty! Nothing to dequeue.");
        }
        int value = data[head];            // save the front value
        head = (head + 1) % capacity;     // advance head, wrapping around
        size--;
        return value;
    }

    // Peek at the front element without removing it — O(1)
    public int front() {
        if (isEmpty()) throw new RuntimeException("Queue is empty!");
        return data[head];
    }

    public boolean isEmpty() { return size == 0; }
    public boolean isFull()  { return size == capacity; }
    public int size()        { return size; }

    public static void main(String[] args) {
        CircularQueue queue = new CircularQueue(4);
        queue.enqueue(10); // [10, _, _, _]
        queue.enqueue(20); // [10, 20, _, _]
        queue.enqueue(30); // [10, 20, 30, _]

        System.out.println("Front: " + queue.front());    // 10
        System.out.println("Dequeue: " + queue.dequeue()); // 10
        queue.enqueue(40);  // wraps around: [_, 20, 30, 40]
        System.out.println("Size: " + queue.size()); // 3
    }
}$$,
    'Implements a FIFO queue using a circular array. The (index + 1) % capacity trick lets head and tail wrap around the array end without shifting elements, giving O(1) enqueue and dequeue.',
    'O(1) all operations', 'O(n) for storage',
    '["Circular = modulo magic: (index + 1) % capacity wraps 3→0 at the end — no shifting needed",
      "Track size separately: if you only use head/tail you cannot tell full from empty (both look the same)",
      "FIFO = First In, First Out: think of a printer queue or a checkout line"]'::jsonb,
    'Queue FIFO', TRUE, NOW(), NOW()
) ON CONFLICT (topic_slug, difficulty_tier, language) DO NOTHING;

-- 5. binary-search ────────────────────────────────────────────────────────────
INSERT INTO code_examples (
    topic_slug, difficulty_tier, language, title, code, explanation,
    time_complexity, space_complexity, tricks_json, pattern_name, is_published,
    created_at, updated_at
) VALUES (
    'binary-search', 'easy', 'java',
    'Binary Search: Iterative Implementation',
$$public class BinarySearch {

    // Binary search works ONLY on sorted arrays
    // Returns the index of target, or -1 if not found
    public static int binarySearch(int[] sortedArr, int target) {
        int left  = 0;                     // start of search range
        int right = sortedArr.length - 1;  // end of search range

        while (left <= right) {            // loop until range collapses
            // Calculate mid safely — avoids integer overflow
            // Bad:  int mid = (left + right) / 2;  // overflows if both are large
            // Good: int mid = left + (right - left) / 2;
            int mid = left + (right - left) / 2;

            if (sortedArr[mid] == target) {
                return mid;               // FOUND! return the index

            } else if (sortedArr[mid] < target) {
                // Target is in the RIGHT half — discard left half
                left = mid + 1;

            } else {
                // Target is in the LEFT half — discard right half
                right = mid - 1;
            }
        }

        return -1; // target was not found in the array
    }

    public static void main(String[] args) {
        int[] sorted = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};

        System.out.println(binarySearch(sorted, 23));  // Output: 5
        System.out.println(binarySearch(sorted, 56));  // Output: 7
        System.out.println(binarySearch(sorted, 99));  // Output: -1 (not found)

        // Binary search eliminates HALF the remaining elements each step:
        // 10 elements → max 4 comparisons (log₂(10) ≈ 3.3, rounded up)
    }
}$$,
    'Iterative binary search on a sorted array. Each iteration halves the search space, giving O(log n) time. Uses the safe mid-point formula to avoid integer overflow — a common interview trap.',
    'O(log n)', 'O(1)',
    '["Requires sorted array — if not sorted, sort first: O(n log n) sort + O(log n) search",
      "Safe mid formula: left + (right - left) / 2, not (left + right) / 2, which can overflow when both are large ints",
      "left <= right (not <): the = catches the case where only one element remains"]'::jsonb,
    'Divide and Conquer', TRUE, NOW(), NOW()
) ON CONFLICT (topic_slug, difficulty_tier, language) DO NOTHING;
