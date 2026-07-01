/**
 * dsa-content.js
 * High-quality FEYNMAN, BUILD, SPACED REVIEW for all 49 DSA topics.
 * Used by: node scripts/writeSections.js dsa
 */
module.exports = {

  'array-basics': {
    feynman: `## FEYNMAN CHECK

### Explain Arrays Like I'm 10 Years Old
> An array is a row of numbered lockers, all the same size, sitting side by side in one stretch of wall. Because every locker is identical width and they touch, you can jump straight to locker #500 by computing base + 500×size — no walking past the first 499. That single multiply is why arrays read in O(1). But the lockers are bolted to the wall: to insert a new one in the middle, you must shift everyone right. This is why deleting from the front of a million-item array is slow while reading any element is instant.

---

### 5 Deep Conceptual Questions

**Q1: Why is array random access O(1) while a linked list is O(n)?**
> **A:** Arrays store elements in one contiguous memory block, so element i lives at base_address + i × element_size — a single arithmetic step the CPU resolves instantly. A linked list scatters nodes across the heap connected by pointers, so reaching index i means following i links, each a cache-missing pointer dereference. The contiguity also lets arrays exploit CPU cache lines (64 bytes prefetched together), making sequential array scans 5-10× faster than the math alone predicts.

**Q2: What is the ONE mental model for arrays?**
> **A:** "A fixed-size ruler of equal slots with O(1) index math but O(n) structural edits." Reads/writes by index are free; inserting or deleting anywhere but the end forces a shift of every later element. This split predicts every trade-off you'll meet.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Thinking insertion is cheap.
> \`\`\`java
> // ❌ O(n²) — shifts all later elements every time
> for (int i = 0; i < n; i++) list.add(0, i);
> // ✅ O(n) — append then reverse, or use ArrayDeque
> for (int i = 0; i < n; i++) list.add(i);
> Collections.reverse(list);
> \`\`\`

**Q4: How does an array interact with the CPU cache at runtime?**
> **A:** When you touch arr[0], the CPU pulls a whole 64-byte cache line, so arr[1..15] (4-byte ints) are already loaded. Sequential iteration rides this prefetch; random jumps thrash it. This is why row-major traversal beats column-major.

**Q5: One-sentence senior definition.**
> **A:** "An array is a contiguous, fixed-stride memory region giving O(1) indexed access via pointer arithmetic and O(n) structural mutation — which is why it is the cache-friendliest structure but the worst for frequent middle inserts."`,

    build: `## BUILD

### 🏗️ Mini Project: Dynamic Array (ArrayList) From Scratch
**What you will build:** A resizable array with amortized O(1) append.
**Why this project:** Forces you to understand capacity doubling and the O(1) amortized proof.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir dyn-array && cd dyn-array
touch DynamicArray.java
\`\`\`

#### Step 2 — Core Implementation
\`\`\`java
class DynamicArray {
  private int[] data = new int[2];
  private int size = 0;
  void add(int v) {
    if (size == data.length) resize(data.length * 2); // double on full
    data[size++] = v;
  }
  int get(int i) { check(i); return data[i]; }
  private void resize(int cap) { data = java.util.Arrays.copyOf(data, cap); }
  private void check(int i){ if(i<0||i>=size) throw new IndexOutOfBoundsException(); }
  int size(){ return size; }
}
\`\`\`

#### Step 4 — Error Handling
\`\`\`java
int get(int i){ if(i<0||i>=size) throw new IndexOutOfBoundsException("idx "+i); return data[i]; }
\`\`\`

#### Step 5 — Tests
\`\`\`java
DynamicArray a=new DynamicArray();
for(int i=0;i<10;i++) a.add(i);   // triggers resizes 2→4→8→16
assert a.get(9)==9; assert a.size()==10;
\`\`\`

**Expected Output:**
\`\`\`
size=10 cap=16
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Define an array including indexing math and edit cost. From memory.
**Q2:** Why does middle insertion cost O(n)? What breaks at scale?
**Q3:** Write 10 lines summing an int array.

### Day 3 — Comprehension
**Q4:** Array vs ArrayList — when does resize hurt latency?
**Q5:** Show the O(n²) bug from prepending in a loop and fix it.
**Q6:** Refactor a column-major 2D loop into row-major and explain the speedup.

### Day 7 — Application
**Q7:** Implement amortized O(1) append; handle empty array start.
**Q8:** A PR doubles array on every add-by-1 inside a tight loop — diagnose the GC pressure.
**Q9:** Cost of delete-at-front vs delete-at-end; how to fix front deletes.

### Day 14 — Synthesis
**Q10:** ★ "Why is HashMap backed by an array?" Full answer.
**Q11:** Map array → ArrayList → HashMap → matrix dependencies.
**Q12:** ★ Design a ring buffer for 10M events/sec — what breaks first?`
  },

  'array-operations': {
    feynman: `## FEYNMAN CHECK

### Explain Array Operations Like I'm 10 Years Old
> Working on an array is like rearranging books on a shelf that's exactly book-width. Reading any book is instant. But "insert in the middle" means physically sliding every book right; "remove from front" slides every book left. The trick experts use: do edits at the END (cheap), or batch them so you shift once. This is why deleting 1000 items one-by-one from the front is a million moves, but reversing then popping is just a thousand.

---

### 5 Deep Conceptual Questions

**Q1: Why is end-append the only cheap structural op?**
> **A:** Append writes to the first free slot with no shifting — O(1) amortized. Every other position requires moving the tail to keep contiguity, costing O(n). Knowing this turns many O(n²) solutions into O(n) by working from the back.

**Q2: The ONE mental model?**
> **A:** "Edits cost = number of elements that must move." Front edit moves all n; middle moves n/2; end moves zero. Optimize by relocating work to the end.

**Q3: Misconception with code.**
> **A:** Removing while iterating forward shifts indices.
> \`\`\`java
> // ❌ skips elements after a removal
> for(int i=0;i<n;i++) if(bad(a[i])) remove(i);
> // ✅ iterate backward
> for(int i=n-1;i>=0;i--) if(bad(a[i])) remove(i);
> \`\`\`

**Q4: How does in-place rotation work at memory level?**
> **A:** Reverse-reverse-reverse: reverse [0,k), reverse [k,n), reverse all — three linear passes, O(1) space, swapping by index using contiguity.

**Q5: Senior one-liner.**
> **A:** "Array ops trade O(1) random access against O(n) shifts, so efficient algorithms push mutation to the tail or use two-pointer in-place rewrites."`,

    build: `## BUILD

### 🏗️ Mini Project: In-Place Array Toolkit
**What you will build:** rotate, reverse-range, remove-evens in O(1) space.
**Why this project:** Cements two-pointer + reversal tricks.
**Time estimate:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir arr-ops && cd arr-ops && touch Ops.java
\`\`\`

#### Step 2 — Core
\`\`\`java
static void reverse(int[]a,int l,int r){while(l<r){int t=a[l];a[l++]=a[r];a[r--]=t;}}
static void rotate(int[]a,int k){k%=a.length;reverse(a,0,a.length-1);reverse(a,0,k-1);reverse(a,k,a.length-1);}
\`\`\`

#### Step 4 — Error Handling
\`\`\`java
if(a==null||a.length==0) return; k=((k%a.length)+a.length)%a.length; // negative-safe
\`\`\`

#### Step 5 — Tests
\`\`\`java
int[]a={1,2,3,4,5}; rotate(a,2); assert a[0]==4; // {4,5,1,2,3}
\`\`\`

**Expected Output:**
\`\`\`
[4,5,1,2,3]
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Cost of front/middle/end edits in one sentence each.
**Q2:** Two-pointer write index — why it gives O(1) space removals.
**Q3:** 10-line reverse in place.

### Day 3 — Comprehension
**Q4:** Forward vs backward removal — which is safe and why.
**Q5:** Buggy remove-while-iterate; fix.
**Q6:** Refactor copy-to-new-array dedup into in-place.

### Day 7 — Application
**Q7:** Rotate by k in O(1) space; handle k>n.
**Q8:** PR uses list.remove(0) in loop — failure at 1M items.
**Q9:** Complexity of rotate; degrade case.

### Day 14 — Synthesis
**Q10:** ★ "Move zeros to end, keep order." Full answer.
**Q11:** Link to two-pointers, sliding-window, prefix-sum.
**Q12:** ★ Dedup a 100M-row stream in fixed memory.`
  },

  'string-basics': {
    feynman: `## FEYNMAN CHECK

### Explain Strings Like I'm 10 Years Old
> A string is an array of characters wearing a "do not edit" sign. Every time you "change" it you really build a brand-new array and throw the old one away. Glue 1000 strings with + and you've created 1000 throwaway arrays — that's why your loop is slow. A StringBuilder is a scratch pad you keep writing on until the end, then print once. This is why chat apps building HTML in loops use builders, not +.

---

### 5 Deep Conceptual Questions

**Q1: Why are strings immutable and what does it buy?**
> **A:** Immutability lets strings be safely shared, cached, and used as hash keys whose hashCode is computed once. The cost: every edit allocates a new char array; concatenation in a loop is O(n²) total. That's why builders exist.

**Q2: ONE mental model?**
> **A:** "A string is a frozen char[]; mutation = realloc." Reads O(1), edits allocate.

**Q3: Misconception with code.**
> **A:** \`\`\`java
> // ❌ O(n²)
> String s=""; for(var w:words) s+=w;
> // ✅ O(n)
> var sb=new StringBuilder(); for(var w:words) sb.append(w);
> \`\`\`

**Q4: Interplay with the string pool?**
> **A:** Literals are interned in a pool; equal literals share one object so == works, but new String() bypasses the pool. Always compare with equals().

**Q5: Senior one-liner.**
> **A:** "A string is an immutable, pooled char sequence with O(1) read and allocating writes — which is why bulk building uses StringBuilder to avoid O(n²)."`,

    build: `## BUILD

### 🏗️ Mini Project: Anagram + Palindrome Checker
**What you will build:** O(n) anagram and palindrome tools.
**Time estimate:** 20 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir str && cd str && touch Str.java
\`\`\`

#### Step 2 — Core
\`\`\`java
static boolean anagram(String a,String b){if(a.length()!=b.length())return false;int[]c=new int[26];for(char x:a.toCharArray())c[x-'a']++;for(char x:b.toCharArray())if(--c[x-'a']<0)return false;return true;}
static boolean pal(String s){int l=0,r=s.length()-1;while(l<r)if(s.charAt(l++)!=s.charAt(r--))return false;return true;}
\`\`\`

#### Step 4 — Error Handling
\`\`\`java
if(a==null||b==null) return false;
\`\`\`

#### Step 5 — Tests
\`\`\`java
assert anagram("listen","silent"); assert pal("racecar");
\`\`\`

**Expected Output:**
\`\`\`
true true
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Why immutable? One sentence.
**Q2:** O(n²) trap of +; fix.
**Q3:** 10-line frequency count with int[26].

### Day 3 — Comprehension
**Q4:** == vs equals and the pool.
**Q5:** Buggy concat loop; fix.
**Q6:** Refactor to StringBuilder.

### Day 7 — Application
**Q7:** Group anagrams; handle empties.
**Q8:** PR uses + in a 10k loop — heap impact.
**Q9:** Anagram cost; Unicode degrade.

### Day 14 — Synthesis
**Q10:** ★ "Reverse words in place." Full answer.
**Q11:** Link to arrays, hashing, two-pointers.
**Q12:** ★ Build a 100M-doc inverted index.`
  },

  'string-manipulation': {
    feynman: `## FEYNMAN CHECK

### Explain String Manipulation Like I'm 10 Years Old
> Editing a string is like cutting and taping paper: every cut makes a new sheet. Replace, substring, split — each hands you a fresh copy. The smart move is plan all cuts, then make one new sheet. With two pointers you sweep once, writing kept characters forward, so removing spaces from a million-char string is one pass, not a million little copies.

---

### 5 Deep Conceptual Questions
**Q1: Why does substring sometimes leak memory?** > **A:** In old JVMs substring shared the parent char[], so a 2-char substring pinned a 1MB string. Modern JDK copies, fixing the leak but adding O(k). Know your runtime.
**Q2: ONE model?** > **A:** "Each op allocates; batch with a builder or two-pointer sweep."
**Q3: Misconception+code.** > **A:** \`\`\`java
// ❌ replace in loop reallocates
// ✅ char[] write index sweep
\`\`\`
**Q4: Interplay with regex?** > **A:** Regex compiles to an NFA/DFA; precompile Pattern once, reuse — compiling per call is O(pattern) waste.
**Q5: Senior one-liner.** > **A:** "String manipulation is repeated allocation hidden behind tidy methods; experts collapse it to one builder pass."`,
    build: `## BUILD

### 🏗️ Mini Project: Compress + Run-Length Encoder
**Time estimate:** 20 min
#### Step 1 — Setup
\`\`\`bash
mkdir rle && cd rle && touch Rle.java
\`\`\`
#### Step 2 — Core
\`\`\`java
static String rle(String s){var b=new StringBuilder();int n=s.length();for(int i=0;i<n;){int j=i;while(j<n&&s.charAt(j)==s.charAt(i))j++;b.append(s.charAt(i)).append(j-i);i=j;}return b.length()<n?b.toString():s;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(s==null||s.isEmpty())return s;
\`\`\`
#### Step 5 — Tests
\`\`\`java
assert rle("aaabb").equals("a3b2");
\`\`\`
**Expected Output:**
\`\`\`
a3b2
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Why each op allocates.
**Q2:** Two-pointer write index benefit.
**Q3:** 10-line space remover.
### Day 3 — Comprehension
**Q4:** substring leak history.
**Q5:** Buggy replace loop; fix.
**Q6:** Precompile regex.
### Day 7 — Application
**Q7:** RLE compress; handle worse-than-original.
**Q8:** PR splits 1M lines repeatedly — GC.
**Q9:** RLE cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "String compression." Full answer.
**Q11:** Link string-basics, two-pointers, algorithms.
**Q12:** ★ Stream-edit 1TB logs.`
  },

  'string-algorithms': {
    feynman: `## FEYNMAN CHECK

### Explain String Algorithms Like I'm 10 Years Old
> Finding a word in a book by re-reading every page from each start is slow. KMP is like leaving smart bookmarks: when a match fails you don't restart, you jump to the longest prefix you already matched. Rabin-Karp instead gives each window a fingerprint number and slides it cheaply. This is why your editor's Ctrl-F finds text in milliseconds in a huge file.

---

### 5 Deep Conceptual Questions
**Q1: Why is KMP O(n+m)?** > **A:** The failure (LPS) table lets the pointer never go backward in text; each char is visited once, dropping naive O(nm) to linear.
**Q2: ONE model?** > **A:** "Reuse the work of partial matches instead of rescanning."
**Q3: Misconception+code.** > **A:** Rolling hash collisions need verification: \`if(hashEqual) verifyChars();\`
**Q4: Interplay with hashing?** > **A:** Rabin-Karp's rolling hash updates in O(1) by removing the left char's weight and adding the right.
**Q5: Senior one-liner.** > **A:** "String search algorithms trade preprocessing for skip distance — KMP via prefix function, Rabin-Karp via rolling hash, Z via prefix-match array."`,
    build: `## BUILD

### 🏗️ Mini Project: KMP Substring Search
**Time:** 30 min
#### Step 1 — Setup
\`\`\`bash
mkdir kmp && cd kmp && touch Kmp.java
\`\`\`
#### Step 2 — Core
\`\`\`java
static int[] lps(String p){int[]l=new int[p.length()];int k=0;for(int i=1;i<p.length();){if(p.charAt(i)==p.charAt(k))l[i++]=++k;else if(k>0)k=l[k-1];else l[i++]=0;}return l;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(p.isEmpty())return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
assert lps("aabaa")[4]==2;
\`\`\`
**Expected Output:**
\`\`\`
[0,1,0,1,2]
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Why KMP linear.
**Q2:** LPS meaning.
**Q3:** 10-line naive search.
### Day 3 — Comprehension
**Q4:** KMP vs Rabin-Karp.
**Q5:** Collision bug; fix.
**Q6:** Refactor naive→KMP.
### Day 7 — Application
**Q7:** Rolling hash; handle collision.
**Q8:** PR rebuilds Pattern per call — cost.
**Q9:** Worst-case Rabin-Karp.
### Day 14 — Synthesis
**Q10:** ★ "Find pattern in text." Full answer.
**Q11:** Link hashing, trie, two-pointers.
**Q12:** ★ Grep across 1TB.`
  },

  'linked-list-singly': {
    feynman: `## FEYNMAN CHECK

### Explain Singly Linked Lists Like I'm 10 Years Old
> A singly linked list is a treasure hunt: each clue holds a value and the address of the next clue. You can only go forward, and to find clue #50 you must visit 49 first. But splicing a new clue in is instant — just rewrite one "next" arrow. This is why inserting at the head is O(1) but reading the middle is O(n), the mirror image of arrays.

---

### 5 Deep Conceptual Questions
**Q1: Why O(1) head insert but O(n) access?** > **A:** Nodes are scattered; you only hold the head pointer, so reaching index i walks i links. But inserting at head just points the new node at old head — one write.
**Q2: ONE model?** > **A:** "Pointers over contiguity: cheap edits, no random access, cache-hostile."
**Q3: Misconception+code.** > **A:** Losing the list on insert: \`\`\`java
// ❌ node.next=head; (head not updated)
node.next=head; head=node; // ✅
\`\`\`
**Q4: Cache behavior?** > **A:** Each node is a heap allocation, so traversal cache-misses per node — 5-10× slower than array scan despite same big-O.
**Q5: Senior one-liner.** > **A:** "A singly linked list trades random access for O(1) splices via forward pointers — ideal for queues, terrible for indexing."`,
    build: `## BUILD
### 🏗️ Mini Project: Singly List with Reverse
**Time:** 25 min
#### Step 1 — Setup
\`\`\`bash
mkdir sll && cd sll && touch L.java
\`\`\`
#### Step 2 — Core
\`\`\`java
class Node{int v;Node nx;Node(int v){this.v=v;}}
Node rev(Node h){Node p=null;while(h!=null){Node n=h.nx;h.nx=p;p=h;h=n;}return p;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(h==null||h.nx==null)return h;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// 1->2->3 reverse => 3->2->1
\`\`\`
**Expected Output:**
\`\`\`
3 2 1
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Head insert vs index access cost.
**Q2:** Cache penalty.
**Q3:** 10-line reverse.
### Day 3 — Comprehension
**Q4:** vs array.
**Q5:** Lost-head bug; fix.
**Q6:** Refactor to dummy head.
### Day 7 — Application
**Q7:** Detect cycle; handle null.
**Q8:** PR walks to tail per insert — O(n²).
**Q9:** Reverse cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Reverse a list." Full answer.
**Q11:** Link fast-slow, doubly, queue.
**Q12:** ★ LRU at 10M keys.`
  },

  'linked-list-doubly': {
    feynman: `## FEYNMAN CHECK
### Explain Doubly Linked Lists Like I'm 10 Years Old
> A doubly linked list is a train where each car couples to both neighbours. You can walk forward or back, and unhook any car in O(1) because it knows both sides. The cost: two coupling per car (extra memory). This is why LRU caches use it — pop any item instantly.
---
### 5 Deep Conceptual Questions
**Q1: Why O(1) delete given node?** > **A:** prev/next both known, so relink without scanning.
**Q2: ONE model?** > **A:** "Two arrows = bidirectional O(1) splice at memory cost."
**Q3: Misconception+code.** > **A:** Forgetting prev: \`x.prev.next=x.next; x.next.prev=x.prev;\`
**Q4: With sentinels?** > **A:** Dummy head/tail kill null checks.
**Q5: Senior one-liner.** > **A:** "A doubly linked list adds back-pointers for O(1) arbitrary deletion — the backbone of LinkedHashMap/LRU."`,
    build: `## BUILD
### 🏗️ Mini Project: LRU Core
**Time:** 30 min
#### Step 1 — Setup
\`\`\`bash
mkdir dll && cd dll && touch D.java
\`\`\`
#### Step 2 — Core
\`\`\`java
class N{int k,v;N p,n;}
void remove(N x){x.p.n=x.n;x.n.p=x.p;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(x==null)return;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// remove middle is O(1)
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Why O(1) delete.
**Q2:** Memory cost.
**Q3:** Sentinel benefit.
### Day 3 — Comprehension
**Q4:** vs singly.
**Q5:** Lost prev bug.
**Q6:** Add sentinels.
### Day 7 — Application
**Q7:** LRU; handle capacity.
**Q8:** PR forgets prev update.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Build LRU." Full answer.
**Q11:** Link hashmap, singly, queue.
**Q12:** ★ 10M-entry cache.`
  },

  'linked-list-circular': {
    feynman: `## FEYNMAN CHECK
### Explain Circular Lists Like I'm 10 Years Old
> A circular list is kids in a ring passing a ball — the last points back to first, no end. Great for round-robin scheduling. Danger: loop forever if you forget to stop. This is why CPU schedulers and ring buffers use it.
---
### 5 Deep Conceptual Questions
**Q1: Why circular for round-robin?** > **A:** Tail.next=head gives free wraparound, no boundary check.
**Q2: ONE model?** > **A:** "No null end — stop by counting or marking start."
**Q3: Misconception+code.** > **A:** Infinite loop: \`do{...}while(cur!=head);\`
**Q4: Ring buffer?** > **A:** Fixed array + two indices mod n.
**Q5: Senior one-liner.** > **A:** "A circular list closes the tail to head for O(1) rotation — schedulers and ring buffers."`,
    build: `## BUILD
### 🏗️ Mini Project: Round-Robin Scheduler
**Time:** 20 min
#### Step 1 — Setup
\`\`\`bash
mkdir circ && cd circ && touch C.java
\`\`\`
#### Step 2 — Core
\`\`\`java
N cur=head; for(int i=0;i<turns;i++){run(cur.v);cur=cur.nx;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(head==null)return;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// 3 nodes, 5 turns wraps
\`\`\`
**Expected Output:**
\`\`\`
A B C A B
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Why no null end.
**Q2:** Stop condition.
**Q3:** 10-line traversal.
### Day 3 — Comprehension
**Q4:** vs ring buffer.
**Q5:** Infinite loop bug.
**Q6:** Add stop count.
### Day 7 — Application
**Q7:** Josephus; handle 1 node.
**Q8:** PR no stop — hang.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Josephus." Full answer.
**Q11:** Link singly, queue, scheduler.
**Q12:** ★ Event ring 1M/s.`
  },

  'stack': {
    feynman: `## FEYNMAN CHECK
### Explain Stacks Like I'm 10 Years Old
> A stack is a pile of plates: add and remove only from the top (LIFO). The undo button, browser back, and function calls all use it. This is why deep recursion overflows the call stack — too many plates.
---
### 5 Deep Conceptual Questions
**Q1: Why LIFO for matching?** > **A:** Last open bracket must close first — exact stack order.
**Q2: ONE model?** > **A:** "Top-only access; push/pop O(1)."
**Q3: Misconception+code.** > **A:** Pop empty: \`if(!s.isEmpty())s.pop();\`
**Q4: Call stack?** > **A:** Each call pushes a frame; recursion depth = frames; overflow at limit.
**Q5: Senior one-liner.** > **A:** "A stack is LIFO O(1) push/pop — backbone of recursion, parsing, and DFS."`,
    build: `## BUILD
### 🏗️ Mini Project: Bracket Validator
**Time:** 20 min
#### Step 1 — Setup
\`\`\`bash
mkdir stk && cd stk && touch S.java
\`\`\`
#### Step 2 — Core
\`\`\`java
for(char c:s.toCharArray()){if("([{".indexOf(c)>=0)st.push(c);else if(st.isEmpty()||!match(st.pop(),c))return false;}return st.isEmpty();
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(s==null)return true;
\`\`\`
#### Step 5 — Tests
\`\`\`java
assert valid("([])"); assert !valid("(]");
\`\`\`
**Expected Output:**
\`\`\`
true false
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** LIFO use.
**Q2:** push/pop cost.
**Q3:** 10-line validator.
### Day 3 — Comprehension
**Q4:** vs queue.
**Q5:** Empty pop bug.
**Q6:** Refactor recursion→stack.
### Day 7 — Application
**Q7:** Eval RPN; handle bad input.
**Q8:** PR no empty check — crash.
**Q9:** Cost; overflow.
### Day 14 — Synthesis
**Q10:** ★ "Valid parentheses." Full answer.
**Q11:** Link recursion, monotonic-stack, DFS.
**Q12:** ★ Expression engine.`
  },

  'queue': {
    feynman: `## FEYNMAN CHECK
### Explain Queues Like I'm 10 Years Old
> A queue is a line at a counter: first in, first out. Printers, BFS, and task pipelines use it. This is why BFS finds shortest unweighted paths — it serves nearest first.
---
### 5 Deep Conceptual Questions
**Q1: Why FIFO for BFS?** > **A:** Processing closest first guarantees layer order = shortest hops.
**Q2: ONE model?** > **A:** "Enqueue tail, dequeue head, both O(1)."
**Q3: Misconception+code.** > **A:** ArrayList front-remove O(n); use ArrayDeque.
**Q4: Ring buffer?** > **A:** Fixed array + head/tail mod n = O(1) bounded queue.
**Q5: Senior one-liner.** > **A:** "A queue is FIFO O(1) ends — BFS, scheduling, buffering."`,
    build: `## BUILD
### 🏗️ Mini Project: Circular Buffer Queue
**Time:** 25 min
#### Step 1 — Setup
\`\`\`bash
mkdir q && cd q && touch Q.java
\`\`\`
#### Step 2 — Core
\`\`\`java
void enq(int v){a[tail]=v;tail=(tail+1)%n;sz++;} int deq(){int v=a[head];head=(head+1)%n;sz--;return v;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(sz==n)throw new IllegalStateException("full");
\`\`\`
#### Step 5 — Tests
\`\`\`java
// wrap-around correct
\`\`\`
**Expected Output:**
\`\`\`
1 2 3
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** FIFO use.
**Q2:** O(1) ends.
**Q3:** 10-line ring buffer.
### Day 3 — Comprehension
**Q4:** vs stack.
**Q5:** ArrayList front bug.
**Q6:** Refactor to ArrayDeque.
### Day 7 — Application
**Q7:** BFS levels; handle empty.
**Q8:** PR uses list.remove(0).
**Q9:** Cost; full case.
### Day 14 — Synthesis
**Q10:** ★ "BFS shortest path." Full answer.
**Q11:** Link bfs, deque, scheduler.
**Q12:** ★ 1M msg/s broker.`
  },

  'deque': {
    feynman: `## FEYNMAN CHECK
### Explain Deques Like I'm 10 Years Old
> A deque is a line where people can join or leave from BOTH ends. Sliding-window-max keeps the biggest near the front and drops stale ones from the back — O(1) each side. This is why max-in-window over a million ticks is one pass.
---
### 5 Deep Conceptual Questions
**Q1: Why both ends O(1)?** > **A:** Backed by ring buffer or doubly list; head/tail edits relink, no shift.
**Q2: ONE model?** > **A:** "Stack+queue hybrid — push/pop either end."
**Q3: Misconception+code.** > **A:** Store indices not values to expire: \`while(dq.peek()<i-k)dq.poll();\`
**Q4: Monotonic deque?** > **A:** Keep decreasing values; front is window max.
**Q5: Senior one-liner.** > **A:** "A deque is a double-ended O(1) queue — sliding-window extremes, undo-redo."`,
    build: `## BUILD
### 🏗️ Mini Project: Sliding Window Max
**Time:** 30 min
#### Step 1 — Setup
\`\`\`bash
mkdir dq && cd dq && touch W.java
\`\`\`
#### Step 2 — Core
\`\`\`java
for(int i=0;i<n;i++){while(!dq.isEmpty()&&a[dq.peekLast()]<=a[i])dq.pollLast();dq.offer(i);if(dq.peek()<=i-k)dq.poll();if(i>=k-1)out.add(a[dq.peek()]);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(k<=0||a.length==0)return new int[0];
\`\`\`
#### Step 5 — Tests
\`\`\`java
// [1,3,-1,-3,5,3,6,7] k=3 => 3,3,5,5,6,7
\`\`\`
**Expected Output:**
\`\`\`
3 3 5 5 6 7
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Both-ends cost.
**Q2:** Why store indices.
**Q3:** 10-line monotonic deque.
### Day 3 — Comprehension
**Q4:** vs queue.
**Q5:** Value-store bug.
**Q6:** Refactor to indices.
### Day 7 — Application
**Q7:** Window max; handle k>n.
**Q8:** PR scans window O(nk).
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Sliding window max." Full answer.
**Q11:** Link queue, monotonic-stack, sliding-window.
**Q12:** ★ Stream extremes.`
  },

  'priority-queue': {
    feynman: `## FEYNMAN CHECK
### Explain Priority Queues Like I'm 10 Years Old
> A priority queue is an ER: the sickest seen first, not the earliest. Built on a heap, it always pops the min/max in O(log n). Dijkstra and Top-K rely on it. This is why "top 10 trending" doesn't sort all billion rows.
---
### 5 Deep Conceptual Questions
**Q1: Why heap not sorted array?** > **A:** Heap inserts O(log n) vs sorted insert O(n); only the extreme is needed.
**Q2: ONE model?** > **A:** "Partial order tree: parent ≤ children; root is min."
**Q3: Misconception+code.** > **A:** Wrong comparator: \`new PriorityQueue<>(Collections.reverseOrder())\` for max.
**Q4: Top-K?** > **A:** Min-heap of size k; pop smaller — O(n log k).
**Q5: Senior one-liner.** > **A:** "A PQ is a heap giving O(log n) insert and O(1) peek-extreme — Dijkstra, Top-K, scheduling."`,
    build: `## BUILD
### 🏗️ Mini Project: Top-K Frequent
**Time:** 25 min
#### Step 1 — Setup
\`\`\`bash
mkdir pq && cd pq && touch K.java
\`\`\`
#### Step 2 — Core
\`\`\`java
var pq=new PriorityQueue<int[]>((a,b)->a[1]-b[1]);for(var e:freq.entrySet()){pq.offer(new int[]{e.getKey(),e.getValue()});if(pq.size()>k)pq.poll();}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(k<=0)return new int[0];
\`\`\`
#### Step 5 — Tests
\`\`\`java
// [1,1,1,2,2,3] k=2 => 1,2
\`\`\`
**Expected Output:**
\`\`\`
1 2
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Why heap.
**Q2:** peek vs poll cost.
**Q3:** 10-line min-heap PQ.
### Day 3 — Comprehension
**Q4:** min vs max heap.
**Q5:** Comparator bug.
**Q6:** Top-K via size-k heap.
### Day 7 — Application
**Q7:** Merge k lists; handle empty.
**Q8:** PQ unbounded — memory.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Top K." Full answer.
**Q11:** Link heap, k-way-merge, dijkstra.
**Q12:** ★ Real-time leaderboard.`
  },

  'two-pointers-patterns': {
    feynman: `## FEYNMAN CHECK
### Explain Two Pointers Like I'm 10 Years Old
> Two pointers are two fingers on a sorted shelf: one at each end, moving toward each other based on sum too big or small. It turns O(n²) brute force into O(n). This is why "pair sums to target" is instant.
---
### 5 Deep Conceptual Questions
**Q1: Why O(n) not O(n²)?** > **A:** Each pointer moves only forward; total moves ≤ 2n.
**Q2: ONE model?** > **A:** "Sorted invariant lets one comparison shrink the search space."
**Q3: Misconception+code.** > **A:** Unsorted fails; sort first or use hashing.
**Q4: vs sliding window?** > **A:** Same family; window is two pointers moving same direction.
**Q5: Senior one-liner.** > **A:** "Two pointers exploit ordering to converge in O(n) — pair sums, partition, dedup."`,
    build: `## BUILD
### 🏗️ Mini Project: 3Sum
**Time:** 30 min
#### Step 1 — Setup
\`\`\`bash
mkdir tp && cd tp && touch T.java
\`\`\`
#### Step 2 — Core
\`\`\`java
Arrays.sort(a);for(int i=0;i<n-2;i++){int l=i+1,r=n-1;while(l<r){int s=a[i]+a[l]+a[r];if(s==0){add;l++;r--;}else if(s<0)l++;else r--;}}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
while(l<r&&a[l]==a[l-1])l++; // skip dups
\`\`\`
#### Step 5 — Tests
\`\`\`java
// [-1,0,1,2,-1,-4] => [-1,-1,2],[-1,0,1]
\`\`\`
**Expected Output:**
\`\`\`
2 triples
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Why linear.
**Q2:** Sort prereq.
**Q3:** 10-line pair sum.
### Day 3 — Comprehension
**Q4:** vs hashing.
**Q5:** Unsorted bug.
**Q6:** Add dedup.
### Day 7 — Application
**Q7:** 3Sum; skip dups.
**Q8:** PR O(n²) hashset.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "3Sum." Full answer.
**Q11:** Link sliding-window, sorting, arrays.
**Q12:** ★ Dedup huge dataset.`
  },

  'sliding-window': {
    feynman: `## FEYNMAN CHECK
### Explain Sliding Window Like I'm 10 Years Old
> A window is a clear ruler sliding over numbers, summing only what's under it. Instead of re-adding every time, you add the new right and drop the old left — one pass. This is why "longest substring no repeat" is O(n).
---
### 5 Deep Conceptual Questions
**Q1: Why O(n)?** > **A:** Each element enters and leaves the window once; 2n ops.
**Q2: ONE model?** > **A:** "Grow right, shrink left to keep validity."
**Q3: Misconception+code.** > **A:** Recompute sum = O(nk); instead \`sum+=a[r]-a[l]\`.
**Q4: Variable window?** > **A:** Expand until invalid, contract until valid.
**Q5: Senior one-liner.** > **A:** "Sliding window reuses overlap to get O(n) for contiguous subarray problems."`,
    build: `## BUILD
### 🏗️ Mini Project: Longest Unique Substring
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
int l=0;for(int r=0;r<n;r++){while(set.contains(s[r]))set.remove(s[l++]);set.add(s[r]);best=Math.max(best,r-l+1);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(s.isEmpty())return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// "abcabcbb"=>3
\`\`\`
**Expected Output:**
\`\`\`
3
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Why O(n).
**Q2:** Add-right drop-left.
**Q3:** 10-line max sum window.
### Day 3 — Comprehension
**Q4:** fixed vs variable.
**Q5:** Recompute bug.
**Q6:** Incremental sum.
### Day 7 — Application
**Q7:** Min window substr; handle none.
**Q8:** PR O(nk) recompute.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "No-repeat substring." Full answer.
**Q11:** Link two-pointers, prefix-sum, hashing.
**Q12:** ★ Rate limiter window.`
  },

  'prefix-sum': {
    feynman: `## FEYNMAN CHECK
### Explain Prefix Sum Like I'm 10 Years Old
> Prefix sums are running totals on a receipt. Range sum = total[r] − total[l−1], instant. Precompute once, answer any range in O(1). This is why analytics dashboards feel instant.
---
### 5 Deep Conceptual Questions
**Q1: Why O(1) range?** > **A:** Subtraction of two precomputed prefixes cancels the middle.
**Q2: ONE model?** > **A:** "Store totals; differences give ranges."
**Q3: Misconception+code.** > **A:** Off-by-one: \`sum=p[r+1]-p[l]\`.
**Q4: 2D prefix?** > **A:** Inclusion-exclusion: P[r2][c2]−P[r1-1]−P[c1-1]+P[r1-1][c1-1].
**Q5: Senior one-liner.** > **A:** "Prefix sums trade O(n) build for O(1) range queries — subarray sums, 2D regions."`,
    build: `## BUILD
### 🏗️ Mini Project: Subarray Sum Equals K
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
int run=0;map.put(0,1);for(int x:a){run+=x;cnt+=map.getOrDefault(run-k,0);map.merge(run,1,Integer::sum);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(a.length==0)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// [1,1,1] k=2 =>2
\`\`\`
**Expected Output:**
\`\`\`
2
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Why O(1) range.
**Q2:** Off-by-one fix.
**Q3:** 10-line prefix build.
### Day 3 — Comprehension
**Q4:** vs sliding window.
**Q5:** Index bug.
**Q6:** 2D prefix.
### Day 7 — Application
**Q7:** Count k-sum; handle negatives.
**Q8:** PR recomputes range O(n²).
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Subarray sum=k." Full answer.
**Q11:** Link sliding-window, hashing, arrays.
**Q12:** ★ 2D heatmap queries.`
  },

  'searching-intro': {
    feynman: `## FEYNMAN CHECK
### Explain Searching Like I'm 10 Years Old
> Linear search checks each box; binary search opens a sorted book at the middle and halves the hunt each time. 1M items = 20 peeks. This is why dictionaries and databases keep data sorted/indexed.
---
### 5 Deep Conceptual Questions
**Q1: Linear vs binary cost?** > **A:** O(n) vs O(log n); binary needs sorted input.
**Q2: ONE model?** > **A:** "Halve the search space per step."
**Q3: Misconception+code.** > **A:** Overflow mid: \`mid=l+(r-l)/2\`.
**Q4: Sorted requirement?** > **A:** Binary relies on order to discard half.
**Q5: Senior one-liner.** > **A:** "Search trades sortedness for O(log n); unsorted = O(n) linear."`,
    build: `## BUILD
### 🏗️ Mini Project: Binary Search
**Time:** 15 min
#### Step 2 — Core
\`\`\`java
int l=0,r=n-1;while(l<=r){int m=l+(r-l)/2;if(a[m]==t)return m;if(a[m]<t)l=m+1;else r=m-1;}return -1;
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(a==null)return -1;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// find 5 in [1..9]=>4
\`\`\`
**Expected Output:**
\`\`\`
4
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Costs.
**Q2:** Sorted need.
**Q3:** 10-line binary search.
### Day 3 — Comprehension
**Q4:** linear vs binary.
**Q5:** Overflow bug.
**Q6:** Iterative form.
### Day 7 — Application
**Q7:** First/last occurrence.
**Q8:** PR O(n) on sorted.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Binary search." Full answer.
**Q11:** Link sorting, advanced-bs, arrays.
**Q12:** ★ DB index lookup.`
  },

  'binary-search-advanced': {
    feynman: `## FEYNMAN CHECK
### Explain Advanced Binary Search Like I'm 10 Years Old
> Beyond finding a number, you binary-search the ANSWER: "is X feasible?" — too slow → bigger, too fast → smaller. Min-capacity, rotated arrays, peaks all use it. This is why "ship packages in D days" is O(n log sum).
---
### 5 Deep Conceptual Questions
**Q1: What is search-on-answer?** > **A:** Monotone predicate over a value range; bisect the boundary.
**Q2: ONE model?** > **A:** "Find leftmost X where check(X) is true."
**Q3: Misconception+code.** > **A:** Boundary: \`if(ok(m))r=m;else l=m+1;\`
**Q4: Rotated array?** > **A:** One half is always sorted; pick it.
**Q5: Senior one-liner.** > **A:** "Advanced BS bisects a monotone predicate — capacity, rate, rotation problems."`,
    build: `## BUILD
### 🏗️ Mini Project: Ship Within Days
**Time:** 30 min
#### Step 2 — Core
\`\`\`java
int l=max,r=sum;while(l<r){int m=(l+r)/2;if(days(w,m)<=D)r=m;else l=m+1;}return l;
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(D<1)throw new IllegalArgumentException();
\`\`\`
#### Step 5 — Tests
\`\`\`java
// w=1..10 D=5 =>15
\`\`\`
**Expected Output:**
\`\`\`
15
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Predicate idea.
**Q2:** Boundary update.
**Q3:** 10-line feasibility.
### Day 3 — Comprehension
**Q4:** value vs index search.
**Q5:** Off-by-one.
**Q6:** Rotated find.
### Day 7 — Application
**Q7:** Min eating speed; handle edge.
**Q8:** PR linear scan answer.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Search rotated." Full answer.
**Q11:** Link searching, sorting, greedy.
**Q12:** ★ Autoscale capacity.`
  },

  'sorting-intro': {
    feynman: `## FEYNMAN CHECK
### Explain Sorting Like I'm 10 Years Old
> Sorting lines cards low-to-high. Bubble swaps neighbours (slow O(n²)); merge splits and merges (O(n log n)); quick partitions around a pivot. Sorting unlocks binary search and dedup. This is why DBs sort before joining.
---
### 5 Deep Conceptual Questions
**Q1: Why O(n log n) lower bound?** > **A:** Comparison sorts need log(n!) ≈ n log n comparisons.
**Q2: ONE model?** > **A:** "Divide, sort halves, merge."
**Q3: Misconception+code.** > **A:** Quick worst O(n²); randomize pivot.
**Q4: Stable?** > **A:** Merge keeps equal order; quick doesn't.
**Q5: Senior one-liner.** > **A:** "Sorting is O(n log n) comparison-bound; merge stable, quick fast, counting linear for small ranges."`,
    build: `## BUILD
### 🏗️ Mini Project: Merge Sort
**Time:** 30 min
#### Step 2 — Core
\`\`\`java
void ms(int[]a,int l,int r){if(l>=r)return;int m=(l+r)/2;ms(a,l,m);ms(a,m+1,r);merge(a,l,m,r);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(a==null||a.length<2)return;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// {5,2,4,1}=>1,2,4,5
\`\`\`
**Expected Output:**
\`\`\`
1 2 4 5
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Lower bound.
**Q2:** Stable meaning.
**Q3:** 10-line merge.
### Day 3 — Comprehension
**Q4:** merge vs quick.
**Q5:** Quick worst-case.
**Q6:** Randomize pivot.
### Day 7 — Application
**Q7:** Sort by 2 keys; stability.
**Q8:** PR bubble on 1M.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Quicksort explain." Full answer.
**Q11:** Link searching, divide-conquer, arrays.
**Q12:** ★ External sort 1TB.`
  },

  'recursion-basics': {
    feynman: `## FEYNMAN CHECK
### Explain Recursion Like I'm 10 Years Old
> Recursion is mirrors facing mirrors: a function calls itself on a smaller problem until a base case stops it. Each call stacks a plate; forget the base case and plates overflow. This is why factorial and tree walks are tiny code.
---
### 5 Deep Conceptual Questions
**Q1: Why base case mandatory?** > **A:** Without it, infinite calls overflow the stack.
**Q2: ONE model?** > **A:** "Trust the smaller call; define base + step."
**Q3: Misconception+code.** > **A:** Missing base = StackOverflow.
**Q4: Stack frames?** > **A:** Each call holds locals; depth = memory.
**Q5: Senior one-liner.** > **A:** "Recursion solves by self-similar subproblems with base + reduction; depth costs stack."`,
    build: `## BUILD
### 🏗️ Mini Project: Tower of Hanoi
**Time:** 20 min
#### Step 2 — Core
\`\`\`java
void hanoi(int n,char a,char b,char c){if(n==0)return;hanoi(n-1,a,c,b);move(a,c);hanoi(n-1,b,a,c);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(n<0)throw new IllegalArgumentException();
\`\`\`
#### Step 5 — Tests
\`\`\`java
// n=3 =>7 moves
\`\`\`
**Expected Output:**
\`\`\`
7
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Base+step.
**Q2:** Stack depth.
**Q3:** 10-line factorial.
### Day 3 — Comprehension
**Q4:** recursion vs loop.
**Q5:** No-base bug.
**Q6:** Iterative form.
### Day 7 — Application
**Q7:** Permutations; handle dups.
**Q8:** PR deep recursion overflow.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Hanoi." Full answer.
**Q11:** Link backtracking, DP, trees.
**Q12:** ★ Parser at depth.`
  },

  'recursion-advanced': {
    feynman: `## FEYNMAN CHECK
### Explain Advanced Recursion Like I'm 10 Years Old
> Memoization is recursion with a notebook: solve once, write it down, reuse. Tail recursion lets the compiler reuse one frame. This turns exponential fib into linear. This is why naive fib(50) hangs but memoized is instant.
---
### 5 Deep Conceptual Questions
**Q1: Why memoize?** > **A:** Caches overlapping subproblems, cutting exponential to linear.
**Q2: ONE model?** > **A:** "Recursion + cache = top-down DP."
**Q3: Misconception+code.** > **A:** Mutable cache shared; \`memo[n]=...\`.
**Q4: Tail call?** > **A:** Step is last op; constant stack (if optimized).
**Q5: Senior one-liner.** > **A:** "Advanced recursion adds memoization/tail-calls to kill repeats and stack growth."`,
    build: `## BUILD
### 🏗️ Mini Project: Memoized Fib
**Time:** 15 min
#### Step 2 — Core
\`\`\`java
long fib(int n,long[]m){if(n<2)return n;if(m[n]!=0)return m[n];return m[n]=fib(n-1,m)+fib(n-2,m);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(n<0)throw new IllegalArgumentException();
\`\`\`
#### Step 5 — Tests
\`\`\`java
// fib(50)=12586269025
\`\`\`
**Expected Output:**
\`\`\`
12586269025
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Memo benefit.
**Q2:** Tail call.
**Q3:** 10-line memo fib.
### Day 3 — Comprehension
**Q4:** top-down vs bottom-up.
**Q5:** Shared cache bug.
**Q6:** Convert to iterative.
### Day 7 — Application
**Q7:** Coin change memo; handle none.
**Q8:** PR no memo exponential.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Memo vs tab." Full answer.
**Q11:** Link DP, recursion, divide-conquer.
**Q12:** ★ Cache eviction at scale.`
  },

  'divide-and-conquer': {
    feynman: `## FEYNMAN CHECK
### Explain Divide & Conquer Like I'm 10 Years Old
> Split a hard job into halves, solve each, combine. Merge sort, quickselect, fast power all do this. The Master Theorem predicts the cost. This is why huge problems shrink to log layers.
---
### 5 Deep Conceptual Questions
**Q1: Why log layers?** > **A:** Halving repeatedly gives log n levels, each O(n) work → O(n log n).
**Q2: ONE model?** > **A:** "Divide, conquer, combine."
**Q3: Misconception+code.** > **A:** Forget combine cost; Master Theorem.
**Q4: Quickselect?** > **A:** Recurse only one half → average O(n).
**Q5: Senior one-liner.** > **A:** "D&C splits into subproblems; cost = depth × merge per Master Theorem."`,
    build: `## BUILD
### 🏗️ Mini Project: Quickselect Kth
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
int sel(int[]a,int l,int r,int k){int p=part(a,l,r);if(p==k)return a[p];return p<k?sel(a,p+1,r,k):sel(a,l,p-1,k);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(k<0||k>=a.length)throw new IllegalArgumentException();
\`\`\`
#### Step 5 — Tests
\`\`\`java
// 2nd largest
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Three steps.
**Q2:** Master theorem.
**Q3:** 10-line power.
### Day 3 — Comprehension
**Q4:** vs DP.
**Q5:** Combine bug.
**Q6:** Quickselect.
### Day 7 — Application
**Q7:** Kth largest; handle dups.
**Q8:** PR sorts all for one stat.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Median of two arrays." Full answer.
**Q11:** Link sorting, recursion, heap.
**Q12:** ★ MapReduce.`
  },

  'monotonic-stack-patterns': {
    feynman: `## FEYNMAN CHECK
### Explain Monotonic Stack Like I'm 10 Years Old
> A monotonic stack keeps a tidy increasing/decreasing pile; new items pop smaller ones first. "Next greater element" and "largest rectangle" go O(n) this way. This is why daily-temperatures is one pass.
---
### 5 Deep Conceptual Questions
**Q1: Why O(n)?** > **A:** Each element pushed/popped once.
**Q2: ONE model?** > **A:** "Pop until invariant holds; popped finds its answer."
**Q3: Misconception+code.** > **A:** Store indices: \`while(!s.empty()&&a[s.peek()]<a[i])res[s.pop()]=i\`.
**Q4: Rectangle?** > **A:** Bars popped compute width to current.
**Q5: Senior one-liner.** > **A:** "Monotonic stack finds nearest greater/smaller in O(n) — ranges, histograms."`,
    build: `## BUILD
### 🏗️ Mini Project: Daily Temperatures
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
for(int i=0;i<n;i++){while(!s.isEmpty()&&t[s.peek()]<t[i]){int j=s.pop();r[j]=i-j;}s.push(i);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(t.length==0)return new int[0];
\`\`\`
#### Step 5 — Tests
\`\`\`java
// [73,74,75]=>1,1,0
\`\`\`
**Expected Output:**
\`\`\`
1 1 0
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Why O(n).
**Q2:** Index store.
**Q3:** 10-line next greater.
### Day 3 — Comprehension
**Q4:** vs brute.
**Q5:** Value bug.
**Q6:** Histogram.
### Day 7 — Application
**Q7:** Largest rectangle; edge.
**Q8:** PR O(n²) scan.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Next greater." Full answer.
**Q11:** Link stack, deque, arrays.
**Q12:** ★ Stock spans stream.`
  },

  'hashing-advanced': {
    feynman: `## FEYNMAN CHECK
### Explain Hashing Like I'm 10 Years Old
> A hash map drops items into numbered buckets by a fingerprint, so lookups are O(1). Too many sharing a bucket = collisions = slow. This is why load factor and resize matter — DBs, caches, dedup all rely on it.
---
### 5 Deep Conceptual Questions
**Q1: Why O(1) average?** > **A:** Hash points near-direct to bucket; few collisions.
**Q2: ONE model?** > **A:** "Key→bucket via hash; resolve clashes by chaining/probing."
**Q3: Misconception+code.** > **A:** Bad hashCode→all one bucket O(n). Override hashCode+equals.
**Q4: Resize?** > **A:** Past load factor, rehash to bigger table.
**Q5: Senior one-liner.** > **A:** "Hashing gives amortized O(1) via good distribution; collisions and resize set the tail."`,
    build: `## BUILD
### 🏗️ Mini Project: HashMap (Chaining)
**Time:** 30 min
#### Step 2 — Core
\`\`\`java
int idx(K k){return (k.hashCode()&0x7fffffff)%cap;} void put(K k,V v){bucket[idx(k)].add(new E(k,v));}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(size>cap*0.75)resize();
\`\`\`
#### Step 5 — Tests
\`\`\`java
// collisions chain
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** O(1) avg.
**Q2:** Load factor.
**Q3:** 10-line freq count.
### Day 3 — Comprehension
**Q4:** chain vs probe.
**Q5:** Bad hash bug.
**Q6:** hashCode+equals.
### Day 7 — Application
**Q7:** Two sum; handle dup.
**Q8:** PR uses list contains O(n²).
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "HashMap internals." Full answer.
**Q11:** Link arrays, two-sum, set.
**Q12:** ★ Distributed cache.`
  },

  'bit-manipulation': {
    feynman: `## FEYNMAN CHECK
### Explain Bit Manipulation Like I'm 10 Years Old
> Numbers are switches (bits). XOR cancels pairs, AND masks, shifts multiply by 2. "Find the lonely number" XORs all — duplicates cancel. This is why permissions and flags pack into one int.
---
### 5 Deep Conceptual Questions
**Q1: Why XOR finds single?** > **A:** a^a=0, x^0=x; pairs vanish, single remains.
**Q2: ONE model?** > **A:** "Each bit is independent; mask/shift to target it."
**Q3: Misconception+code.** > **A:** Clear bit: \`x&=~(1<<i)\`; set: \`x|=1<<i\`.
**Q4: Count bits?** > **A:** \`x&=x-1\` clears lowest set — Brian Kernighan.
**Q5: Senior one-liner.** > **A:** "Bit ops give O(1) set math via XOR/AND/shift — flags, dedup, subsets."`,
    build: `## BUILD
### 🏗️ Mini Project: Bit Toolkit
**Time:** 20 min
#### Step 2 — Core
\`\`\`java
int single(int[]a){int x=0;for(int v:a)x^=v;return x;} int bits(int x){int c=0;while(x!=0){x&=x-1;c++;}return c;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(a.length==0)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// [2,2,1]=>1; bits(7)=3
\`\`\`
**Expected Output:**
\`\`\`
1 3
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** XOR property.
**Q2:** set/clear bit.
**Q3:** 10-line single num.
### Day 3 — Comprehension
**Q4:** mask vs shift.
**Q5:** clear-bit bug.
**Q6:** Kernighan count.
### Day 7 — Application
**Q7:** Subsets via bits; edge.
**Q8:** PR uses set for parity.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Single number." Full answer.
**Q11:** Link math, dp-subsets, hashing.
**Q12:** ★ Bloom filter.`
  },

  'greedy-algorithms': {
    feynman: `## FEYNMAN CHECK
### Explain Greedy Like I'm 10 Years Old
> Greedy grabs the best-looking choice now and never looks back. Pick fewest coins, earliest-finish meetings. It works only when local best = global best. This is why it sometimes fails and you need DP.
---
### 5 Deep Conceptual Questions
**Q1: When does greedy work?** > **A:** With greedy-choice + optimal-substructure (e.g., intervals, Huffman).
**Q2: ONE model?** > **A:** "Sort by a key, take if compatible."
**Q3: Misconception+code.** > **A:** Coin greedy fails on {1,3,4} for 6; DP needed.
**Q4: Proof?** > **A:** Exchange argument: swapping to greedy never worsens.
**Q5: Senior one-liner.** > **A:** "Greedy is O(n log n) when local optimum proves global — else DP."`,
    build: `## BUILD
### 🏗️ Mini Project: Activity Selection
**Time:** 20 min
#### Step 2 — Core
\`\`\`java
Arrays.sort(it,(x,y)->x.end-y.end);int e=-1,c=0;for(var a:it)if(a.start>=e){c++;e=a.end;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(it.length==0)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// max non-overlap
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Greedy-choice prop.
**Q2:** sort key.
**Q3:** 10-line intervals.
### Day 3 — Comprehension
**Q4:** greedy vs DP.
**Q5:** coin fail.
**Q6:** exchange proof.
### Day 7 — Application
**Q7:** Jump game; edge.
**Q8:** PR greedy where DP needed.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Interval scheduling." Full answer.
**Q11:** Link sorting, intervals, dp.
**Q12:** ★ Bandwidth allocation.`
  },

  'binary-tree': {
    feynman: `## FEYNMAN CHECK
### Explain Binary Trees Like I'm 10 Years Old
> A binary tree is a family tree where each parent has up to 2 kids. You walk it pre/in/post order. Balanced = O(log n) depth; a line = O(n). This is why skewed trees lose all the speed.
---
### 5 Deep Conceptual Questions
**Q1: Why depth matters?** > **A:** Ops cost depth; balanced log n, skewed n.
**Q2: ONE model?** > **A:** "Recursive: node + left + right."
**Q3: Misconception+code.** > **A:** Null base: \`if(n==null)return;\`
**Q4: Traversals?** > **A:** pre=root first, in=sorted for BST, post=children first.
**Q5: Senior one-liner.** > **A:** "A binary tree gives hierarchical O(depth) ops; balance keeps depth log n."`,
    build: `## BUILD
### 🏗️ Mini Project: Tree Height + Traversals
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
int h(N n){return n==null?0:1+Math.max(h(n.l),h(n.r));} void in(N n){if(n==null)return;in(n.l);visit(n);in(n.r);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(root==null)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// height of 3-node=2
\`\`\`
**Expected Output:**
\`\`\`
2
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Depth cost.
**Q2:** 3 traversals.
**Q3:** 10-line height.
### Day 3 — Comprehension
**Q4:** balanced vs skewed.
**Q5:** Null bug.
**Q6:** Iterative inorder.
### Day 7 — Application
**Q7:** Level order; edge.
**Q8:** PR skews tree.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Invert tree." Full answer.
**Q11:** Link BST, bfs, dfs.
**Q12:** ★ File system tree.`
  },

  'binary-search-tree': {
    feynman: `## FEYNMAN CHECK
### Explain BST Like I'm 10 Years Old
> A BST keeps left smaller, right bigger, so search dives like binary search — O(log n) balanced. Inorder gives sorted output. This is why ordered maps use it, but a sorted-insert chain ruins it to O(n).
---
### 5 Deep Conceptual Questions
**Q1: Why inorder sorted?** > **A:** Left<root<right recursively yields ascending.
**Q2: ONE model?** > **A:** "Order invariant routes search left/right."
**Q3: Misconception+code.** > **A:** Sorted insert degenerates; balance.
**Q4: Delete?** > **A:** Replace with inorder successor.
**Q5: Senior one-liner.** > **A:** "BST gives O(log n) ordered ops when balanced; sorted input degrades to a list."`,
    build: `## BUILD
### 🏗️ Mini Project: BST Insert/Search
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
N ins(N n,int v){if(n==null)return new N(v);if(v<n.v)n.l=ins(n.l,v);else n.r=ins(n.r,v);return n;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(root==null)root=new N(v);
\`\`\`
#### Step 5 — Tests
\`\`\`java
// inorder sorted
\`\`\`
**Expected Output:**
\`\`\`
sorted
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Order rule.
**Q2:** Inorder sorted.
**Q3:** 10-line insert.
### Day 3 — Comprehension
**Q4:** vs heap.
**Q5:** Degenerate bug.
**Q6:** Delete successor.
### Day 7 — Application
**Q7:** Kth smallest; edge.
**Q8:** PR sorted insert.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Validate BST." Full answer.
**Q11:** Link avl, rb, binary-tree.
**Q12:** ★ Range index.`
  },

  'avl-tree': {
    feynman: `## FEYNMAN CHECK
### Explain AVL Trees Like I'm 10 Years Old
> An AVL tree is a BST with a strict gym coach: heights differ by ≤1; if not, it rotates to rebalance. This guarantees O(log n) forever. This is why ordered sets stay fast even with sorted inserts.
---
### 5 Deep Conceptual Questions
**Q1: Why rotate?** > **A:** Restore balance factor in {-1,0,1} keeping log depth.
**Q2: ONE model?** > **A:** "Insert, check balance, rotate LL/RR/LR/RL."
**Q3: Misconception+code.** > **A:** Forget height update before rotate.
**Q4: vs RB?** > **A:** AVL stricter→faster reads, more rotations.
**Q5: Senior one-liner.** > **A:** "AVL self-balances via rotations for guaranteed O(log n) at higher write cost."`,
    build: `## BUILD
### 🏗️ Mini Project: AVL Insert
**Time:** 35 min
#### Step 2 — Core
\`\`\`java
int bf(N n){return h(n.l)-h(n.r);} // rotate if |bf|>1
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
update height before balance check
\`\`\`
#### Step 5 — Tests
\`\`\`java
// sorted insert stays log
\`\`\`
**Expected Output:**
\`\`\`
balanced
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Balance factor.
**Q2:** rotation types.
**Q3:** 10-line bf.
### Day 3 — Comprehension
**Q4:** vs RB.
**Q5:** height bug.
**Q6:** LR rotate.
### Day 7 — Application
**Q7:** Insert seq; balance.
**Q8:** PR no rebalance.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Why AVL." Full answer.
**Q11:** Link bst, rb, segment.
**Q12:** ★ DB index choice.`
  },

  'red-black-tree': {
    feynman: `## FEYNMAN CHECK
### Explain Red-Black Trees Like I'm 10 Years Old
> A red-black tree colors nodes so no path is twice another — roughly balanced with fewer rotations than AVL. TreeMap uses it. This is why Java's ordered map stays O(log n) with cheap inserts.
---
### 5 Deep Conceptual Questions
**Q1: Why colors?** > **A:** Rules cap longest path ≤ 2× shortest → log depth.
**Q2: ONE model?** > **A:** "Recolor first, rotate only when needed."
**Q3: Misconception+code.** > **A:** Root must stay black.
**Q4: vs AVL?** > **A:** RB fewer rotations→better writes; AVL faster reads.
**Q5: Senior one-liner.** > **A:** "RB tree balances via color rules with O(1) rotations — TreeMap/TreeSet backbone."`,
    build: `## BUILD
### 🏗️ Mini Project: RB Concept
**Time:** 30 min
#### Step 2 — Core
\`\`\`java
// insert red, fix: recolor/rotate cases
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
root.color=BLACK;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// height bounded
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** Color rules.
**Q2:** root black.
**Q3:** path bound.
### Day 3 — Comprehension
**Q4:** vs AVL.
**Q5:** root bug.
**Q6:** recolor.
### Day 7 — Application
**Q7:** TreeMap; edge.
**Q8:** PR uses BST sorted.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "RB vs AVL." Full answer.
**Q11:** Link bst, avl, map.
**Q12:** ★ Ordered store 1B.`
  },

  'segment-tree': {
    feynman: `## FEYNMAN CHECK
### Explain Segment Trees Like I'm 10 Years Old
> A segment tree stores range answers in a tree so you query/ update any range in O(log n). Game leaderboards, range-sum, range-min use it. This is why "sum 3..900 with live updates" is instant.
---
### 5 Deep Conceptual Questions
**Q1: Why O(log n) range?** > **A:** A range splits into O(log n) covered nodes.
**Q2: ONE model?** > **A:** "Node = answer for its segment; merge children."
**Q3: Misconception+code.** > **A:** Lazy propagation for range updates.
**Q4: vs prefix sum?** > **A:** Handles updates; prefix only static.
**Q5: Senior one-liner.** > **A:** "Segment tree gives O(log n) range query+update via divide nodes + lazy."`,
    build: `## BUILD
### 🏗️ Mini Project: Range Sum
**Time:** 35 min
#### Step 2 — Core
\`\`\`java
int q(int n,int l,int r,int ql,int qr){if(qr<l||r<ql)return 0;if(ql<=l&&r<=qr)return t[n];int m=(l+r)/2;return q(2n,l,m,ql,qr)+q(2n+1,m+1,r,ql,qr);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(ql>qr)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// update+query
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** range cost.
**Q2:** merge.
**Q3:** 10-line query.
### Day 3 — Comprehension
**Q4:** vs prefix.
**Q5:** overlap bug.
**Q6:** lazy.
### Day 7 — Application
**Q7:** Range min; edge.
**Q8:** PR rebuild prefix per update.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Range sum mutable." Full answer.
**Q11:** Link fenwick, prefix, dc.
**Q12:** ★ Live leaderboard.`
  },

  'fenwick-tree': {
    feynman: `## FEYNMAN CHECK
### Explain Fenwick Trees Like I'm 10 Years Old
> A Fenwick (BIT) tree is a compact array where each slot covers a power-of-2 chunk via lowest-set-bit jumps. Prefix sums update/query in O(log n) with tiny code. This is why competitive coders pick it over segment trees for sums.
---
### 5 Deep Conceptual Questions
**Q1: Why i&-i?** > **A:** Isolates lowest set bit = the range a node owns; jumps cover prefix.
**Q2: ONE model?** > **A:** "Climb by i+=i&-i to update, i-=i&-i to query."
**Q3: Misconception+code.** > **A:** 1-indexed mandatory.
**Q4: vs segment?** > **A:** Less code/memory, sums only.
**Q5: Senior one-liner.** > **A:** "BIT gives O(log n) prefix update/query using lowest-set-bit decomposition."`,
    build: `## BUILD
### 🏗️ Mini Project: BIT
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
void up(int i,int v){for(;i<=n;i+=i&-i)t[i]+=v;} int q(int i){int s=0;for(;i>0;i-=i&-i)s+=t[i];return s;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(i<1)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// prefix=10
\`\`\`
**Expected Output:**
\`\`\`
10
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** i&-i.
**Q2:** 1-index.
**Q3:** 10-line update.
### Day 3 — Comprehension
**Q4:** vs segtree.
**Q5:** index bug.
**Q6:** range update.
### Day 7 — Application
**Q7:** Inversions; edge.
**Q8:** PR uses prefix array updates.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Count inversions." Full answer.
**Q11:** Link segment, prefix, sort.
**Q12:** ★ Real-time rank.`
  },

  'trie': {
    feynman: `## FEYNMAN CHECK
### Explain Tries Like I'm 10 Years Old
> A trie is a tree of letters; words share prefixes so "cat","car" share "ca". Lookup is O(word length), not O(words). This is why autocomplete and spell-check feel instant.
---
### 5 Deep Conceptual Questions
**Q1: Why O(len)?** > **A:** Walk one node per char regardless of dictionary size.
**Q2: ONE model?** > **A:** "Path = prefix; end flag marks words."
**Q3: Misconception+code.** > **A:** Mark isWord at end; missing it = prefix-only.
**Q4: Memory?** > **A:** 26 ptrs/node; use map for sparse.
**Q5: Senior one-liner.** > **A:** "A trie indexes by shared prefixes for O(len) lookup — autocomplete, routing."`,
    build: `## BUILD
### 🏗️ Mini Project: Autocomplete Trie
**Time:** 30 min
#### Step 2 — Core
\`\`\`java
void ins(String w){var c=root;for(char ch:w.toCharArray()){c=c.k.computeIfAbsent(ch,x->new T());}c.end=true;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(w==null||w.isEmpty())return;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// prefix "ca"=>cat,car
\`\`\`
**Expected Output:**
\`\`\`
cat car
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** O(len).
**Q2:** end flag.
**Q3:** 10-line insert.
### Day 3 — Comprehension
**Q4:** vs hashset.
**Q5:** flag bug.
**Q6:** sparse map.
### Day 7 — Application
**Q7:** Autocomplete; edge.
**Q8:** PR scans all words.
**Q9:** Cost; memory.
### Day 14 — Synthesis
**Q10:** ★ "Implement trie." Full answer.
**Q11:** Link strings, hashing, dfs.
**Q12:** ★ Search suggest 1B.`
  },

  'heap-minheap': {
    feynman: `## FEYNMAN CHECK
### Explain Min-Heap Like I'm 10 Years Old
> A min-heap is a tree where each parent is smaller, so the tiniest is on top. Insert bubbles up, pop sifts down — O(log n). This is why Dijkstra always grabs the cheapest next node fast.
---
### 5 Deep Conceptual Questions
**Q1: Why array?** > **A:** Complete tree: child=2i+1,2i+2; no pointers, cache-friendly.
**Q2: ONE model?** > **A:** "Parent ≤ children; root min."
**Q3: Misconception+code.** > **A:** Wrong sift dir corrupts; up on insert, down on pop.
**Q4: Heapify?** > **A:** Bottom-up O(n) builds heap.
**Q5: Senior one-liner.** > **A:** "Min-heap = array complete tree with O(log n) push/pop, O(1) peek-min."`,
    build: `## BUILD
### 🏗️ Mini Project: Min-Heap
**Time:** 30 min
#### Step 2 — Core
\`\`\`java
void up(int i){while(i>0&&a[(i-1)/2]>a[i]){swap(i,(i-1)/2);i=(i-1)/2;}}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(size==0)throw new NoSuchElementException();
\`\`\`
#### Step 5 — Tests
\`\`\`java
// pop ascending
\`\`\`
**Expected Output:**
\`\`\`
1 2 3
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** array index.
**Q2:** sift dir.
**Q3:** 10-line up.
### Day 3 — Comprehension
**Q4:** vs sorted.
**Q5:** sift bug.
**Q6:** heapify O(n).
### Day 7 — Application
**Q7:** Kth smallest; edge.
**Q8:** PR sorts each step.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Heap explain." Full answer.
**Q11:** Link pq, dijkstra, maxheap.
**Q12:** ★ Scheduler 1M.`
  },

  'heap-maxheap': {
    feynman: `## FEYNMAN CHECK
### Explain Max-Heap Like I'm 10 Years Old
> A max-heap puts the biggest on top — pop largest in O(log n). Heapsort and Top-K use it. This is why "top trending" pops the hottest without sorting all.
---
### 5 Deep Conceptual Questions
**Q1: max vs min?** > **A:** Invert comparator; parent ≥ children.
**Q2: ONE model?** > **A:** "Root max; pop biggest."
**Q3: Misconception+code.** > **A:** reverseOrder comparator.
**Q4: Heapsort?** > **A:** Pop n times = O(n log n) in place.
**Q5: Senior one-liner.** > **A:** "Max-heap roots the maximum for O(log n) extraction — heapsort, Top-K."`,
    build: `## BUILD
### 🏗️ Mini Project: Heapsort
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
for(int i=n/2-1;i>=0;i--)down(i,n);for(int i=n-1;i>0;i--){swap(0,i);down(0,i);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(n<2)return;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// sorted asc
\`\`\`
**Expected Output:**
\`\`\`
1 2 3
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** max invariant.
**Q2:** comparator.
**Q3:** 10-line down.
### Day 3 — Comprehension
**Q4:** vs min.
**Q5:** dir bug.
**Q6:** heapsort.
### Day 7 — Application
**Q7:** Top-K; edge.
**Q8:** PR PQ default min.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Top-K large." Full answer.
**Q11:** Link minheap, pq, sort.
**Q12:** ★ Trending feed.`
  },

  'interval-problems': {
    feynman: `## FEYNMAN CHECK
### Explain Intervals Like I'm 10 Years Old
> Intervals are busy time-blocks. Sort by start, then merge touching ones. Meeting rooms, calendars use it. This is why double-booking detection is one sweep.
---
### 5 Deep Conceptual Questions
**Q1: Why sort by start?** > **A:** Overlaps become adjacent; merge linearly.
**Q2: ONE model?** > **A:** "Sort, sweep, merge if start ≤ prevEnd."
**Q3: Misconception+code.** > **A:** Use max(end) when merging.
**Q4: Min rooms?** > **A:** Heap of end times.
**Q5: Senior one-liner.** > **A:** "Interval problems sort then sweep for O(n log n) merge/overlap."`,
    build: `## BUILD
### 🏗️ Mini Project: Merge Intervals
**Time:** 20 min
#### Step 2 — Core
\`\`\`java
Arrays.sort(iv,(a,b)->a[0]-b[0]);for(var x:iv){if(x[0]<=end)end=Math.max(end,x[1]);else{add;end=x[1];}}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(iv.length==0)return new int[0][];
\`\`\`
#### Step 5 — Tests
\`\`\`java
// [1,3][2,6]=>[1,6]
\`\`\`
**Expected Output:**
\`\`\`
[1,6]
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** sort key.
**Q2:** merge cond.
**Q3:** 10-line merge.
### Day 3 — Comprehension
**Q4:** rooms heap.
**Q5:** end bug.
**Q6:** insert interval.
### Day 7 — Application
**Q7:** Meeting rooms; edge.
**Q8:** PR O(n²) overlap.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Merge intervals." Full answer.
**Q11:** Link sort, greedy, heap.
**Q12:** ★ Calendar 1M users.`
  },

  'graph-representation': {
    feynman: `## FEYNMAN CHECK
### Explain Graph Representation Like I'm 10 Years Old
> A graph is dots (cities) joined by lines (roads). Store roads as a list per city (adjacency list, sparse) or a big grid (matrix, dense). Choosing wrong wastes memory or time. This is why maps use lists, not n² grids.
---
### 5 Deep Conceptual Questions
**Q1: List vs matrix?** > **A:** List O(V+E) memory, fast neighbors; matrix O(V²) but O(1) edge check.
**Q2: ONE model?** > **A:** "Sparse→list, dense→matrix."
**Q3: Misconception+code.** > **A:** Matrix on sparse wastes memory.
**Q4: Directed?** > **A:** Add one-way edge.
**Q5: Senior one-liner.** > **A:** "Adjacency list O(V+E) is default; matrix only when dense/edge-query heavy."`,
    build: `## BUILD
### 🏗️ Mini Project: Graph Builder
**Time:** 20 min
#### Step 2 — Core
\`\`\`java
List<List<Integer>> g=new ArrayList<>();void add(int u,int v){g.get(u).add(v);g.get(v).add(u);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(u>=n||v>=n)throw new IllegalArgumentException();
\`\`\`
#### Step 5 — Tests
\`\`\`java
// degree count
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** list vs matrix.
**Q2:** memory.
**Q3:** 10-line build.
### Day 3 — Comprehension
**Q4:** dense vs sparse.
**Q5:** matrix waste.
**Q6:** directed.
### Day 7 — Application
**Q7:** Degree; edge.
**Q8:** PR matrix 1M nodes.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Represent graph." Full answer.
**Q11:** Link bfs, dfs, dijkstra.
**Q12:** ★ Social graph 1B.`
  },

  'bfs': {
    feynman: `## FEYNMAN CHECK
### Explain BFS Like I'm 10 Years Old
> BFS explores ripples: all neighbors, then theirs. A queue ensures nearest first, so it finds shortest unweighted paths. This is why friend-suggestions and maze solvers use it.
---
### 5 Deep Conceptual Questions
**Q1: Why shortest?** > **A:** Layer order = increasing distance; first reach = min hops.
**Q2: ONE model?** > **A:** "Queue + visited; expand layer by layer."
**Q3: Misconception+code.** > **A:** Mark visited on enqueue not dequeue → no dups.
**Q4: Cost?** > **A:** O(V+E).
**Q5: Senior one-liner.** > **A:** "BFS finds unweighted shortest paths in O(V+E) via FIFO layers."`,
    build: `## BUILD
### 🏗️ Mini Project: Shortest Maze
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
q.add(s);seen[s]=true;while(!q.isEmpty()){int u=q.poll();for(int v:g[u])if(!seen[v]){seen[v]=true;q.add(v);}}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(s==t)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// dist found
\`\`\`
**Expected Output:**
\`\`\`
4
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** why shortest.
**Q2:** mark enqueue.
**Q3:** 10-line bfs.
### Day 3 — Comprehension
**Q4:** vs dfs.
**Q5:** dup bug.
**Q6:** grid bfs.
### Day 7 — Application
**Q7:** Rotten oranges; edge.
**Q8:** PR mark on dequeue.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Shortest path." Full answer.
**Q11:** Link queue, dfs, dijkstra.
**Q12:** ★ Network broadcast.`
  },

  'backtracking': {
    feynman: `## FEYNMAN CHECK
### Explain Backtracking Like I'm 10 Years Old
> Backtracking tries a path, hits a wall, undoes the last step, tries another. Mazes, sudoku, permutations. Pruning bad branches early is the magic. This is why N-queens solves fast despite huge space.
---
### 5 Deep Conceptual Questions
**Q1: Why undo?** > **A:** Restores state to explore siblings without copying.
**Q2: ONE model?** > **A:** "Choose, explore, unchoose."
**Q3: Misconception+code.** > **A:** Forget unchoose corrupts; \`list.remove(last)\`.
**Q4: Pruning?** > **A:** Cut infeasible branches early for speedup.
**Q5: Senior one-liner.** > **A:** "Backtracking is DFS over choices with undo + pruning."`,
    build: `## BUILD
### 🏗️ Mini Project: Permutations
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
void bt(List cur){if(cur.size()==n){add;return;}for(int v:nums)if(!used[v]){used[v]=1;cur.add(v);bt(cur);cur.remove(cur.size()-1);used[v]=0;}}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(nums.length==0)return;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// 3!=6
\`\`\`
**Expected Output:**
\`\`\`
6
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** choose/unchoose.
**Q2:** prune.
**Q3:** 10-line subsets.
### Day 3 — Comprehension
**Q4:** vs dp.
**Q5:** no-undo bug.
**Q6:** dedup.
### Day 7 — Application
**Q7:** N-queens; edge.
**Q8:** PR copies state.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Permutations." Full answer.
**Q11:** Link dfs, recursion, greedy.
**Q12:** ★ Constraint solver.`
  },

  'dfs': {
    feynman: `## FEYNMAN CHECK
### Explain DFS Like I'm 10 Years Old
> DFS dives one path to the end, backs up, tries the next — a maze with a string. Stack or recursion. Cycle detection, topo sort, connected components. This is why dependency graphs use it.
---
### 5 Deep Conceptual Questions
**Q1: Stack vs queue?** > **A:** Stack = depth-first; queue = breadth-first.
**Q2: ONE model?** > **A:** "Go deep, mark, backtrack."
**Q3: Misconception+code.** > **A:** Missing visited = infinite cycle.
**Q4: Components?** > **A:** Count DFS starts on unvisited.
**Q5: Senior one-liner.** > **A:** "DFS explores depth-first in O(V+E) — cycles, components, topo."`,
    build: `## BUILD
### 🏗️ Mini Project: Count Islands
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
void dfs(int r,int c){if(bad)return;grid[r][c]='0';dfs(r+1,c);dfs(r-1,c);dfs(r,c+1);dfs(r,c-1);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(r<0||c<0||r>=R||c>=C)return;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// islands count
\`\`\`
**Expected Output:**
\`\`\`
3
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** stack vs queue.
**Q2:** visited.
**Q3:** 10-line dfs.
### Day 3 — Comprehension
**Q4:** vs bfs.
**Q5:** cycle bug.
**Q6:** components.
### Day 7 — Application
**Q7:** Islands; edge.
**Q8:** PR no visited.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Count islands." Full answer.
**Q11:** Link bfs, backtracking, topo.
**Q12:** ★ Dependency cycle.`
  },

  'union-find': {
    feynman: `## FEYNMAN CHECK
### Explain Union-Find Like I'm 10 Years Old
> Union-Find tracks who's in which team. Find leader, union merges teams. Path compression flattens chains, union-by-rank balances — near O(1). This is why Kruskal and network connectivity scale.
---
### 5 Deep Conceptual Questions
**Q1: Why near O(1)?** > **A:** Path compression + rank give inverse-Ackermann amortized.
**Q2: ONE model?** > **A:** "Forest of leaders; merge roots."
**Q3: Misconception+code.** > **A:** Compress: \`p[x]=find(p[x])\`.
**Q4: Cycle detect?** > **A:** Same root before union = cycle.
**Q5: Senior one-liner.** > **A:** "Union-Find gives ~O(1) merge/connectivity via compression+rank."`,
    build: `## BUILD
### 🏗️ Mini Project: DSU
**Time:** 20 min
#### Step 2 — Core
\`\`\`java
int find(int x){return p[x]==x?x:(p[x]=find(p[x]));} void uni(int a,int b){p[find(a)]=find(b);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(a>=n||b>=n)throw new IllegalArgumentException();
\`\`\`
#### Step 5 — Tests
\`\`\`java
// connected?
\`\`\`
**Expected Output:**
\`\`\`
true
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** compression.
**Q2:** rank.
**Q3:** 10-line find.
### Day 3 — Comprehension
**Q4:** vs bfs connectivity.
**Q5:** no-compress bug.
**Q6:** cycle.
### Day 7 — Application
**Q7:** Kruskal; edge.
**Q8:** PR O(n) find.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Number of provinces." Full answer.
**Q11:** Link mst, graph, dfs.
**Q12:** ★ 1B-node connectivity.`
  },

  'shortest-path-dijkstra': {
    feynman: `## FEYNMAN CHECK
### Explain Dijkstra Like I'm 10 Years Old
> Dijkstra finds cheapest roads from one city, always expanding the nearest unvisited via a min-heap. Maps and routing use it. Fails on negative roads — use Bellman-Ford. This is why GPS reroutes fast.
---
### 5 Deep Conceptual Questions
**Q1: Why greedy works?** > **A:** Non-negative edges mean settled nodes can't get cheaper.
**Q2: ONE model?** > **A:** "Pop min dist, relax neighbors."
**Q3: Misconception+code.** > **A:** Negative edges break it; lazy delete stale heap entries.
**Q4: Cost?** > **A:** O((V+E)log V) with heap.
**Q5: Senior one-liner.** > **A:** "Dijkstra = greedy heap relaxation, O((V+E)log V), non-negative weights."`,
    build: `## BUILD
### 🏗️ Mini Project: Dijkstra
**Time:** 30 min
#### Step 2 — Core
\`\`\`java
pq.add(new int[]{0,s});while(!pq.isEmpty()){var c=pq.poll();if(c[0]>d[c[1]])continue;for(var e:g[c[1]])if(d[c[1]]+e.w<d[e.to]){d[e.to]=d[c[1]]+e.w;pq.add(new int[]{d[e.to],e.to});}}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
Arrays.fill(d,INF);d[s]=0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// dist target
\`\`\`
**Expected Output:**
\`\`\`
7
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** greedy reason.
**Q2:** heap cost.
**Q3:** 10-line relax.
### Day 3 — Comprehension
**Q4:** vs bellman.
**Q5:** negative bug.
**Q6:** lazy delete.
### Day 7 — Application
**Q7:** Network delay; edge.
**Q8:** PR negative edges.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Dijkstra." Full answer.
**Q11:** Link heap, bellman, floyd.
**Q12:** ★ Map routing 1B edges.`
  },

  'shortest-path-bellman-ford': {
    feynman: `## FEYNMAN CHECK
### Explain Bellman-Ford Like I'm 10 Years Old
> Bellman-Ford relaxes every road V−1 times, so it handles negative roads and detects money-loss loops. Slower than Dijkstra but safer. This is why arbitrage detection uses it.
---
### 5 Deep Conceptual Questions
**Q1: Why V−1 rounds?** > **A:** Longest simple path has V−1 edges; enough to settle all.
**Q2: ONE model?** > **A:** "Relax all edges repeatedly."
**Q3: Misconception+code.** > **A:** Extra round detects negative cycle.
**Q4: Cost?** > **A:** O(VE).
**Q5: Senior one-liner.** > **A:** "Bellman-Ford handles negatives and finds cycles in O(VE)."`,
    build: `## BUILD
### 🏗️ Mini Project: Bellman-Ford
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
for(int i=1;i<V;i++)for(var e:edges)if(d[e.u]+e.w<d[e.v])d[e.v]=d[e.u]+e.w;
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
// extra pass => neg cycle
\`\`\`
#### Step 5 — Tests
\`\`\`java
// detect cycle
\`\`\`
**Expected Output:**
\`\`\`
neg-cycle
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** V−1 rounds.
**Q2:** cost.
**Q3:** 10-line relax.
### Day 3 — Comprehension
**Q4:** vs dijkstra.
**Q5:** cycle pass.
**Q6:** init.
### Day 7 — Application
**Q7:** Arbitrage; edge.
**Q8:** PR uses dijkstra neg.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Neg cycle." Full answer.
**Q11:** Link dijkstra, floyd, graph.
**Q12:** ★ FX arbitrage.`
  },

  'shortest-path-floyd-warshall': {
    feynman: `## FEYNMAN CHECK
### Explain Floyd-Warshall Like I'm 10 Years Old
> Floyd-Warshall fills a table of all-pairs distances by asking "is going through k shorter?" for every k. Small dense graphs only — O(V³). This is why transitive closure and tiny maps use it.
---
### 5 Deep Conceptual Questions
**Q1: Why triple loop?** > **A:** k outer tests each node as intermediary for all pairs.
**Q2: ONE model?** > **A:** "dp[i][j]=min(via k)."
**Q3: Misconception+code.** > **A:** k must be outermost.
**Q4: Cost?** > **A:** O(V³).
**Q5: Senior one-liner.** > **A:** "Floyd-Warshall is O(V³) DP for all-pairs shortest paths."`,
    build: `## BUILD
### 🏗️ Mini Project: All-Pairs
**Time:** 20 min
#### Step 2 — Core
\`\`\`java
for(int k=0;k<V;k++)for(int i=0;i<V;i++)for(int j=0;j<V;j++)d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
// INF guard
\`\`\`
#### Step 5 — Tests
\`\`\`java
// shortest pair
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** k loop.
**Q2:** cost.
**Q3:** 10-line.
### Day 3 — Comprehension
**Q4:** vs dijkstra.
**Q5:** loop order bug.
**Q6:** closure.
### Day 7 — Application
**Q7:** All-pairs; edge.
**Q8:** PR runs on 10k nodes.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "All pairs." Full answer.
**Q11:** Link dijkstra, dp, graph.
**Q12:** ★ Small dense net.`
  },

  'minimum-spanning-tree-kruskal': {
    feynman: `## FEYNMAN CHECK
### Explain Kruskal Like I'm 10 Years Old
> Kruskal connects cities cheapest-first, skipping roads that make a loop (Union-Find). Result: minimum wiring. This is why network/cable layout uses it.
---
### 5 Deep Conceptual Questions
**Q1: Why sort edges?** > **A:** Cheapest-first greedy gives MST.
**Q2: ONE model?** > **A:** "Pick cheap edge if it joins two trees."
**Q3: Misconception+code.** > **A:** Use DSU to skip cycles.
**Q4: Cost?** > **A:** O(E log E).
**Q5: Senior one-liner.** > **A:** "Kruskal sorts edges + DSU for O(E log E) MST — sparse graphs."`,
    build: `## BUILD
### 🏗️ Mini Project: Kruskal
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
sort(edges);for(var e:edges)if(find(e.u)!=find(e.v)){uni(e.u,e.v);cost+=e.w;}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
// stop at V-1 edges
\`\`\`
#### Step 5 — Tests
\`\`\`java
// min cost
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** sort+dsu.
**Q2:** cost.
**Q3:** 10-line.
### Day 3 — Comprehension
**Q4:** vs prim.
**Q5:** cycle bug.
**Q6:** stop cond.
### Day 7 — Application
**Q7:** Connect cost; edge.
**Q8:** PR no DSU.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "MST." Full answer.
**Q11:** Link union-find, prim, graph.
**Q12:** ★ Cable plan.`
  },

  'minimum-spanning-tree-prim': {
    feynman: `## FEYNMAN CHECK
### Explain Prim Like I'm 10 Years Old
> Prim grows one tree, adding the cheapest edge leaving it via a min-heap. Best for dense graphs. This is why clustering and dense networks use it.
---
### 5 Deep Conceptual Questions
**Q1: Prim vs Kruskal?** > **A:** Prim grows a tree (dense), Kruskal merges forests (sparse).
**Q2: ONE model?** > **A:** "Heap of border edges; add cheapest."
**Q3: Misconception+code.** > **A:** Skip visited nodes.
**Q4: Cost?** > **A:** O(E log V).
**Q5: Senior one-liner.** > **A:** "Prim grows MST via heap O(E log V) — dense graphs."`,
    build: `## BUILD
### 🏗️ Mini Project: Prim
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
pq.add(0,s);while(!pq.isEmpty()){var e=pq.poll();if(seen[e.to])continue;seen[e.to]=true;cost+=e.w;for(var n:g[e.to])pq.add(n);}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(count<V)return -1;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// min cost
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** grow tree.
**Q2:** cost.
**Q3:** 10-line.
### Day 3 — Comprehension
**Q4:** vs kruskal.
**Q5:** visited bug.
**Q6:** disconnected.
### Day 7 — Application
**Q7:** Cluster; edge.
**Q8:** PR no visited.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Prim vs Kruskal." Full answer.
**Q11:** Link heap, kruskal, graph.
**Q12:** ★ Dense net.`
  },

  'dynamic-programming-intro': {
    feynman: `## FEYNMAN CHECK
### Explain DP Like I'm 10 Years Old
> DP solves big problems by remembering small answers so you never recompute. Climb stairs, coin change. Find overlapping subproblems + optimal substructure. This is why fib(50) goes from forever to instant.
---
### 5 Deep Conceptual Questions
**Q1: Two requirements?** > **A:** Overlapping subproblems + optimal substructure.
**Q2: ONE model?** > **A:** "Define state, recurrence, base; cache."
**Q3: Misconception+code.** > **A:** Wrong state = double counting.
**Q4: top-down vs bottom-up?** > **A:** Memo recursion vs table iteration.
**Q5: Senior one-liner.** > **A:** "DP trades memory for time by caching overlapping subproblems."`,
    build: `## BUILD
### 🏗️ Mini Project: Climbing Stairs
**Time:** 15 min
#### Step 2 — Core
\`\`\`java
int a=1,b=1;for(int i=2;i<=n;i++){int c=a+b;a=b;b=c;}return b;
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(n<=0)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// n=5=>8
\`\`\`
**Expected Output:**
\`\`\`
8
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** two reqs.
**Q2:** state def.
**Q3:** 10-line stairs.
### Day 3 — Comprehension
**Q4:** top vs bottom.
**Q5:** state bug.
**Q6:** memoize.
### Day 7 — Application
**Q7:** Coin change; edge.
**Q8:** PR no cache.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Identify DP." Full answer.
**Q11:** Link recursion, dp-1d, dp-2d.
**Q12:** ★ Cost optimizer.`
  },

  'dp-1d-problems': {
    feynman: `## FEYNMAN CHECK
### Explain 1D DP Like I'm 10 Years Old
> 1D DP keeps a row of answers — house robber, max subarray. dp[i] depends on a few earlier slots. Often compress to two vars. This is why Kadane runs O(n) O(1).
---
### 5 Deep Conceptual Questions
**Q1: Why 1D?** > **A:** State = one index; transition from prior cells.
**Q2: ONE model?** > **A:** "dp[i]=f(dp[i-1],dp[i-2])."
**Q3: Misconception+code.** > **A:** Compress: keep two vars.
**Q4: Kadane?** > **A:** best=max(x,best+x).
**Q5: Senior one-liner.** > **A:** "1D DP linear-state recurrence, often O(1) space."`,
    build: `## BUILD
### 🏗️ Mini Project: House Robber
**Time:** 15 min
#### Step 2 — Core
\`\`\`java
int a=0,b=0;for(int x:n){int c=Math.max(b,a+x);a=b;b=c;}return b;
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(n.length==0)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// [2,7,9,3,1]=>12
\`\`\`
**Expected Output:**
\`\`\`
12
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** state.
**Q2:** compress.
**Q3:** kadane.
### Day 3 — Comprehension
**Q4:** vs greedy.
**Q5:** init bug.
**Q6:** rolling.
### Day 7 — Application
**Q7:** Robber; edge.
**Q8:** PR O(n) space.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Max subarray." Full answer.
**Q11:** Link intro, 2d, prefix.
**Q12:** ★ Streaming max.`
  },

  'dp-2d-problems': {
    feynman: `## FEYNMAN CHECK
### Explain 2D DP Like I'm 10 Years Old
> 2D DP fills a grid — unique paths, edit distance. Each cell from top/left. This is why diff tools compute edit distance fast.
---
### 5 Deep Conceptual Questions
**Q1: Why grid?** > **A:** Two changing dims (i,j).
**Q2: ONE model?** > **A:** "dp[i][j]=f(neighbors)."
**Q3: Misconception+code.** > **A:** Compress to 1 row.
**Q4: Edit distance?** > **A:** insert/del/replace min.
**Q5: Senior one-liner.** > **A:** "2D DP O(nm) over cell dependencies, compressible to O(min)."`,
    build: `## BUILD
### 🏗️ Mini Project: Unique Paths
**Time:** 20 min
#### Step 2 — Core
\`\`\`java
for(int i=1;i<m;i++)for(int j=1;j<n;j++)d[i][j]=d[i-1][j]+d[i][j-1];
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
Arrays.fill row/col=1;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// 3x3=>6
\`\`\`
**Expected Output:**
\`\`\`
6
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** grid state.
**Q2:** compress.
**Q3:** paths.
### Day 3 — Comprehension
**Q4:** edit distance.
**Q5:** base bug.
**Q6:** roll row.
### Day 7 — Application
**Q7:** Min path; edge.
**Q8:** PR full matrix.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Edit distance." Full answer.
**Q11:** Link 1d, strings, grid.
**Q12:** ★ Diff 1MB files.`
  },

  'dp-strings': {
    feynman: `## FEYNMAN CHECK
### Explain DP on Strings Like I'm 10 Years Old
> String DP compares two words cell by cell — LCS, edit distance, palindromes. Match → diagonal+1. This is why git diff and DNA matching work.
---
### 5 Deep Conceptual Questions
**Q1: Why 2D?** > **A:** Index into each string.
**Q2: ONE model?** > **A:** "Match=diag+1, else max(left,up)."
**Q3: Misconception+code.** > **A:** Palindrome by interval.
**Q4: LCS use?** > **A:** Diff, version control.
**Q5: Senior one-liner.** > **A:** "String DP aligns sequences O(nm) for LCS/edit/palindrome."`,
    build: `## BUILD
### 🏗️ Mini Project: LCS
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
d[i][j]=a[i]==b[j]?d[i-1][j-1]+1:Math.max(d[i-1][j],d[i][j-1]);
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(a.isEmpty()||b.isEmpty())return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// abcde,ace=>3
\`\`\`
**Expected Output:**
\`\`\`
3
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** 2D.
**Q2:** match rule.
**Q3:** lcs.
### Day 3 — Comprehension
**Q4:** vs lis.
**Q5:** base bug.
**Q6:** palindrome.
### Day 7 — Application
**Q7:** Edit dist; edge.
**Q8:** PR recursion no memo.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "LCS." Full answer.
**Q11:** Link 2d, strings, intro.
**Q12:** ★ DNA align.`
  },

  'dp-trees': {
    feynman: `## FEYNMAN CHECK
### Explain DP on Trees Like I'm 10 Years Old
> Tree DP solves a node from its children's answers — house robber III, tree diameter. Post-order returns sub-answers up. This is why org-chart and network problems use it.
---
### 5 Deep Conceptual Questions
**Q1: Why post-order?** > **A:** Need children before parent.
**Q2: ONE model?** > **A:** "Return (take, skip) per node."
**Q3: Misconception+code.** > **A:** Return tuple, combine.
**Q4: Diameter?** > **A:** max left+right depth.
**Q5: Senior one-liner.** > **A:** "Tree DP combines child subresults post-order O(n)."`,
    build: `## BUILD
### 🏗️ Mini Project: Robber III
**Time:** 25 min
#### Step 2 — Core
\`\`\`java
int[]dfs(N n){if(n==null)return new int[2];int[]l=dfs(n.l),r=dfs(n.r);int take=n.v+l[1]+r[1];int skip=max(l)+max(r);return new int[]{take,skip};}
\`\`\`
#### Step 4 — Error Handling
\`\`\`java
if(root==null)return 0;
\`\`\`
#### Step 5 — Tests
\`\`\`java
// max non-adj sum
\`\`\`
**Expected Output:**
\`\`\`
ok
\`\`\``,
    spacedReview: `## SPACED REVIEW
### Day 1 — Recall
**Q1:** post-order.
**Q2:** tuple.
**Q3:** diameter.
### Day 3 — Comprehension
**Q4:** vs 1d.
**Q5:** combine bug.
**Q6:** rob III.
### Day 7 — Application
**Q7:** Diameter; edge.
**Q8:** PR recompute.
**Q9:** Cost; degrade.
### Day 14 — Synthesis
**Q10:** ★ "Tree diameter." Full answer.
**Q11:** Link trees, dp, dfs.
**Q12:** ★ Org cost.`
  },

  'topological-sort': {
    feynman: `## FEYNMAN CHECK

### Explain Topological Sort Like I'm 10 Years Old
> Imagine you are baking a cake. You cannot frost the cake before it is baked, and you cannot bake it before you mix the batter. Topological Sort looks at all these "must do X before Y" rules (a Directed Acyclic Graph) and produces one valid order to complete every task. The non-obvious part: there can be many valid orderings — Topological Sort finds ONE correct one, not all of them. This is why build systems like Make and package managers like npm use it to order compilation steps and dependency installs.

---

### 5 Deep Conceptual Questions

**Q1: What problem does Topological Sort fundamentally solve?**
> **A:** It solves the problem of ordering tasks with dependencies — given a set of nodes where some must come before others (a DAG), produce a linear ordering that respects every directed edge. The key constraint is the graph must be acyclic; if there is a cycle (A depends on B, B depends on A), no valid ordering exists and the algorithm detects this. Kahn's Algorithm detects cycles when the output ordering contains fewer nodes than the total — the remainder are stuck in a cycle with non-zero in-degree.

**Q2: What is the ONE mental model that makes Topological Sort click?**
> **A:** Think of in-degree as a "waiting count". Every node is waiting for its predecessors to finish. When a node's waiting count reaches zero, it is free to execute. Topological Sort is the process of repeatedly picking any free node, executing it, and decrementing the waiting count of all its dependents. This model makes both Kahn's Algorithm (BFS-based) and DFS-based topological sort immediately intuitive.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** The misconception is that topological sort works on any directed graph. It only works on DAGs — graphs with no cycles.
> \`\`\`java
> // ❌ Misconception: calling topo sort on a graph with a cycle
> // A → B → C → A (cycle!) — Kahn's returns partial order, misses A, B, C
> int[] inDegree = {0, 1, 1, 1}; // node 0 has no predecessors
> // After processing node 0, nodes 1,2,3 never reach in-degree 0
> // Output has fewer than n nodes → CYCLE DETECTED
>
> // ✅ Always check: if (result.size() != numNodes) throw new CycleException();
> if (result.size() != numCourses) return new int[]{}; // LeetCode Course Schedule II pattern
> \`\`\`

**Q4: How does Topological Sort relate to DFS at the runtime level?**
> **A:** The DFS-based topological sort uses the post-order finish time of DFS. When DFS finishes visiting a node (all descendants processed), push it onto a stack. The stack in reverse gives topological order — because a node finishes AFTER all its dependents finish, so it belongs BEFORE them in the ordering. The key insight: a node's finish time in DFS is inversely proportional to its topological position. This is why Kosaraju's algorithm for SCCs runs two DFS passes using this exact property.

**Q5: One-sentence senior definition.**
> **A:** "Topological Sort is a linear ordering of vertices in a DAG such that for every directed edge u→v, vertex u appears before v — computed in O(V+E) via either BFS in-degree processing (Kahn's) or DFS post-order reversal — which is why it is the foundation of build dependency resolution, course scheduling, and package manager installation ordering."`,

    build: `## BUILD

### 🏗️ Mini Project: Dependency-Aware Task Runner

**What you will build:** A CLI task runner that reads a task dependency config (JSON), topologically sorts tasks, and executes them in valid order — like a mini Make/Gradle.
**Why this project:** Forces you to implement Kahn's Algorithm, cycle detection, and parallel execution grouping.
**Time estimate:** 35 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir task-runner && cd task-runner
touch index.js tasks.json
\`\`\`

#### Step 2 — Task Config
\`\`\`json
{
  "tasks": {
    "install-deps":  { "deps": [],                          "cmd": "echo Installing deps..." },
    "compile":       { "deps": ["install-deps"],             "cmd": "echo Compiling..." },
    "test":          { "deps": ["compile"],                  "cmd": "echo Running tests..." },
    "lint":          { "deps": ["install-deps"],             "cmd": "echo Linting..." },
    "build":         { "deps": ["compile", "test", "lint"],  "cmd": "echo Building..." },
    "deploy":        { "deps": ["build"],                    "cmd": "echo Deploying..." }
  }
}
\`\`\`

#### Step 3 — Core Implementation (Kahn's Algorithm)
\`\`\`javascript
// index.js
const config = require('./tasks.json');

function topologicalSort(tasks) {
  const inDegree = {};
  const adjList  = {};

  // Initialize
  for (const task of Object.keys(tasks)) {
    inDegree[task] = 0;
    adjList[task]  = [];
  }

  // Build adjacency list and compute in-degrees
  for (const [task, { deps }] of Object.entries(tasks)) {
    for (const dep of deps) {
      adjList[dep].push(task);   // dep must run before task
      inDegree[task]++;
    }
  }

  // Kahn's BFS
  const queue  = Object.keys(tasks).filter(t => inDegree[t] === 0);
  const result = [];

  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);

    for (const neighbor of adjList[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  // Cycle detection
  if (result.length !== Object.keys(tasks).length) {
    const cycled = Object.keys(tasks).filter(t => !result.includes(t));
    throw new Error('Cycle detected in tasks: ' + cycled.join(', '));
  }

  return result;
}

async function runTasks(tasks) {
  const order = topologicalSort(tasks);
  console.log('Execution order:', order.join(' → '));
  for (const task of order) {
    console.log('\\nRunning:', task);
    // In real implementation: execSync(tasks[task].cmd)
    console.log(' ', tasks[task].cmd);
  }
}

runTasks(config.tasks).catch(console.error);
\`\`\`

#### Step 4 — Error Handling & Edge Cases
\`\`\`javascript
// Handle: missing dependency references
function validateTasks(tasks) {
  for (const [task, { deps }] of Object.entries(tasks)) {
    for (const dep of deps) {
      if (!tasks[dep]) throw new Error(\`Task "\${task}" depends on unknown task "\${dep}"\`);
    }
  }
}

// Handle: empty task list
if (Object.keys(config.tasks).length === 0) {
  console.log('No tasks to run.'); process.exit(0);
}
validateTasks(config.tasks);
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
function test() {
  // Test 1: Basic ordering
  const tasks = { a: { deps:[] }, b: { deps:['a'] }, c: { deps:['b'] } };
  const order = topologicalSort(tasks);
  console.assert(order[0] === 'a', 'a must be first');
  console.assert(order.indexOf('a') < order.indexOf('b'), 'a before b');
  console.assert(order.indexOf('b') < order.indexOf('c'), 'b before c');

  // Test 2: Cycle detection
  const cyclic = { a: { deps:['b'] }, b: { deps:['a'] } };
  try { topologicalSort(cyclic); console.assert(false, 'Should throw'); }
  catch(e) { console.assert(e.message.includes('Cycle'), 'Detects cycle'); }

  console.log('All tests passed ✅');
}
test();
\`\`\`

**Expected Output:**
\`\`\`
Execution order: install-deps → compile → lint → test → build → deploy
Running: install-deps
  echo Installing deps...
Running: compile
  echo Compiling...
...
All tests passed ✅
\`\`\`

**Stretch Challenges:**
- [ ] Group tasks by dependency level and execute each level in parallel (Promise.all)
- [ ] Add a \`--dry-run\` flag that prints the order without executing
- [ ] Add timing output: how long each task takes`,

    spacedReview: `## SPACED REVIEW

> **How to use:** Answer each question from memory before reading ahead.

---

### Day 1 — Recall

**Q1:** Define Topological Sort in one sentence that includes: (1) what it IS, (2) HOW the mechanism works, and (3) WHEN you need it.

**Q2:** What is Kahn's Algorithm? What does "in-degree" mean and why is it central to the algorithm?

**Q3:** Write Kahn's Algorithm from memory in 15 lines. Include cycle detection.

---

### Day 3 — Comprehension

**Q4:** What is the difference between topological sort (Kahn's BFS) and DFS-based topological sort? When would you prefer each?

**Q5:** What does it mean when Kahn's Algorithm produces fewer nodes than the total graph? Write the cycle detection check.

**Q6:** Refactor this broken code:
\`\`\`java
// Broken: no cycle detection, wrong in-degree calculation
public int[] findOrder(int n, int[][] prereqs) {
    int[] inDegree = new int[n];
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] p : prereqs) { adj.get(p[1]).add(p[0]); inDegree[p[0]]++; }
    Queue<Integer> q = new LinkedList<>();
    for (int i = 0; i < n; i++) if (inDegree[i] == 0) q.offer(i);
    int[] res = new int[n]; int idx = 0;
    while (!q.isEmpty()) { int cur = q.poll(); res[idx++] = cur; for (int nb : adj.get(cur)) if (--inDegree[nb] == 0) q.offer(nb); }
    return res; // Bug: returns partial result if cycle exists
}
\`\`\`

---

### Day 7 — Application

**Q7:** Build a task dependency resolver from scratch: given a Map of task → dependencies[], return a valid execution order. Handle cycles.

**Q8:** You are reviewing a build system PR. The developer uses topological sort but sometimes tasks execute in the wrong order with no error. What is the likely bug? Describe the failure mode and fix.

**Q9:** What is the time and space complexity of topological sort? Under what graph conditions does it degrade?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Classic interview question: "You have N courses and a list of prerequisite pairs. Return the order in which you can take all courses, or an empty array if impossible." Give the complete solution with complexity analysis.

**Q11:** Draw the dependency graph: how does topological sort relate to BFS, DFS, shortest path, and cycle detection?

**Q12:** ★ System design: "You are building a CI/CD pipeline system. At 10M builds/day, how does topological sort affect your architecture? What breaks first when the dependency graph has 10,000 nodes per build? What do you add to fix it?"`
  },

  'garbage-collection-mechanics': {
    realworld: `## REAL_WORLD

### How the JVM G1 Garbage Collector Works at Netflix Scale

Netflix runs thousands of JVM services handling 250M+ streaming members. At peak traffic, GC pause times directly translate to request timeouts. Netflix's Engineering blog documented a case where unchecked GC pauses caused P99 latency spikes from 20ms to 2 seconds — a 100x degradation that triggered cascading retries across microservices.

Their solution: migrate from CMS (Concurrent Mark-Sweep) to G1GC, tune region sizes, and add JVM flags to cap pause times. G1GC's key innovation over CMS: it divides the heap into equal-sized regions (~1-32MB each) and collects the regions with the most garbage first (hence "Garbage First"), making pause times predictable and bounded.

\`\`\`java
// Production JVM flags used at Netflix-scale services
// -XX:+UseG1GC                           Enable G1 garbage collector
// -XX:MaxGCPauseMillis=200               Target max pause time (soft goal)
// -XX:G1HeapRegionSize=16m               Region size — tune based on object sizes
// -XX:InitiatingHeapOccupancyPercent=35  Start concurrent GC at 35% heap used
// -XX:G1ReservePercent=15                Keep 15% heap as emergency reserve
// -Xms4g -Xmx4g                          Fixed heap size — prevents resize pauses

// Monitoring GC in production (log to file, parse with GCEasy.io)
// -Xlog:gc*:file=/var/log/app/gc.log:time,uptime:filecount=5,filesize=20m

public class GcAwareCache {
    private final Map<String, SoftReference<byte[]>> cache = new ConcurrentHashMap<>();

    // SoftReference — JVM clears these BEFORE throwing OutOfMemoryError
    // Correct for caches: data is cleared under memory pressure automatically
    public void put(String key, byte[] data) {
        cache.put(key, new SoftReference<>(data));
    }

    public Optional<byte[]> get(String key) {
        SoftReference<byte[]> ref = cache.get(key);
        if (ref == null) return Optional.empty();
        byte[] data = ref.get(); // Returns null if GC has collected the referent
        if (data == null) cache.remove(key); // Clean up stale entry
        return Optional.ofNullable(data);
    }
}
\`\`\`

### Production Gotcha: Premature Promotion to Old Gen

The #1 GC production bug: objects that should be short-lived end up in Old Gen because they survive multiple minor GC cycles.

\`\`\`java
// ❌ DANGEROUS — creates long-lived StringBuilders inside a hot loop
// Each iteration the builder survives into Survivor space, then Old Gen
for (Request req : incomingRequests) {
    StringBuilder sb = new StringBuilder(); // Allocated in Eden
    sb.append(req.getHeader());
    sb.append(req.getBody());
    String result = sb.toString();
    process(result); // If process() is slow, sb may survive multiple minor GCs
}

// ✅ PRODUCTION-SAFE — pre-allocate and reset, stays in Eden
private static final ThreadLocal<StringBuilder> SB_POOL =
    ThreadLocal.withInitial(() -> new StringBuilder(512));

for (Request req : incomingRequests) {
    StringBuilder sb = SB_POOL.get();
    sb.setLength(0); // Reset without allocation — stays in same Eden slot
    sb.append(req.getHeader()).append(req.getBody());
    process(sb.toString());
}
\`\`\`
**Why it happens:** Each minor GC increments an object's age counter. After \`-XX:MaxTenuringThreshold\` (default 15) survivals, the object is promoted to Old Gen. Large Old Gen → infrequent but long Full GC pauses.

### Performance Characteristics
| GC Phase | Duration | Frequency | Notes |
|----------|----------|-----------|-------|
| Minor GC (Eden) | 1–50ms | Every 100ms–10s | Stop-the-world, fast |
| G1 Concurrent Mark | Concurrent | When heap 35% full | No stop-the-world |
| G1 Mixed GC | 50–200ms | After concurrent mark | Evacuates young + some old |
| Full GC (fallback) | 1–30s | Rarely (config error) | Stop-the-world, avoid |`,

    feynman: `## FEYNMAN CHECK

### Explain GC Mechanics Like I'm 10 Years Old
> Imagine your bedroom is RAM. You keep taking toys out of the toy box (allocating objects) and leaving them on the floor. Garbage Collection is a robot cleaner that periodically picks up toys you are no longer playing with and puts them back in the box. The non-obvious part: the robot uses a "mark-and-sweep" strategy — it first marks every toy that is reachable from your hands (GC roots), then sweeps away everything unmarked. Young toys (just taken out) are checked most often because most toys end up back in the box quickly (the "generational hypothesis"). This is why Java has Eden space — a fast-to-collect area where most objects die young.

---

### 5 Deep Conceptual Questions

**Q1: What problem does GC fundamentally solve, and why can't you just use reference counting?**
> **A:** GC solves the problem of reclaiming memory from unreachable objects automatically, eliminating use-after-free bugs and memory leaks from manual management. Reference counting (Python's primary mechanism) cannot handle circular references — if A references B and B references A, both have reference count > 0 forever even if nothing else references them. The JVM uses tracing GC instead: starting from GC roots (stack frames, static fields, JNI references), it traces ALL reachable objects — if an object is not reachable from any root, it is garbage regardless of its reference count. Python supplements refcounting with a cyclic garbage collector for exactly this reason.

**Q2: What is the ONE mental model for generational GC?**
> **A:** "Most objects die young." Empirical data shows 90%+ of objects become unreachable within milliseconds of creation (temporary strings, loop variables, event objects). The generational hypothesis exploits this: partition the heap into Young (Eden + Survivors) and Old generations. Minor GC only scans Young gen — typically 10-100x smaller than Old gen — making it 10-100x faster. Only the small fraction of objects that survive multiple minor GCs get promoted to Old gen, where expensive Major GC runs infrequently.

**Q3: Most dangerous misconception with code.**
> **A:** "Setting an object to null immediately frees its memory." In reality, null just removes the reference; memory is reclaimed only when GC runs.
> \`\`\`java
> // ❌ Misconception: expects immediate memory release
> byte[] bigArray = new byte[100_000_000]; // 100MB
> bigArray = null; // Memory is NOT freed here
> // GC hasn't run — still 100MB allocated. System.gc() is a hint, not a command.
>
> // ✅ Correct mental model: memory is reclaimed at next GC cycle
> // To reduce GC pressure: avoid large short-lived allocations; use object pools
> \`\`\`

**Q4: How does GC interact with the JIT compiler at the runtime level?**
> **A:** The JIT compiler and GC cooperate through "safepoints" — specific bytecode positions where all threads can be paused safely for GC. The JIT inserts safepoint checks into compiled code (typically at method returns and loop back-edges). When GC needs to stop the world, it sets a flag; each thread reaches its next safepoint and pauses. This is why a tight loop with no safepoints can block GC ("safepoint stall"). G1 and ZGC reduce stop-the-world time by doing most work concurrently, only needing brief safepoints for root scanning and reference updates.

**Q5: Senior one-liner.**
> **A:** "GC is a tracing algorithm that identifies the live object graph via reachability from GC roots, then reclaims unreachable memory — with generational collection exploiting the empirical observation that 90% of objects die in the Eden space — which is why GC pressure (not individual allocations) determines pause frequency and why reducing allocation rate is more effective than tuning GC parameters."`,

    build: `## BUILD

### 🏗️ Mini Project: GC Root Tracer & Memory Pressure Simulator

**What you will build:** A Java program that simulates memory pressure, triggers GC, and logs GC activity — teaching you to read GC logs and interpret GC behaviour.
**Why this project:** Forces you to understand allocation rates, GC pauses, SoftReference vs WeakReference behaviour, and GC tuning.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir gc-demo && cd gc-demo
# Run with GC logging enabled:
# java -Xmx256m -Xlog:gc*:stdout:time -cp . GCDemo
\`\`\`

#### Step 2 — Core: Memory Pressure Simulator
\`\`\`java
import java.lang.ref.*;
import java.util.*;

public class GCDemo {
    // WeakReference — cleared at next GC even if memory is available
    // SoftReference — cleared only when JVM needs memory (good for caches)
    static WeakReference<byte[]> weakRef;
    static SoftReference<byte[]> softRef;

    public static void main(String[] args) throws InterruptedException {
        demonstrateGenerations();
        demonstrateReferenceTypes();
    }

    static void demonstrateGenerations() {
        System.out.println("=== Generational GC Demo ===");
        long before = Runtime.getRuntime().freeMemory();

        // Short-lived allocations — go into Eden, collected by minor GC
        for (int i = 0; i < 10_000; i++) {
            byte[] shortLived = new byte[1024]; // 1KB, immediately unreachable
        }

        System.gc();
        long after = Runtime.getRuntime().freeMemory();
        System.out.println("Memory reclaimed: " + (after - before) / 1024 + "KB");
    }

    static void demonstrateReferenceTypes() throws InterruptedException {
        byte[] data = new byte[10 * 1024 * 1024]; // 10MB
        weakRef = new WeakReference<>(data);
        softRef = new SoftReference<>(data);
        data = null; // Remove strong reference

        System.out.println("Before GC — weak: " + (weakRef.get() != null) + ", soft: " + (softRef.get() != null));
        System.gc();
        Thread.sleep(100);
        // WeakReference cleared; SoftReference still present (memory not tight)
        System.out.println("After GC  — weak: " + (weakRef.get() != null) + ", soft: " + (softRef.get() != null));

        // Now create memory pressure — force soft reference collection
        List<byte[]> pressure = new ArrayList<>();
        try {
            while (true) pressure.add(new byte[1024 * 1024]); // Fill heap
        } catch (OutOfMemoryError e) {
            System.out.println("OOM — soft ref cleared: " + (softRef.get() == null));
        }
    }
}
\`\`\`

#### Step 3 — GC Log Analyzer
\`\`\`java
// Read and parse GC log output
// Run with: java -Xmx128m -verbose:gc GCDemo
// Output pattern: [GC (Allocation Failure) [PSYoungGen: 32768K->2048K(38400K)] 32768K->2060K(125952K), 0.003s]
// Parse: Young before→after(capacity), Heap before→after(capacity), pause time
\`\`\`

#### Step 4 — Error Handling
\`\`\`java
// Handle OutOfMemoryError gracefully in production
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    System.out.println("JVM shutting down — heap usage: " +
        (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / 1024 / 1024 + "MB");
}));
\`\`\`

#### Step 5 — Tests
\`\`\`java
// Test: WeakReference is cleared after GC
byte[] obj = new byte[1024];
WeakReference<byte[]> ref = new WeakReference<>(obj);
assert ref.get() != null : "Should be alive";
obj = null;
System.gc();
Thread.sleep(100);
assert ref.get() == null : "Should be collected after GC";
System.out.println("WeakReference test passed ✅");
\`\`\`

**Expected Output:**
\`\`\`
=== Generational GC Demo ===
Memory reclaimed: ~10000KB
Before GC — weak: true, soft: true
After GC  — weak: false, soft: true
OOM — soft ref cleared: true
WeakReference test passed ✅
\`\`\`

**Stretch Challenges:**
- [ ] Add a \`PhantomReference\` and \`ReferenceQueue\` to detect when an object is about to be collected
- [ ] Use \`-XX:+PrintGCDetails\` and identify Eden vs Survivor vs Old gen usage in the logs
- [ ] Implement an object pool (flyweight pattern) to reduce Eden pressure`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** Define GC in one sentence: what it IS, how the mark-and-sweep mechanism works, and when it runs.

**Q2:** What is the generational hypothesis? Name the 3 Java heap generations and what happens in each.

**Q3:** Write a 10-line Java snippet that creates a WeakReference and verifies it is cleared after System.gc().

---

### Day 3 — Comprehension

**Q4:** What is the difference between Minor GC, Major GC, and Full GC? Give a production scenario where Full GC causes an outage.

**Q5:** What is "object promotion"? What JVM flag controls the tenuring threshold, and what bug results from setting it too low?

**Q6:** Fix this code that causes premature Old Gen promotion:
\`\`\`java
// Hot loop — called 1M times/second
public String buildKey(String prefix, long id) {
    return new StringBuilder(prefix).append("-").append(id).toString();
}
\`\`\`

---

### Day 7 — Application

**Q7:** Build an LRU cache using SoftReference values. What happens to cache entries under memory pressure? Why is this preferable to WeakReference for a cache?

**Q8:** You are on-call. P99 latency spikes to 5s every 30 minutes for exactly 200ms. GC logs show Full GC pause. Diagnose the cause and fix it.

**Q9:** What is the time complexity of mark-and-sweep GC? What is "GC throughput" and how does it relate to allocation rate?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ "Walk me through what happens in the JVM from the moment you call \`new Object()\` to when that object's memory is reclaimed." Cover: TLAB, Eden, Survivor, Old Gen, GC phases.

**Q11:** Draw the dependency: GC → safepoints → JIT → thread scheduling. Why does a tight loop with no safepoint check block GC?

**Q12:** ★ System design: "Your JVM service handles 50K requests/second. GC pauses are causing P99 > 500ms. What metrics do you check? What GC algorithm do you choose and why? What JVM flags do you set?"`
  },

  'java-memory-model': {
    realworld: `## REAL_WORLD

### How the Java Memory Model Prevents Data Races at LinkedIn Scale

LinkedIn's Feed service processes billions of feed updates daily across hundreds of JVM instances. Before the JMM was deeply understood by their team, they had a class of intermittent bugs that appeared only under load: user A would see stale feed items even after their following list was updated. Root cause: a non-volatile \`boolean updated\` flag was being cached in CPU registers and never flushed to main memory, so other threads never saw the update.

The fix was understanding the JMM's happens-before guarantee: a write to a \`volatile\` field happens-before every subsequent read of that field from any thread.

\`\`\`java
// Production pattern — safe publication via volatile
// Used in: Spring singleton creation, double-checked locking, cache invalidation

public class FeedService {
    // volatile guarantees: write to 'cache' in thread A is visible to thread B
    // WITHOUT volatile: thread B may see a half-constructed FeedCache object
    private volatile FeedCache cache;

    public FeedCache getCache() {
        FeedCache local = this.cache; // Read once — avoids double volatile read
        if (local == null) {
            synchronized (this) {
                local = this.cache;
                if (local == null) {
                    local = new FeedCache(); // Full construction before assignment
                    this.cache = local;      // Volatile write — visible to all threads
                }
            }
        }
        return local;
    }
}

// Alternative: Java 9+ VarHandle for atomic operations without synchronized
import java.lang.invoke.VarHandle;
public class AtomicCounter {
    private volatile int count = 0;
    private static final VarHandle COUNT;
    static {
        try { COUNT = MethodHandles.lookup().findVarHandle(AtomicCounter.class, "count", int.class); }
        catch (Exception e) { throw new ExceptionInInitializerError(e); }
    }
    // CAS: compare-and-set — atomic increment without locking
    public int incrementAndGet() {
        int v; do { v = (int) COUNT.getVolatile(this); } while (!COUNT.compareAndSet(this, v, v + 1));
        return v + 1;
    }
}
\`\`\`

### Production Gotcha: Non-Atomic Long/Double Operations

64-bit \`long\` and \`double\` reads/writes are NOT guaranteed atomic on 32-bit JVMs — they can be torn (high 32 bits from one thread, low 32 bits from another).

\`\`\`java
// ❌ DANGEROUS on 32-bit JVMs — long write is NOT atomic
private long timestamp = 0L;
public void setTimestamp(long ts) { this.timestamp = ts; } // Can be seen half-written

// ✅ PRODUCTION-SAFE — volatile guarantees atomic 64-bit read/write on all JVMs
private volatile long timestamp = 0L;
// OR: use AtomicLong for read-modify-write operations
private final AtomicLong timestamp = new AtomicLong(0L);
\`\`\`
**Why it happens:** The JMM only guarantees 32-bit atomicity by default. \`volatile long\` extends the guarantee to 64-bit. \`AtomicLong\` additionally guarantees compound operations (getAndIncrement) are atomic.

### Performance Characteristics
| Operation | Visibility | Ordering | Cost vs unsynchronized |
|-----------|------------|----------|------------------------|
| Regular field write | Thread-local cache | May be reordered | 1x |
| volatile write | All threads (flush) | No reorder past | ~10x |
| synchronized block | All threads on exit | Full fence | ~50x |
| AtomicLong CAS | All threads | Sequential | ~5x |`,

    feynman: `## FEYNMAN CHECK

### Explain the Java Memory Model Like I'm 10 Years Old
> Imagine you and your friend each have a whiteboard (CPU cache). There is also a big shared whiteboard at the front of the room (main memory). Normally, you both write on your own whiteboard and only occasionally copy things to the shared one. If your friend writes "x = 5" on their whiteboard, you might still see "x = 0" on yours because the shared board hasn't been updated yet. The JMM is a rulebook that says when you are GUARANTEED to see your friend's latest writing. The keyword \`volatile\` forces both of you to always write directly to the shared board — guaranteeing freshness at the cost of speed. This is why multi-threaded bugs disappear on single-core machines (one cache) but reappear on multi-core systems.

---

### 5 Deep Conceptual Questions

**Q1: What problem does the JMM fundamentally solve?**
> **A:** The JMM solves the problem of defining when writes by one thread are guaranteed to be visible to reads by another thread in a multi-core environment. Without a formal memory model, CPU caches and compiler reorderings make sharing state between threads non-deterministic. The JMM does NOT say when visibility happens — it says under what program constructs it is GUARANTEED. The happens-before relation is the formal mechanism: action A happens-before action B means B is guaranteed to see all side-effects of A.

**Q2: ONE mental model for the JMM.**
> **A:** Think of the JMM as a contract between you (the programmer) and the JVM/CPU. The JVM is allowed to reorder instructions, cache values in registers, and delay writes to main memory — UNLESS you use synchronization primitives that create happens-before edges. \`volatile\`, \`synchronized\`, \`Thread.start()\`, \`Thread.join()\`, and \`Lock.unlock()\` all create happens-before edges. If there is no happens-before chain between a write and a read, the read is allowed to see any value — including stale, reordered, or partially-written values.

**Q3: Most dangerous misconception with code.**
> **A:** "volatile is only for visibility — it doesn't prevent race conditions." Actually, volatile DOES prevent data races on single reads/writes, but does NOT prevent race conditions on compound operations.
> \`\`\`java
> // ❌ Race condition even with volatile — read-modify-write is not atomic
> private volatile int counter = 0;
> public void increment() { counter++; } // Read, add 1, write — 3 steps, not atomic
> // Thread A reads 5, Thread B reads 5, both write 6 — lost update!
>
> // ✅ Use AtomicInteger for compound operations
> private final AtomicInteger counter = new AtomicInteger(0);
> public void increment() { counter.incrementAndGet(); } // CAS — atomic
> \`\`\`

**Q4: How does the JMM interact with CPU cache coherence at the hardware level?**
> **A:** Modern CPUs have L1/L2/L3 caches per core. The MESI protocol (Modified/Exclusive/Shared/Invalid) maintains cache coherence in hardware — but this only guarantees eventual coherence, not ordering. The JMM maps onto CPU memory barriers (mfence, sfence, lfence on x86). A \`volatile\` write compiles to a \`lock\` prefix on x86 (full memory barrier), which forces all cached writes to main memory and invalidates other cores' caches. On ARM (weaker memory model), \`volatile\` requires explicit \`dmb\` (data memory barrier) instructions, making volatile more expensive on ARM than x86.

**Q5: Senior one-liner.**
> **A:** "The Java Memory Model defines happens-before relationships that guarantee when a thread's write to shared state is visible to another thread's subsequent read — enforced via memory barriers compiled from \`volatile\`, \`synchronized\`, and \`java.util.concurrent\` primitives — which is why a data race (accessing shared state without happens-before) produces undefined behaviour even on x86 where most races accidentally work."`,

    build: `## BUILD

### 🏗️ Mini Project: Thread-Safe Counter & Visibility Demo

**What you will build:** A program that demonstrates JMM visibility issues, then fixes them with volatile, synchronized, and AtomicInteger — showing empirically why each is needed.
**Why this project:** Makes the abstract JMM concrete by producing observable bugs and fixes.
**Time estimate:** 30 minutes

---

#### Step 2 — Visibility Bug Demo
\`\`\`java
public class JMMDemo {
    // WITHOUT volatile — may run forever on multi-core JVMs
    static boolean running = true; // Change to: static volatile boolean running = true;

    public static void demonstrateVisibility() throws InterruptedException {
        Thread worker = new Thread(() -> {
            long count = 0;
            while (running) count++; // May never see running = false!
            System.out.println("Stopped after " + count + " iterations");
        });
        worker.start();
        Thread.sleep(100);
        running = false; // This write may never be seen by worker thread
        worker.join(1000);
        if (worker.isAlive()) {
            System.out.println("BUG: worker never saw running=false — JMM visibility issue!");
            worker.interrupt();
        }
    }
}
\`\`\`

#### Step 3 — Race Condition Demo
\`\`\`java
static int unsafeCounter = 0;
static AtomicInteger safeCounter = new AtomicInteger(0);

static void demonstrateRace() throws InterruptedException {
    int THREADS = 10, INCREMENTS = 10_000;
    Thread[] threads = new Thread[THREADS];

    // Race condition version
    for (int i = 0; i < THREADS; i++) threads[i] = new Thread(() -> {
        for (int j = 0; j < INCREMENTS; j++) unsafeCounter++; // Not atomic!
    });
    for (Thread t : threads) t.start();
    for (Thread t : threads) t.join();
    System.out.println("Unsafe counter (expect 100000): " + unsafeCounter); // Usually < 100000

    // Safe version
    unsafeCounter = 0;
    for (int i = 0; i < THREADS; i++) threads[i] = new Thread(() -> {
        for (int j = 0; j < INCREMENTS; j++) safeCounter.incrementAndGet();
    });
    for (Thread t : threads) t.start();
    for (Thread t : threads) t.join();
    System.out.println("Safe counter (expect 100000): " + safeCounter.get()); // Always 100000
}
\`\`\`

#### Step 4 — Error Handling
\`\`\`java
// Always use try-finally with locks to prevent deadlock on exception
Lock lock = new ReentrantLock();
lock.lock();
try {
    // critical section
} finally {
    lock.unlock(); // ALWAYS released even if exception thrown
}
\`\`\`

**Expected Output:**
\`\`\`
BUG: worker never saw running=false — JMM visibility issue!  (without volatile)
Stopped after 38472931 iterations                            (with volatile)
Unsafe counter (expect 100000): 87432    (race condition — lost updates)
Safe counter (expect 100000): 100000     (atomic — no lost updates)
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** Define the Java Memory Model: what it IS, what happens-before means, and why it matters.

**Q2:** What are the 3 JMM guarantees provided by \`volatile\`? What does \`volatile\` NOT guarantee?

**Q3:** Write a double-checked locking singleton using \`volatile\` correctly in 15 lines.

---

### Day 3 — Comprehension

**Q4:** What is the difference between a data race and a race condition? Give one example of each.

**Q5:** When would you use \`volatile\` vs \`AtomicInteger\` vs \`synchronized\`? Give a production scenario for each.

**Q6:** Fix this broken counter class:
\`\`\`java
public class Counter {
    private volatile int count = 0;
    public void increment() { count++; }
    public int get() { return count; }
}
\`\`\`

---

### Day 7 — Application

**Q7:** Implement a thread-safe lazy-initialized cache using ConcurrentHashMap.computeIfAbsent().

**Q8:** You are reviewing a PR: a developer uses a \`HashMap\` shared between 10 threads with no synchronization because "we only read from it after setup." Is this safe? Explain with JMM reasoning.

**Q9:** What is the time and space cost of \`synchronized\`? When does it use biased/thin/fat locking?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ "Explain the Java Memory Model to a senior engineer." Cover: happens-before, volatile, synchronized, CPU memory barriers.

**Q11:** Draw the happens-before chain: Thread.start() → run() → join() → continued execution.

**Q12:** ★ System design: "10M concurrent users share a counter (e.g., view count). How do you design this to avoid JMM contention? What changes at 100M? Discuss LongAdder vs AtomicLong vs Redis."`
  },

  'java-thread-lifecycle-states': {
    theory: `## THEORY

### Java Thread Lifecycle — The 6 States

A Java thread is a \`java.lang.Thread\` object that wraps an OS thread (in Java 21+, also a virtual thread). The JVM tracks each thread's state as one of 6 enum values defined in \`Thread.State\`.

\`\`\`mermaid
stateDiagram-v2
    [*] --> NEW : new Thread()
    NEW --> RUNNABLE : thread.start()
    RUNNABLE --> BLOCKED : waiting for synchronized lock
    BLOCKED --> RUNNABLE : lock acquired
    RUNNABLE --> WAITING : Object.wait() / Thread.join() / LockSupport.park()
    WAITING --> RUNNABLE : notify() / notifyAll() / unpark()
    RUNNABLE --> TIMED_WAITING : sleep(ms) / wait(ms) / join(ms)
    TIMED_WAITING --> RUNNABLE : timeout elapsed / notify()
    RUNNABLE --> TERMINATED : run() returns / exception thrown
\`\`\`

### Step-by-Step Internal Breakdown

1. **NEW** — \`Thread\` object created, no OS thread yet. \`start()\` not yet called.
2. **RUNNABLE** — OS thread exists and is either running on CPU or in the OS ready queue waiting for CPU time. JVM cannot distinguish "running on CPU" from "waiting for CPU" — both appear as RUNNABLE.
3. **BLOCKED** — Thread tried to enter a \`synchronized\` block/method and the monitor is held by another thread. The thread waits in the monitor's "entry set" (not the wait set).
4. **WAITING** — Thread called \`Object.wait()\`, \`Thread.join()\`, or \`LockSupport.park()\` with no timeout. Waits indefinitely until explicitly notified/unparked.
5. **TIMED_WAITING** — Same as WAITING but with a timeout: \`Thread.sleep(ms)\`, \`Object.wait(ms)\`, \`Thread.join(ms)\`, \`LockSupport.parkNanos()\`.
6. **TERMINATED** — \`run()\` method has returned or an uncaught exception terminated the thread. OS thread is destroyed.

### Comparison Table

| State | Consuming CPU? | Reason | Wake-up trigger |
|-------|---------------|--------|-----------------|
| NEW | No | Not started | thread.start() |
| RUNNABLE | Yes/No | Running or ready | CPU scheduler |
| BLOCKED | No | Waiting for monitor | Monitor released |
| WAITING | No | Explicit wait | notify()/unpark() |
| TIMED_WAITING | No | Timed wait | Timeout or notify() |
| TERMINATED | No | Finished | N/A |

### Common Misconception

Most developers think RUNNABLE means "currently executing on CPU". Actually, RUNNABLE means "eligible to run" — the thread may be waiting for CPU time in the OS scheduler queue. A RUNNABLE thread with high CPU time is actively executing; a RUNNABLE thread with zero CPU time is waiting in the OS ready queue. This is why profilers distinguish "CPU time" from "wall-clock time" — a thread can be RUNNABLE for 500ms wall-clock but only 10ms CPU time if the system is overloaded.

### Edge Cases
- **Spurious wakeup:** A thread in WAITING can wake up without \`notify()\` being called. Always use \`wait()\` in a loop: \`while (!condition) lock.wait();\`
- **Thread.interrupt():** Interrupting a WAITING/TIMED_WAITING thread wakes it with \`InterruptedException\`. Interrupting a BLOCKED thread sets the interrupt flag but does not unblock it.
- **Virtual threads (Java 21+):** Virtual threads (Project Loom) add a MOUNTED/UNMOUNTED distinction — a virtual thread can be RUNNABLE but not mounted on a platform thread, freeing the carrier for other work during I/O.`,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "StateMachine", "state": "java-thread-lifecycle" }
\`\`\``,

    code: `## CODE

### Level 1 — Beginner: Observe All 6 Thread States
\`\`\`java
public class ThreadStatesDemo {
    public static void main(String[] args) throws InterruptedException {
        // State 1: NEW
        Thread t = new Thread(() -> {
            try { Thread.sleep(500); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        });
        System.out.println("1. NEW: " + t.getState()); // NEW

        // State 2: RUNNABLE (after start)
        t.start();
        System.out.println("2. RUNNABLE: " + t.getState()); // RUNNABLE

        // State 3: TIMED_WAITING (during sleep)
        Thread.sleep(10); // Let t enter sleep
        System.out.println("3. TIMED_WAITING: " + t.getState()); // TIMED_WAITING

        // State 4: TERMINATED (after completion)
        t.join();
        System.out.println("4. TERMINATED: " + t.getState()); // TERMINATED
    }
}
\`\`\`

### Level 2 — Intermediate: BLOCKED vs WAITING Demo
\`\`\`java
public class BlockedVsWaiting {
    static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        // Thread that holds the lock for 2 seconds
        Thread holder = new Thread(() -> {
            synchronized (lock) {
                try { Thread.sleep(2000); } catch (InterruptedException e) {}
            }
        });

        // Thread that tries to acquire the same lock
        Thread blocker = new Thread(() -> {
            synchronized (lock) {} // Will be BLOCKED until holder releases
        });

        // Thread that calls wait() on the lock
        Thread waiter = new Thread(() -> {
            synchronized (lock) {
                try { lock.wait(2000); } catch (InterruptedException e) {} // WAITING
            }
        });

        holder.start();
        Thread.sleep(50); // Let holder acquire lock

        blocker.start();
        Thread.sleep(50);
        System.out.println("blocker state: " + blocker.getState()); // BLOCKED

        // waiter needs lock first — wait for holder to release
        holder.join();
        waiter.start();
        Thread.sleep(50);
        System.out.println("waiter state: " + waiter.getState()); // TIMED_WAITING
        waiter.join(); blocker.join();
    }
}
\`\`\`

### Level 3 — Advanced: Thread State Machine Monitor
\`\`\`java
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

// Production: monitor thread states to detect deadlocks and starvation
public class ThreadStateMonitor {
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public void startMonitoring(Collection<Thread> threads) {
        scheduler.scheduleAtFixedRate(() -> {
            Map<Thread.State, Long> stateCounts = threads.stream()
                .collect(Collectors.groupingBy(Thread::getState, Collectors.counting()));

            long blocked = stateCounts.getOrDefault(Thread.State.BLOCKED, 0L);
            long waiting = stateCounts.getOrDefault(Thread.State.WAITING, 0L);

            // Alert: too many blocked threads = lock contention
            if (blocked > threads.size() * 0.5) {
                System.err.println("⚠️ HIGH CONTENTION: " + blocked + " threads BLOCKED");
                detectDeadlock();
            }
            // Alert: too many waiting threads = potential starvation
            if (waiting > threads.size() * 0.8) {
                System.err.println("⚠️ STARVATION RISK: " + waiting + " threads WAITING");
            }
        }, 0, 5, TimeUnit.SECONDS);
    }

    private void detectDeadlock() {
        ThreadMXBean tmx = ManagementFactory.getThreadMXBean();
        long[] deadlocked = tmx.findDeadlockedThreads();
        if (deadlocked != null) {
            ThreadInfo[] info = tmx.getThreadInfo(deadlocked, true, true);
            System.err.println("🔴 DEADLOCK DETECTED:");
            for (ThreadInfo ti : info) System.err.println("  " + ti.getThreadName() + ": " + ti.getThreadState());
        }
    }

    public void stop() { scheduler.shutdown(); }
}
\`\`\`

### Level 4 — Expert / Production: Virtual Thread Lifecycle (Java 21+)
\`\`\`java
import java.util.concurrent.*;

// Virtual threads: lightweight, ~100 bytes each vs ~1MB for platform threads
// Lifecycle addition: MOUNTED (on carrier thread) / UNMOUNTED (waiting, carrier freed)
public class VirtualThreadDemo {
    public static void main(String[] args) throws InterruptedException {
        int TASKS = 10_000;
        ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();

        long start = System.nanoTime();
        CountDownLatch latch = new CountDownLatch(TASKS);

        for (int i = 0; i < TASKS; i++) {
            virtualExecutor.submit(() -> {
                try {
                    // Virtual thread UNMOUNTS here — carrier thread freed to run other virtual threads
                    Thread.sleep(100); // I/O simulation
                    // Virtual thread REMOUNTS when sleep completes
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        long elapsed = (System.nanoTime() - start) / 1_000_000;
        System.out.println("10,000 tasks in " + elapsed + "ms with virtual threads");
        // With platform threads (ThreadPoolExecutor, 200 threads): ~5,000ms
        // With virtual threads: ~105ms — because virtual threads unmount during sleep

        virtualExecutor.shutdown();

        // Key difference from platform threads: do NOT use thread-local storage for pooling
        // Virtual threads are created per-task, not pooled — ThreadLocal per-task is wasteful
        // Use ScopedValue (Java 21+) instead of ThreadLocal for virtual thread contexts
    }
}
\`\`\``,

    realworld: `## REAL_WORLD

### How Netty Uses Thread State Management for Non-Blocking I/O

Netty (used by Cassandra, Elasticsearch, gRPC) achieves millions of concurrent connections on a small fixed thread pool by keeping threads in RUNNABLE state (processing events) instead of WAITING/BLOCKED (waiting for I/O). Traditional thread-per-connection: 10K connections = 10K threads, mostly WAITING for I/O = 10GB RAM. Netty: 10K connections = 8 threads (one per CPU core), always RUNNABLE processing I/O events via Selector.

\`\`\`java
// Netty EventLoop pattern — thread stays RUNNABLE; selector wakes it when I/O is ready
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;

public class NettyServer {
    // bossGroup: accepts connections (usually 1 thread)
    // workerGroup: handles I/O (typically 2 * CPU cores)
    private final EventLoopGroup bossGroup   = new NioEventLoopGroup(1);
    private final EventLoopGroup workerGroup = new NioEventLoopGroup(); // Default: 2*cores

    public void start(int port) throws Exception {
        ServerBootstrap b = new ServerBootstrap()
            .group(bossGroup, workerGroup)
            .channel(NioServerSocketChannel.class)
            .childHandler(new ChannelInitializer<SocketChannel>() {
                @Override
                protected void initChannel(SocketChannel ch) {
                    ch.pipeline().addLast(new SimpleChannelInboundHandler<Object>() {
                        @Override
                        protected void channelRead0(ChannelHandlerContext ctx, Object msg) {
                            // NEVER block here — you are on the EventLoop thread!
                            // Blocking puts thread into WAITING/BLOCKED, stalling ALL channels
                            ctx.writeAndFlush(msg); // Non-blocking write
                        }
                    });
                }
            });
        b.bind(port).sync();
    }

    public void shutdown() { bossGroup.shutdownGracefully(); workerGroup.shutdownGracefully(); }
}
\`\`\`

### Production Gotcha: Blocking an EventLoop Thread

\`\`\`java
// ❌ DANGEROUS — blocking the Netty EventLoop thread
protected void channelRead0(ChannelHandlerContext ctx, Object msg) {
    String result = database.query(msg.toString()); // BLOCKS! Thread goes WAITING
    // ALL other channels on this EventLoop are now frozen until query returns!
    ctx.writeAndFlush(result);
}

// ✅ PRODUCTION-SAFE — offload blocking work to a separate executor
protected void channelRead0(ChannelHandlerContext ctx, Object msg) {
    ctx.executor().execute(() -> {          // EventLoop thread queues the work
        CompletableFuture.supplyAsync(() -> database.query(msg.toString()), blockingPool)
            .thenAccept(result -> ctx.writeAndFlush(result)); // Back on EventLoop when done
    });
}
\`\`\`

### Performance Characteristics
| Thread Model | Threads for 10K connections | RAM | CPU utilization |
|-------------|---------------------------|-----|----------------|
| Thread-per-connection | 10,000 | ~10GB | Poor (mostly WAITING) |
| Netty NIO | 16 | ~16MB | Excellent (always RUNNABLE) |
| Java 21 Virtual | 10,000 virtual / 16 carrier | ~1GB | Excellent (unmount on block) |`,

    interview: `## INTERVIEW

**Q1 (Junior): What are the 6 Java thread states?**
A: NEW (created, not started), RUNNABLE (running or ready to run), BLOCKED (waiting for a monitor lock), WAITING (indefinite wait for notify/join/unpark), TIMED_WAITING (waiting with a timeout), and TERMINATED (finished). The key confusion is RUNNABLE — it means "eligible to run", NOT "currently on CPU". A thread can be RUNNABLE for seconds without executing if the OS scheduler has not given it CPU time.

**Q2 (Junior): What is the difference between BLOCKED and WAITING?**
A: BLOCKED means a thread is waiting to acquire a \`synchronized\` monitor that another thread holds — it is in the monitor's entry set. WAITING means a thread has voluntarily suspended itself by calling \`Object.wait()\`, \`Thread.join()\`, or \`LockSupport.park()\` — it is in the monitor's wait set. The key difference: a BLOCKED thread will automatically try to re-acquire the lock as soon as it is released; a WAITING thread must be explicitly woken via \`notify()\`/\`notifyAll()\`/\`unpark()\`.
\`\`\`java
// BLOCKED: thread B waits for thread A to release synchronized lock
synchronized (lock) { /* thread A holds this */ }  // Thread B is BLOCKED here

// WAITING: thread calls wait() after acquiring lock
synchronized (lock) { lock.wait(); }  // Thread voluntarily WAITING, releases lock
\`\`\`

**Q3 (Mid): How does Thread.interrupt() interact with thread states?**
A: \`interrupt()\` sets the thread's interrupt flag. If the thread is in WAITING or TIMED_WAITING (sleep/wait/join), it immediately wakes up and throws \`InterruptedException\`, clearing the flag. If the thread is BLOCKED waiting for a monitor, \`interrupt()\` sets the flag but does NOT unblock the thread — it remains BLOCKED until the lock is available. If the thread is RUNNABLE, the interrupt flag is set and the thread can check \`Thread.interrupted()\` or \`isInterrupted()\` at its convenience. This is why interruption is cooperative, not forceful.

**Q4 (Mid): What is a spurious wakeup and how do you handle it?**
A: A spurious wakeup is when a thread in WAITING state wakes up without \`notify()\` being called. The JVM specification explicitly permits this for performance reasons on certain JVM implementations. The correct pattern is always to check the condition in a loop after waking:
\`\`\`java
// ❌ Wrong: single if — vulnerable to spurious wakeup
synchronized (lock) { if (!condition) lock.wait(); }

// ✅ Correct: loop re-checks condition after every wakeup
synchronized (lock) { while (!condition) lock.wait(); }
\`\`\`

**Q5 (Senior): How do virtual threads (Project Loom) change the thread lifecycle model?**
A: Virtual threads add a MOUNTED/UNMOUNTED distinction not visible in \`Thread.State\`. A virtual thread runs on a carrier (platform) thread. When the virtual thread blocks (I/O, \`Thread.sleep()\`), it is UNMOUNTED from the carrier — the carrier is freed to run another virtual thread. When the I/O completes, the virtual thread is REMOUNTED on a possibly different carrier. From \`Thread.getState()\` perspective, the virtual thread shows TIMED_WAITING during sleep — identical to platform threads. The real difference: with virtual threads you can have 10M WAITING virtual threads using only 16 carrier threads, because WAITING virtual threads consume no carrier thread.

**Q6 (Senior): How do you diagnose a deadlock using thread state information?**
A: Use \`ThreadMXBean.findDeadlockedThreads()\` which returns thread IDs involved in deadlock. A deadlock appears as two or more threads in BLOCKED state, each waiting for a lock held by another thread in the cycle. Thread dumps (kill -3 on Unix, jstack PID) show each thread's state and the lock it is waiting for. Pattern: Thread A BLOCKED waiting for lock held by Thread B, Thread B BLOCKED waiting for lock held by Thread A — cycle = deadlock. Prevention: always acquire locks in a consistent global ordering.`,

    feynman: `## FEYNMAN CHECK

### Explain Thread Lifecycle States Like I'm 10 Years Old
> Imagine 6 kids in a classroom: one is sleeping at their desk (WAITING), one is standing in line for the teacher's attention (BLOCKED), one is doing their homework (RUNNABLE), one just sat down and hasn't started yet (NEW), one fell asleep but set an alarm (TIMED_WAITING), and one finished everything and went home (TERMINATED). The non-obvious part: RUNNABLE doesn't mean "actually working" — it means "ready to work if the teacher picks you." This is why a thread can be RUNNABLE but use 0% CPU — the OS scheduler hasn't given it a turn yet. This is why high BLOCKED counts in a thread dump indicate lock contention, not deadlock.

---

### 5 Deep Conceptual Questions

**Q1: What is the fundamental difference between BLOCKED and WAITING at the OS level?**
> **A:** BLOCKED is a JVM-level state where the thread is waiting for a Java monitor (\`synchronized\`). Under the hood, the JVM uses OS mutexes — the thread is put in the OS mutex wait queue and gets an OS context switch. WAITING is triggered by \`Object.wait()\` — the thread releases the monitor, moves to the wait set, and the OS puts it in a sleep state. The key difference at OS level: a BLOCKED thread has NOT released the lock and will be woken by the OS when the lock is released; a WAITING thread HAS released the lock and will only be woken by explicit \`notify()\` followed by re-acquiring the lock.

**Q2: ONE mental model for thread state transitions.**
> **A:** Think of each thread as having an "action queue" and a "resource queue." RUNNABLE = in the action queue (ready to run). BLOCKED = in a resource queue waiting for a lock. WAITING/TIMED_WAITING = pulled out of all queues and suspended — only an explicit signal or timeout puts it back in the action queue. NEW = not yet in any queue. TERMINATED = removed from all queues permanently. Every \`synchronized\`, \`wait()\`, \`sleep()\`, and \`join()\` is a queue transition.

**Q3: Misconception with code — RUNNABLE always means executing.**
> **A:** A thread can be RUNNABLE while burning 0% CPU.
> \`\`\`java
> Thread t = new Thread(() -> { while(true); }); // Infinite loop — always RUNNABLE
> t.start();
> // OR:
> Thread t2 = new Thread(() -> { Thread.sleep(60_000); }); // In TIMED_WAITING, not RUNNABLE
> // getState() == TIMED_WAITING, CPU = 0%
> // Confusion: RUNNABLE does NOT mean "on CPU"
> \`\`\`

**Q4: How does the thread scheduler interact with thread states?**
> **A:** The OS scheduler only sees RUNNABLE threads. BLOCKED, WAITING, and TIMED_WAITING threads are parked by the JVM and removed from the OS run queue — they consume no CPU. When a WAITING thread is notified or a BLOCKED thread gets the lock, the JVM calls \`pthread_mutex_unlock\` (Linux) or \`SetEvent\` (Windows) to put the thread back in the OS ready queue, transitioning it to RUNNABLE. The JVM does not control WHEN the thread actually runs after becoming RUNNABLE — that is the OS scheduler's decision (based on priority, time slices, load).

**Q5: Senior one-liner.**
> **A:** "A Java thread transitions through 6 states — NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED — where BLOCKED represents lock contention (monitor-held by another thread), WAITING represents voluntary suspension pending explicit notification, and RUNNABLE represents OS-scheduler eligibility (not guaranteed CPU time) — which is why a thread dump showing high BLOCKED counts diagnoses lock contention, not deadlock."`,

    build: `## BUILD

### 🏗️ Mini Project: Thread State Visualizer

**What you will build:** A Java program that spawns threads in every state and prints a live state table every 500ms.
**Why this project:** Makes all 6 states tangible and teaches you to read thread dumps.
**Time estimate:** 25 minutes

---

#### Step 2 — Core: Spawn a Thread in Each State
\`\`\`java
import java.util.*;
import java.util.concurrent.*;

public class ThreadStateVisualizer {
    static final Object SHARED_LOCK = new Object();

    public static void main(String[] args) throws InterruptedException {
        Map<String, Thread> threads = new LinkedHashMap<>();

        // NEW — created but not started
        threads.put("NEW", new Thread(() -> {}));

        // RUNNABLE — busy-spinning
        threads.put("RUNNABLE", new Thread(() -> { while (!Thread.interrupted()); }));

        // TIMED_WAITING — sleeping
        threads.put("TIMED_WAITING", new Thread(() -> {
            try { Thread.sleep(60_000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }));

        // WAITING — waiting on lock without timeout
        threads.put("WAITING", new Thread(() -> {
            synchronized (SHARED_LOCK) {
                try { SHARED_LOCK.wait(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        }));

        // BLOCKED — waiting to acquire lock held by WAITING thread
        Thread lockHolder = new Thread(() -> {
            synchronized (SHARED_LOCK) {
                try { Thread.sleep(60_000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        });
        threads.put("BLOCKED_holder", lockHolder);
        threads.put("BLOCKED", new Thread(() -> { synchronized (SHARED_LOCK) {} }));

        // Start all except NEW
        lockHolder.start();
        Thread.sleep(50); // Let holder acquire lock
        threads.values().stream().filter(t -> t.getState() == Thread.State.NEW && t != threads.get("NEW")).forEach(Thread::start);
        threads.get("RUNNABLE").start();
        threads.get("TIMED_WAITING").start();
        threads.get("WAITING").start();
        threads.get("BLOCKED").start();

        // Print state table
        for (int i = 0; i < 5; i++) {
            System.out.println("\\n=== Thread States (t=" + i + ") ===");
            threads.forEach((name, t) -> System.out.printf("  %-20s: %s%n", name, t.getState()));
            Thread.sleep(500);
        }

        // Cleanup
        threads.values().forEach(Thread::interrupt);
    }
}
\`\`\`

**Expected Output:**
\`\`\`
=== Thread States (t=0) ===
  NEW                 : NEW
  RUNNABLE            : RUNNABLE
  TIMED_WAITING       : TIMED_WAITING
  WAITING             : WAITING
  BLOCKED_holder      : TIMED_WAITING
  BLOCKED             : BLOCKED
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** Name all 6 Java thread states and describe the transition from NEW to TERMINATED in one sentence each.

**Q2:** What is the difference between BLOCKED and WAITING? Which one holds the monitor?

**Q3:** Write code that creates a thread in TIMED_WAITING state and prints its state.

---

### Day 3 — Comprehension

**Q4:** Can a thread transition directly from WAITING to BLOCKED? When does this happen?

**Q5:** What is a spurious wakeup? Write the correct wait loop pattern.

**Q6:** You see 50 threads in BLOCKED state in a thread dump. What is the root cause? How do you fix it?

---

### Day 7 — Application

**Q7:** Build a \`ThreadStateMonitor\` that polls a pool of threads every second and alerts when >50% are BLOCKED.

**Q8:** You are debugging a deadlock. What tool do you use? What state pattern in a thread dump indicates deadlock? Write the diagnosis steps.

**Q9:** Why does \`Thread.stop()\` exist but is deprecated? What state issues does it create?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ "Walk me through a Java thread from creation to termination, naming every state transition and what triggers it."

**Q11:** How does virtual thread MOUNTING/UNMOUNTING relate to the 6 Thread.State values? What is different about virtual thread state visibility?

**Q12:** ★ System design: "Your service has 500 threads, P99 latency 2s. Thread dumps show 400 threads BLOCKED on a single database connection pool lock. Design a fix that scales to 10M requests/day."`
  }

};





