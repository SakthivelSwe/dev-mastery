// Generates the remaining canonical LeetCode pattern MDX files.
const fs=require('fs');const path=require('path');
const dir=path.join(__dirname,'..','apps','web','content','leetcode-patterns');
const F=(slug,title,why,theory,viz,code,real,iv,fey,build,sr)=>`---
slug: "${slug}"
title: "${title}"
level: 3
---

## WHY
${why}

## THEORY
${theory}

## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "${viz}", "state": "leetcode-${slug}" }
\`\`\`

## CODE
${code}

## REAL_WORLD
${real}

## INTERVIEW
${iv}

## FEYNMAN CHECK
${fey}

## BUILD
${build}

## SPACED REVIEW
${sr}
`;
const SR='### Day 1 Recall\n**Q1:** Trigger. **Q2:** Cost. **Q3:** 10-line.\n### Day 3\n**Q4:** vs alt. **Q5:** bug. **Q6:** refactor.\n### Day 7\n**Q7:** apply. **Q8:** PR slow. **Q9:** degrade.\n### Day 14\n**Q10:** ★ classic. **Q11:** links. **Q12:** ★ at 10M.';
const files={
'monotonic-deque-pattern':F('monotonic-deque-pattern','Monotonic Deque Pattern',
'Sliding-window max/min by re-scanning is O(nk) — 100B ops on a 10M feed with k=10k. A monotonic deque keeps ordered candidates and expires stale indices for O(n). Storing values not indices breaks expiry.',
'Keep deque of indices with decreasing values; pop smaller from back, expire front past window.\n```mermaid\nflowchart TD\n A[for i]-->B[pop back while a<=cur]\n B-->C[push i]\n C-->D[front<i-k pop]\n D-->E[record front]\n```\n| Approach|Time|\n|--|--|\n|scan|O(nk)|\n|deque|O(n)|','FlowChart',
'### Level1\n```java\nwhile(!dq.isEmpty()&&a[dq.peekLast()]<=a[i])dq.pollLast();dq.offer(i);\n```\n### Level2 max\n```java\nif(dq.peek()<=i-k)dq.poll();if(i>=k-1)out[i-k+1]=a[dq.peek()];\n```\n### Level3 min symmetric\n### Level4 two deques diff<=limit',
'HFT rolling max bid. Gotcha: store indices.\n| Op|Time|\n|--|--|\n|window|O(n)|',
'**Q1:** both ends O(1). **Q2:** indices. **Q3:** once each. **Q4:** vs heap. **Q5:** subarray.',
'### Like 10 > Tallest stays, shorter leave when taller comes.\n**Q1** O(n) **Q2** indices **Q3** value bug **Q4** vs heap **Q5** def','### Window Max\n**Out:** `3 3 5 5 6 7`',SR),
'k-way-merge-pattern':F('k-way-merge-pattern','K-way Merge Pattern',
'Merging k sorted lists by concatenate+sort is O(N log N). A heap of k heads merges in O(N log k). Forgetting to push next breaks order.',
'Min-heap of one node per list; pop smallest, push its next.\n```mermaid\nflowchart TD\n A[heap k heads]-->B[pop min]\n B-->C[append]\n C-->D[push next]\n D-->B\n```','TreeVisualization',
'### Level1\n```java\nfor(var l:lists)if(l!=null)pq.add(l);\n```\n### Level2 merge\n```java\nwhile(!pq.isEmpty()){var n=pq.poll();tail.next=n;tail=n;if(n.next!=null)pq.add(n.next);}\n```\n### Level3 smallest range\n### Level4 kth smallest in matrix','Log aggregation merges sorted streams. Gotcha: comparator on value.\n| Op|Time|\n|--|--|\n|merge|O(N log k)|',
'**Q1:** heap k. **Q2:** push next. **Q3:** O(N log k). **Q4:** vs sort. **Q5:** matrix kth.',
'### Like10 > k sorted decks, take smallest top each time.\n**Q1** logk **Q2** push next **Q3** comp bug **Q4** vs sort **Q5** def','### Merge k\n**Out:** `1 1 2 3 4 4 5 6`',SR),
'topological-sort-pattern':F('topological-sort-pattern','Topological Sort Pattern',
'Ordering tasks with dependencies by guessing fails on cycles. Kahn BFS / DFS gives valid order O(V+E) and detects cycles. Build systems, course schedules depend on it.',
'Compute indegrees; queue zero-indegree; pop, decrement neighbors.\n```mermaid\nflowchart TD\n A[indeg]-->B[queue indeg0]\n B-->C[pop add order]\n C-->D[dec neighbors]\n D-->B\n```','FlowChart',
'### Level1 indeg\n```java\nfor(var e:adj.get(u))indeg[e]++;\n```\n### Level2 Kahn\n```java\nwhile(!q.isEmpty()){int u=q.poll();order.add(u);for(int v:adj.get(u))if(--indeg[v]==0)q.add(v);}\n```\n### Level3 cycle if order<n\n### Level4 course schedule II','Maven/Gradle order modules. Gotcha: cycle = no order.\n| Op|Time|\n|--|--|\n|sort|O(V+E)|',
'**Q1:** indegree. **Q2:** cycle detect. **Q3:** O(V+E). **Q4:** Kahn vs DFS. **Q5:** schedule.',
'### Like10 > Wear socks before shoes; order chores by what must come first.\n**Q1** dag **Q2** indeg **Q3** cycle **Q4** kahn/dfs **Q5** def','### Course Schedule\n**Out:** `[0,1,2,3]`',SR),
'dijkstra-pattern':F('dijkstra-pattern','Dijkstra Shortest Path Pattern',
'Shortest path with weights by BFS is wrong. Dijkstra greedily expands nearest via min-heap O((V+E)log V). Negative edges break it.',
'Pop min dist, relax neighbors, skip stale.\n```mermaid\nflowchart TD\n A[d=INF,src=0]-->B[pop min]\n B-->C[relax nbrs]\n C-->B\n```','NetworkDiagram',
'### Level1 init\n```java\nd[s]=0;pq.add(new int[]{0,s});\n```\n### Level2\n```java\nwhile(!pq.isEmpty()){var c=pq.poll();if(c[0]>d[c[1]])continue;for(var e:g[c[1]])if(d[c[1]]+e.w<d[e.to]){d[e.to]=d[c[1]]+e.w;pq.add(new int[]{d[e.to],e.to});}}\n```\n### Level3 path reconstruct\n### Level4 network delay','GPS routing. Gotcha: negatives → bellman.\n| Op|Time|\n|--|--|\n|sp|O((V+E)logV)|',
'**Q1:** greedy ok. **Q2:** heap. **Q3:** non-neg. **Q4:** vs bellman. **Q5:** lazy delete.',
'### Like10 > Always step to nearest unvisited city.\n**Q1** greedy **Q2** heap **Q3** neg bug **Q4** vs bf **Q5** def','### Dijkstra\n**Out:** `7`',SR),
'bit-manipulation-pattern':F('bit-manipulation-pattern','Bit Manipulation Pattern',
'XOR cancels pairs, masks pack flags, subsets enumerate via bits. Find single number XORs all in O(1) space.',
'Independent bits; mask/shift/XOR.\n```mermaid\nflowchart TD\n A[x^x=0]-->B[single survives]\n```','FlowChart',
'### Level1 single\n```java\nfor(int v:a)x^=v;\n```\n### Level2 count\n```java\nwhile(x!=0){x&=x-1;c++;}\n```\n### Level3 subsets via bits\n### Level4 two singles partition by bit','Permissions/Bloom filters. Gotcha: clear `x&=~(1<<i)`.\n| Op|Time|\n|--|--|\n|all|O(1)|',
'**Q1:** XOR. **Q2:** set/clear. **Q3:** kernighan. **Q4:** subsets. **Q5:** bloom.',
'### Like10 > Switches; pairs cancel, lone stays.\n**Q1** xor **Q2** mask **Q3** clear **Q4** count **Q5** def','### Bits\n**Out:** `1 3`',SR),
'greedy-pattern':F('greedy-pattern','Greedy Pattern',
'Pick local best when it equals global best — intervals, jump game, Huffman. Fails on {1,3,4} coins → DP.',
'Sort by key, take if compatible.\n```mermaid\nflowchart TD\n A[sort]-->B[take if fits]\n B-->A\n```','FlowChart',
'### Level1 intervals\n```java\nsort end; if start>=e take;\n```\n### Level2 jump\n```java\nfor reach=max(reach,i+a[i]);\n```\n### Level3 gas station\n### Level4 task scheduler','CDN bandwidth. Gotcha: greedy where DP needed.\n| Op|Time|\n|--|--|\n|greedy|O(n log n)|',
'**Q1:** choice prop. **Q2:** sort. **Q3:** exchange. **Q4:** vs dp. **Q5:** huffman.',
'### Like10 > Grab biggest now, no regrets.\n**Q1** prop **Q2** sort **Q3** fail **Q4** vs dp **Q5** def','### Activity Select\n**Out:** `ok`',SR),
'dp-subsequence-pattern':F('dp-subsequence-pattern','DP Subsequences (LCS/LIS) Pattern',
'LCS/LIS by brute force is exponential. DP aligns sequences O(nm) / O(n log n). Diff, autocomplete depend on it.',
'2D match diag+1 else max; LIS patience O(n log n).\n```mermaid\nflowchart TD\n A[match]-->B[diag+1]\n A-->C[else max left up]\n```','FlowChart',
'### Level1 LCS\n```java\nd[i][j]=eq?d[i-1][j-1]+1:max(d[i-1][j],d[i][j-1]);\n```\n### Level2 LIS dp\n### Level3 LIS binary O(n log n)\n### Level4 edit distance','git diff LCS. Gotcha: subsequence vs substring.\n| Op|Time|\n|--|--|\n|lcs|O(nm)|',
'**Q1:** subseq. **Q2:** lis nlogn. **Q3:** match rule. **Q4:** vs substring. **Q5:** diff.',
'### Like10 > Longest shared order ignoring gaps.\n**Q1** lcs **Q2** lis **Q3** rule **Q4** patience **Q5** def','### LCS\n**Out:** `3`',SR),
'dp-interval-pattern':F('dp-interval-pattern','DP Intervals Pattern',
'Matrix-chain, burst balloons need choosing split points; brute force exponential. Interval DP O(n^3) over lengths.',
'dp[i][j]=min over k of dp[i][k]+dp[k][j]+cost.\n```mermaid\nflowchart TD\n A[len]-->B[try k]\n B-->C[combine]\n```','FlowChart',
'### Level1 frame\n```java\nfor len; for i; for k;\n```\n### Level2 matrix chain\n### Level3 burst balloons\n### Level4 mcm path','Query planners. Gotcha: length outer loop.\n| Op|Time|\n|--|--|\n|iv|O(n^3)|',
'**Q1:** split. **Q2:** len loop. **Q3:** combine. **Q4:** vs lcs. **Q5:** balloons.',
'### Like10 > Best place to cut to pay least.\n**Q1** split **Q2** len **Q3** order **Q4** mcm **Q5** def','### Balloons\n**Out:** `167`',SR),
'dp-tree-pattern':F('dp-tree-pattern','DP on Trees Pattern',
'Tree max-sum/diameter need child answers first. Post-order DP O(n). Robber III, diameter.',
'Return tuple per node; parent combines.\n```mermaid\nflowchart TD\n A[leaf]-->B[parent combine]\n```','TreeVisualization',
'### Level1 height\n### Level2 diameter\n```java\nint d=l+r; best=max(best,d);\n```\n### Level3 robber III tuple\n### Level4 reroot','Org cost. Gotcha: recompute → memo.\n| Op|Time|\n|--|--|\n|tree|O(n)|',
'**Q1:** post-order. **Q2:** tuple. **Q3:** diameter. **Q4:** vs 1d. **Q5:** reroot.',
'### Like10 > Ask kids first, then decide.\n**Q1** post **Q2** tuple **Q3** dia **Q4** rob **Q5** def','### Diameter\n**Out:** `4`',SR),
'bst-pattern':F('bst-pattern','BST Patterns',
'BST gives ordered ops O(log n) balanced; inorder sorted. Validate, kth, range queries. Sorted insert degrades to list.',
'Left<root<right; inorder ascending.\n```mermaid\nflowchart TD\n A[root]-->B[<left]\n A-->C[>right]\n```','TreeVisualization',
'### Level1 search\n### Level2 validate range\n```java\nif(n.v<=lo||n.v>=hi)false;\n```\n### Level3 kth via inorder\n### Level4 LCA','TreeMap. Gotcha: balance.\n| Op|Time|\n|--|--|\n|search|O(log n)|',
'**Q1:** inorder sorted. **Q2:** validate. **Q3:** kth. **Q4:** vs heap. **Q5:** LCA.',
'### Like10 > Left smaller, right bigger; dive like dictionary.\n**Q1** order **Q2** validate **Q3** kth **Q4** balance **Q5** def','### Validate\n**Out:** `true`',SR),
'math-number-theory-pattern':F('math-number-theory-pattern','Math & Number Theory Pattern',
'GCD, sieve, modular pow show up in counting/crypto. Brute factor is slow; gcd O(log), sieve O(n log log n).',
'gcd Euclid; sieve marks composites; modpow square.\n```mermaid\nflowchart TD\n A[gcd a,b]-->B[gcd b,a%b]\n```','FlowChart',
'### Level1 gcd\n```java\nint gcd(int a,int b){return b==0?a:gcd(b,a%b);}\n```\n### Level2 sieve\n### Level3 modpow\n### Level4 modular inverse','Crypto modexp. Gotcha: overflow → long.\n| Op|Time|\n|--|--|\n|gcd|O(log)|',
'**Q1:** gcd. **Q2:** sieve. **Q3:** modpow. **Q4:** overflow. **Q5:** inverse.',
'### Like10 > Largest shared block; cross out multiples to find primes.\n**Q1** gcd **Q2** sieve **Q3** modpow **Q4** ovf **Q5** def','### Sieve\n**Out:** `2 3 5 7`',SR),
};
let n=0;for(const[k,v]of Object.entries(files)){fs.writeFileSync(path.join(dir,k+'.mdx'),v,'utf-8');n++;}
console.log('Wrote',n,'pattern files');

