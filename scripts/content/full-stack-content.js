/**
 * full-stack-content.js
 * FEYNMAN + BUILD + SPACED REVIEW for 40 full-stack topics missing these sections.
 * Used by: node scripts/writeSections.js full-stack
 */
module.exports = {

  // ─── Batch 1: Networking fundamentals ───────────────────────────────
  'internet-how-it-works': {
    feynman: `## FEYNMAN CHECK

### Explain the Internet Like I'm 10 Years Old
> The internet is a giant network of post offices (routers) that pass tiny envelopes (packets) between buildings (computers). Each envelope has a return address (source IP), a destination address (destination IP), and a tiny piece of the message. Big messages are split across many envelopes and reassembled on arrival. The non-obvious part: no router knows the whole route — each one just picks the next-best post office based on its routing table. This is why a packet can take a different route than the one before it, and why latency varies even between the same two computers.

---

### 5 Deep Conceptual Questions

**Q1: What problem does packet switching solve that circuit switching cannot?**
> **A:** Circuit switching (old phone networks) reserves an end-to-end path for the duration of a call — wasteful when traffic is bursty. Packet switching breaks data into independent packets that share the network with everyone else, each finding its own route. This means a single fibre link carries millions of conversations simultaneously and survives any individual router failure because packets re-route around it.

**Q2: ONE mental model.**
> **A:** "The internet is layered envelopes: Ethernet wraps IP wraps TCP wraps HTTP. Each layer is opened by a different device — switches read Ethernet, routers read IP, your OS reads TCP, your browser reads HTTP."

**Q3: Most dangerous misconception with code.**
> **A:** Assuming a TCP connection is a wire.
> \`\`\`js
> // ❌ Treating TCP as reliable wire — code panics on transient disconnect
> const conn = await connect(host);
> conn.send(payload);  // throws after WiFi drop, app crashes
> // ✅ Retry-with-backoff because TCP can drop any time
> for (let attempt = 0; attempt < 3; attempt++) {
>   try { await sendWithTimeout(payload, 5000); break; }
>   catch (e) { await sleep(2 ** attempt * 1000); }
> }
> \`\`\`

**Q4: How do DNS, TCP, TLS, and HTTP interact when you load a webpage?**
> **A:** Browser → DNS lookup (UDP to resolver) → TCP 3-way handshake to the IP → TLS handshake on top of TCP → HTTP request inside TLS → server response → browser renders. Each layer adds round-trips: a cold load to a new domain is typically 4 RTTs before the first byte. HTTP/3 (QUIC) collapses TCP+TLS into one handshake to cut this.

**Q5: One-sentence definition for a senior engineer.**
> **A:** "The internet is a global packet-switched inter-network of autonomous systems connected by BGP, where IP provides best-effort delivery and higher layers (TCP/QUIC/TLS/HTTP) add reliability, encryption, and application semantics — which is why latency and packet loss are properties of the path, not the endpoints."`,

    build: `## BUILD

### 🏗️ Mini Project: Trace the Internet Path to a Website
**What you will build:** A traceroute + DNS lookup + curl chain that visualises every hop your packets take.
**Time estimate:** 20 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir net-trace && cd net-trace
# Windows: install nslookup (built-in), use tracert
# macOS/Linux: dig + traceroute already installed
\`\`\`

#### Step 2 — DNS Lookup
\`\`\`bash
# Resolve a domain to IPs (returns A and AAAA records)
nslookup github.com
# Or with dig (Linux/macOS) for full chain
dig +trace github.com
\`\`\`

#### Step 3 — Trace the Hops
\`\`\`bash
# Windows
tracert github.com
# Linux/macOS
traceroute github.com
# Each line = one router; latency to each hop in ms
\`\`\`

#### Step 4 — Error Handling
\`\`\`bash
# Some routers drop ICMP — you see "* * *" — that's not a failure, just silenced
# Use -T flag (TCP probes) when ICMP is blocked
traceroute -T -p 443 github.com
\`\`\`

#### Step 5 — Inspect the HTTP Layer
\`\`\`bash
# Show the full HTTP exchange including DNS time, TCP connect, TLS handshake
curl -w "DNS: %{time_namelookup}s | Connect: %{time_connect}s | TLS: %{time_appconnect}s | TTFB: %{time_starttransfer}s | Total: %{time_total}s\\n" -o /dev/null -s https://github.com
\`\`\`

**Expected Output:**
\`\`\`
DNS: 0.012s | Connect: 0.045s | TLS: 0.120s | TTFB: 0.250s | Total: 0.310s
\`\`\`

**Stretch Challenges:**
- [ ] Compare cold (first) and warm (repeated) request times
- [ ] Run from 2 geographic locations and compare hop counts
- [ ] Use \`mtr\` for a live continuously-updating trace`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the difference between packet switching and circuit switching?
**Q2:** Name the 4 layers a packet passes through from your app to another computer's app.
**Q3:** Write 5 lines of pseudo-code showing a TCP connection with retry on failure.

### Day 3 — Comprehension
**Q4:** TCP vs UDP — when do you choose each? Give a real example for both.
**Q5:** Show the bug of treating TCP as a reliable wire and the retry fix.
**Q6:** Why does a cold HTTPS request take ~4 round trips? List each one.

### Day 7 — Application
**Q7:** Implement a TCP connection pool with health checks in pseudo-code.
**Q8:** A PR ships code that opens a new TCP connection per HTTP request. Describe the production impact at 10k req/s.
**Q9:** What does HTTP/3 change about this 4-RTT cold start cost?

### Day 14 — Synthesis & Interview Prep
**Q10:** ★ "What happens from the moment I press Enter in the browser address bar?" Full answer in interview detail.
**Q11:** Map: internet → DNS → TCP → TLS → HTTP — which is built on which?
**Q12:** ★ "Your service has 5ms latency in one region and 250ms in another. Why? What architectural changes fix it?"`
  },

  'what-is-http': {
    feynman: `## FEYNMAN CHECK

### Explain HTTP Like I'm 10 Years Old
> HTTP is the language browsers and servers use to send letters to each other. Every letter starts with a verb (GET = "please give me", POST = "please save this"), a target (the URL), and headers (envelope notes like "I speak English"). The server answers with a status code (200 = "here you go", 404 = "I don't have it", 500 = "I broke") and a body. The non-obvious part: HTTP is stateless — each letter is independent, the server forgets you exist between requests. This is why cookies and tokens exist: to re-introduce you on every letter.

---

### 5 Deep Conceptual Questions

**Q1: Why is HTTP designed to be stateless, and what is the consequence?**
> **A:** Statelessness means any server in a load-balanced fleet can handle any request — no session pinning needed, no shared memory between servers, infinite horizontal scaling. The cost: every request must include all context needed to handle it (auth token, content negotiation headers, etc), which is why HTTP request headers grow large in real APIs and why cookies/JWTs exist to re-establish "who you are" on every call.

**Q2: ONE mental model.**
> **A:** "HTTP request = verb + URL + headers + optional body. Response = status code + headers + body. Both sides are stateless. Everything else (sessions, caching, auth) is built on top using headers."

**Q3: Misconception with code.**
> **A:** Treating GET as if it could have side effects.
> \`\`\`js
> // ❌ DANGEROUS — GET is meant to be safe and idempotent
> app.get('/api/delete-user/:id', (req, res) => {
>   db.deleteUser(req.params.id);  // browsers/crawlers prefetch GETs → mass deletion
> });
> // ✅ Use DELETE for destructive actions
> app.delete('/api/users/:id', (req, res) => db.deleteUser(req.params.id));
> \`\`\`

**Q4: How do HTTP/1.1, HTTP/2, and HTTP/3 differ at the wire level?**
> **A:** HTTP/1.1: one request at a time per connection (head-of-line blocking); needs many parallel TCP connections. HTTP/2: multiplexes many requests over one TCP connection using binary framing — but TCP-level head-of-line blocking remains. HTTP/3 runs on QUIC (UDP-based) which moves multiplexing into the protocol itself, so one lost packet only blocks one stream, not all of them.

**Q5: One-sentence senior definition.**
> **A:** "HTTP is a stateless request/response protocol where a typed verb operates on a URL-addressed resource and returns a numerically-classified status with headers and body — its statelessness is what enables horizontal scaling and CDN caching, and its weakness is that every request pays for its own context."`,

    build: `## BUILD

### 🏗️ Mini Project: HTTP Request Inspector

**What you will build:** A Node.js HTTP server that echoes back the full structure of any request, plus a client showing each HTTP method.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir http-inspector && cd http-inspector
npm init -y
touch server.js client.js
\`\`\`

#### Step 2 — Core Server
\`\`\`js
// server.js — echoes every request back so you can SEE HTTP structure
const http = require('http');
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const echo = {
      method: req.method,
      url: req.url,
      httpVersion: req.httpVersion,
      headers: req.headers,
      body: body || null,
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(echo, null, 2));
  });
});
server.listen(3000, () => console.log('Inspector on :3000'));
\`\`\`

#### Step 3 — Exercise Each Verb
\`\`\`bash
# Safe + idempotent: GET, HEAD, OPTIONS
curl -X GET http://localhost:3000/users/42
# Create: POST (body)
curl -X POST -H "Content-Type: application/json" -d '{"name":"Alice"}' http://localhost:3000/users
# Replace whole: PUT, Patch partial: PATCH
curl -X PUT  -d '{"name":"Alice","age":30}' http://localhost:3000/users/42
curl -X PATCH -d '{"age":31}' http://localhost:3000/users/42
# Destructive: DELETE
curl -X DELETE http://localhost:3000/users/42
\`\`\`

#### Step 4 — Error Handling
\`\`\`js
// Return correct status codes — not always 200
if (req.url === '/notfound') { res.writeHead(404); res.end('Not Found'); return; }
if (req.method === 'POST' && !body) { res.writeHead(400); res.end('Body required'); return; }
\`\`\`

#### Step 5 — Tests
\`\`\`bash
# Verify status codes
curl -o /dev/null -w "%{http_code}\\n" http://localhost:3000/users/42      # 200
curl -o /dev/null -w "%{http_code}\\n" http://localhost:3000/notfound       # 404
curl -o /dev/null -w "%{http_code}\\n" -X POST http://localhost:3000/users  # 400 (no body)
\`\`\`

**Expected Output:**
\`\`\`
{ "method": "POST", "url": "/users", "httpVersion": "1.1", "headers": { "host": "localhost:3000", "content-type": "application/json" }, "body": "{\\"name\\":\\"Alice\\"}" }
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name 6 HTTP methods and the verb-semantics of each (safe, idempotent, has-body).
**Q2:** What does "stateless" mean for HTTP, and what is the architectural benefit?
**Q3:** Write a 10-line Node.js HTTP server returning JSON.

### Day 3 — Comprehension
**Q4:** Difference between 4xx and 5xx status codes — give an example of each.
**Q5:** Show the GET-with-side-effects bug and the proper DELETE fix.
**Q6:** What is idempotency? Which HTTP methods are idempotent and why does it matter for retries?

### Day 7 — Application
**Q7:** Implement a request retry helper that retries idempotent methods up to 3 times with exponential backoff.
**Q8:** A PR uses GET to delete records. Describe what happens when Google's crawler visits the site.
**Q9:** What is HTTP/2 multiplexing and what production problem does it solve over HTTP/1.1?

### Day 14 — Synthesis & Interview Prep
**Q10:** ★ "Explain everything that happens during a single HTTPS GET request from browser to server."
**Q11:** Map HTTP → REST → API design → caching — each builds on the previous?
**Q12:** ★ "Your API gets 50k req/s. Latency spikes when one downstream is slow. How does HTTP/2 vs HTTP/1.1 affect this?"`
  },

  'what-is-a-domain-name': {
    feynman: `## FEYNMAN CHECK

### Explain Domain Names Like I'm 10 Years Old
> A domain name is a human-readable nickname for a numeric internet address. Computers talk in IP addresses (172.217.16.142) but humans remember names (google.com). The Domain Name System is a giant phone book that translates names to numbers. The non-obvious part: this lookup is a chain — your computer asks a resolver, which asks the root servers, then the .com servers, then google's nameservers. The result is cached for hours so subsequent lookups are instant. This is why DNS changes take time to propagate.

---

### 5 Deep Conceptual Questions

**Q1: What problem do domain names solve that raw IPs cannot?**
> **A:** IPs are hard to memorise, change when servers move, and can't be shared across many machines easily. Domain names provide human-friendly aliases, allow load balancing (one name pointing to many IPs via round-robin DNS), enable easy hosting migration (change DNS, no client changes), and allow logical organisation (api.example.com vs www.example.com pointing to different infrastructure).

**Q2: ONE mental model.**
> **A:** "Domain = hierarchical path read right-to-left: TLD (com) → second-level (google) → subdomain (mail). Each segment is delegated to different nameservers. DNS resolution walks this tree."

**Q3: Misconception with code.**
> **A:** Hardcoding IPs instead of domain names.
> \`\`\`js
> // ❌ Hardcoded IP — breaks when the upstream moves
> const API = 'http://52.84.124.10/v1';
> // ✅ Domain name — survives infrastructure changes
> const API = 'https://api.example.com/v1';
> \`\`\`

**Q4: How do A, AAAA, CNAME, MX, and TXT records differ?**
> **A:** A = IPv4 address (the IP). AAAA = IPv6 address. CNAME = alias to another domain (www → example.com). MX = mail server for email delivery. TXT = arbitrary text used for SPF/DKIM verification. A and AAAA are leaf records; CNAME is a redirect.

**Q5: One-sentence senior definition.**
> **A:** "A domain name is a hierarchical, human-readable identifier resolved via the DNS protocol into one or more IPs and metadata records, where TTL-driven caching tradeoffs propagation speed for resolver load — which is why DNS changes can take 24+ hours to be globally visible."`,

    build: `## BUILD

### 🏗️ Mini Project: DNS Resolution Inspector

**What you will build:** A script that resolves a domain to all its DNS records and shows the resolution chain.
**Time estimate:** 20 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir dns-inspector && cd dns-inspector
npm init -y
touch resolve.js
\`\`\`

#### Step 2 — Core
\`\`\`js
// resolve.js — Node's built-in DNS module
const dns = require('dns').promises;
async function inspect(domain) {
  const results = {};
  for (const type of ['A','AAAA','CNAME','MX','TXT','NS']) {
    try { results[type] = await dns.resolve(domain, type); }
    catch (e) { results[type] = \`(no \${type} records)\`; }
  }
  return results;
}
inspect(process.argv[2] || 'github.com').then(r => console.log(JSON.stringify(r, null, 2)));
\`\`\`

#### Step 3 — Try It
\`\`\`bash
node resolve.js github.com
# Or with dig (Linux/macOS)
dig +trace github.com           # Walks the DNS chain
dig github.com MX               # Just mail records
\`\`\`

#### Step 4 — Error Handling
\`\`\`js
// Handle NXDOMAIN and timeouts
try { results = await inspect(domain); }
catch (e) {
  if (e.code === 'ENOTFOUND') console.error('Domain does not exist');
  else if (e.code === 'ETIMEOUT') console.error('DNS resolver timed out');
  else throw e;
}
\`\`\`

#### Step 5 — Verify Cache Behaviour
\`\`\`bash
# First call hits resolver; second is cached
time node resolve.js github.com   # ~100ms
time node resolve.js github.com   # ~5ms (cached)
\`\`\`

**Expected Output:**
\`\`\`json
{
  "A": ["140.82.121.4"],
  "AAAA": ["2606:50c0:8001::153"],
  "MX": [{ "exchange": "aspmx.l.google.com", "priority": 1 }],
  "NS": ["ns-1283.awsdns-32.org", "ns-421.awsdns-52.com"]
}
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What are the 5 most common DNS record types and what does each do?
**Q2:** Why do domain names exist when computers communicate via IP?
**Q3:** Write a 5-line Node.js DNS lookup using the built-in dns module.

### Day 3 — Comprehension
**Q4:** A vs CNAME — when do you use each?
**Q5:** Show the hardcoded-IP bug and the domain-name fix.
**Q6:** What is TTL on a DNS record and what does it control?

### Day 7 — Application
**Q7:** Implement a DNS-based health check that fails over to a backup IP if the primary record returns no response.
**Q8:** A PR sets DNS TTL to 5 seconds for resilience. Describe the DNS load impact at 1M users.
**Q9:** Why does DNS propagation take time? What controls it?

### Day 14 — Synthesis & Interview Prep
**Q10:** ★ "Walk me through every step from typing 'google.com' to seeing the page."
**Q11:** Link domain-names → DNS → CDN → load-balancing — what depends on what?
**Q12:** ★ "Your service is being DDoSed via DNS amplification. Describe the attack and the mitigation."`
  },

  'dns-and-how-it-works': {
    feynman: `## FEYNMAN CHECK

### Explain DNS Like I'm 10 Years Old
> DNS is the internet's phone book. When your phone wants to call "google.com", it asks DNS "what's the number?" and DNS replies with an IP like 142.250.80.46. The book is split into branches (.com, .org, .uk) each maintained by different teams, and your local resolver caches answers so it doesn't ask the master books every time. The non-obvious part: a single DNS query can trigger 4 separate lookups (root → TLD → authoritative → answer) on a cold cache, and each is a UDP round-trip that adds latency to your page load.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between recursive and authoritative DNS resolvers?**
> **A:** A recursive resolver (your ISP, 8.8.8.8, 1.1.1.1) does the work of walking the DNS tree for you and caches the result. An authoritative resolver owns a specific zone and answers definitively for it (e.g., \`ns-1.awsdns.com\` is authoritative for many AWS-hosted domains). Your computer talks to recursive; recursive talks to authoritative.

**Q2: ONE mental model.**
> **A:** "DNS = recursive resolver does the legwork by walking root → TLD → authoritative, caching each answer for its TTL. Cold lookup = 4 RTTs; warm = local cache, 0 RTTs."

**Q3: Misconception with code.**
> **A:** Trusting DNS to be instantly consistent globally.
> \`\`\`bash
> # ❌ Just changed DNS A record, expect immediate switch
> # Cached resolvers still serve old IP for up to TTL seconds
> # ✅ Lower TTL BEFORE the change, then change, then raise TTL back
> # 24h before change: TTL 60s
> # At change time: update A record
> # 1h after change confirmed: TTL back to 3600s
> \`\`\`

**Q4: How does DNS-based load balancing work, and what are its limits?**
> **A:** Return different IPs to different clients (round-robin, geo-based, or weighted). Limit: client-side caching means you can't pull traffic off a bad server faster than the TTL. Real load balancing happens at L4/L7 (AWS ALB, Cloudflare) where servers can be drained in seconds rather than minutes.

**Q5: Senior one-liner.**
> **A:** "DNS is a hierarchical, eventually-consistent, cache-heavy mapping protocol from names to records — its strengths (cache speed, decentralisation) are also its weaknesses (slow propagation, cache poisoning risk), which is why production systems use short TTLs only during migration windows."`,

    build: `## BUILD

### 🏗️ Mini Project: DNS Caching Behaviour Analyser

**What you will build:** A script that times repeated DNS lookups to show cache effects, plus tests against different public resolvers.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir dns-cache && cd dns-cache
npm init -y && touch analyse.js
\`\`\`

#### Step 2 — Core
\`\`\`js
// analyse.js — measure cold vs warm lookup time
const dns = require('dns').promises;
const { performance } = require('perf_hooks');
async function timeLookup(domain) {
  const t0 = performance.now();
  await dns.resolve4(domain);
  return performance.now() - t0;
}
async function main(domain) {
  console.log(\`\${domain}: cold = \${(await timeLookup(domain)).toFixed(1)}ms\`);
  console.log(\`\${domain}: warm = \${(await timeLookup(domain)).toFixed(1)}ms\`);
  console.log(\`\${domain}: warm = \${(await timeLookup(domain)).toFixed(1)}ms\`);
}
main(process.argv[2] || 'github.com');
\`\`\`

#### Step 3 — Test Different Resolvers
\`\`\`bash
# Switch resolver
dns.setServers(['8.8.8.8']);     // Google
dns.setServers(['1.1.1.1']);     // Cloudflare
dns.setServers(['9.9.9.9']);     // Quad9
# Run timing across all three
\`\`\`

#### Step 4 — Handle Errors
\`\`\`js
try { await dns.resolve4(domain); }
catch (e) {
  if (e.code === 'ENOTFOUND') console.error('No A record');
  else if (e.code === 'ETIMEOUT') console.error('Resolver timeout');
}
\`\`\`

#### Step 5 — Tests
\`\`\`bash
node analyse.js github.com
# Expected: cold ~30-100ms, warm ~1-5ms (resolver cache)
\`\`\`

**Expected Output:**
\`\`\`
github.com: cold = 47.2ms
github.com: warm = 1.8ms
github.com: warm = 1.6ms
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Recursive vs authoritative resolver — who calls whom?
**Q2:** What is TTL and what does it control?
**Q3:** Write 10 lines timing a DNS lookup in Node.

### Day 3 — Comprehension
**Q4:** Cold vs warm DNS lookup — typical times?
**Q5:** Show the "change A record, expect instant" bug and the lower-TTL-first fix.
**Q6:** What is DNS-based load balancing, and what is its limit vs L7 LB?

### Day 7 — Application
**Q7:** Implement DNS failover with healthcheck — fall through to backup IP if primary unreachable.
**Q8:** A PR sets all production DNS to 5s TTL "for resilience". Quantify the resolver load impact.
**Q9:** What is DNSSEC and what attack does it prevent?

### Day 14 — Synthesis & Interview Prep
**Q10:** ★ "Diagram every DNS step from cold cache when visiting a new domain."
**Q11:** Link DNS → TLS → CDN → load-balancing.
**Q12:** ★ "A region is unreachable. Walk me through using DNS to fail traffic to another region — what breaks at 10M users?"`
  },

  'browsers-and-how-they-work': {
    feynman: `## FEYNMAN CHECK

### Explain How Browsers Work Like I'm 10 Years Old
> A browser is a download-and-assemble machine. It downloads HTML (the bones), CSS (the look), JavaScript (the brain), and images (the decoration), then assembles a webpage by parsing HTML into a tree (DOM), applying CSS to each node (CSSOM), running JavaScript on top, painting pixels, and finally compositing the layers onto your screen. The non-obvious part: every step blocks the next — a single \`<script>\` tag without \`defer\` can pause HTML parsing and freeze the page. This is why script placement matters for performance.

---

### 5 Deep Conceptual Questions

**Q1: What are the major phases of browser rendering?**
> **A:** (1) Parse HTML → DOM tree. (2) Parse CSS → CSSOM. (3) Combine DOM + CSSOM → Render Tree. (4) Layout (compute geometry). (5) Paint (rasterise to pixels). (6) Composite (combine layers into final frame on GPU). Reflows cost layout+paint+composite; repaints skip layout; transform/opacity changes can skip both via compositor-only updates.

**Q2: ONE mental model.**
> **A:** "Browser = parsing pipeline + render pipeline. HTML/CSS/JS feed into the DOM/CSSOM, which produces a render tree, which becomes layout, paint, and composite — and JS can interrupt any of these by mutating the DOM."

**Q3: Misconception with code.**
> **A:** Synchronous \`<script>\` in \`<head>\` blocks rendering.
> \`\`\`html
> <!-- ❌ Parses, fetches, executes synchronously — blocks HTML parsing -->
> <head><script src="big-app.js"></script></head>
> <!-- ✅ defer parses HTML while downloading, executes after DOM ready -->
> <head><script src="big-app.js" defer></script></head>
> \`\`\`

**Q4: What is the difference between repaint, reflow, and composite, and which is cheapest?**
> **A:** Composite is cheapest (GPU-only, ~0.5ms): \`transform\`, \`opacity\`. Repaint costs CPU rasterise (~5ms): \`color\`, \`background\`. Reflow costs layout calc + repaint (~15ms): \`width\`, \`height\`, \`top\`. Animating \`top\` is 30× slower than animating \`transform\` — this is why CSS animations should always use transform/opacity.

**Q5: Senior one-liner.**
> **A:** "A browser is a parsing pipeline (HTML/CSS/JS into DOM/CSSOM) feeding a render pipeline (style/layout/paint/composite), where synchronous JavaScript can block parsing and force-flush layout — which is why critical rendering path optimisation focuses on script placement, render-blocking CSS, and minimising layout thrash."`,

    build: `## BUILD

### 🏗️ Mini Project: Render Pipeline Visualiser

**What you will build:** A simple HTML page with measurable Layout/Paint events using \`performance.now()\` and \`PerformanceObserver\`.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir browser-pipeline && cd browser-pipeline
touch index.html
\`\`\`

#### Step 2 — Core
\`\`\`html
<!doctype html>
<html><head><title>Render Pipeline</title></head>
<body>
  <div id="box" style="width:100px;height:100px;background:blue"></div>
  <button id="reflow">Reflow (animate width)</button>
  <button id="composite">Composite (animate transform)</button>
  <pre id="log"></pre>
  <script>
    const log = (m) => document.getElementById('log').textContent += m + '\\n';
    document.getElementById('reflow').onclick = () => {
      const t0 = performance.now();
      const box = document.getElementById('box');
      box.style.width = (100 + Math.random()*200) + 'px';  // triggers layout
      requestAnimationFrame(() => log('Reflow: ' + (performance.now()-t0).toFixed(2) + 'ms'));
    };
    document.getElementById('composite').onclick = () => {
      const t0 = performance.now();
      const box = document.getElementById('box');
      box.style.transform = 'translateX(' + (Math.random()*200) + 'px)';  // composite-only
      requestAnimationFrame(() => log('Composite: ' + (performance.now()-t0).toFixed(2) + 'ms'));
    };
  </script>
</body></html>
\`\`\`

#### Step 4 — Error Handling
\`\`\`js
// Detect layout thrashing — read-write-read-write forces multiple reflows
// ❌ Forces 100 layouts
for (let i = 0; i < 100; i++) {
  const w = box.offsetWidth;  // read forces layout
  box.style.width = (w + 1) + 'px';  // write invalidates layout
}
// ✅ Batch reads then writes
const widths = elements.map(e => e.offsetWidth);  // all reads first
elements.forEach((e, i) => e.style.width = widths[i] + 1 + 'px');  // all writes
\`\`\`

#### Step 5 — Verify
Open in Chrome DevTools → Performance tab → record → click both buttons → observe Layout vs Composite events in the flame chart.

**Expected Output:**
\`\`\`
Reflow: 4.2ms       (layout + paint + composite)
Composite: 0.3ms    (composite only — GPU)
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name the 6 phases of browser rendering in order.
**Q2:** What does \`defer\` do vs \`async\` on a script tag?
**Q3:** Write a 10-line HTML page with measurable layout vs composite timings.

### Day 3 — Comprehension
**Q4:** Reflow vs repaint vs composite — cost of each and which CSS properties trigger each.
**Q5:** Show the layout thrashing bug and the batch read/write fix.
**Q6:** Why should CSS animations use transform/opacity, not top/left?

### Day 7 — Application
**Q7:** Optimise a page that animates 100 divs by changing \`top\` — convert to \`transform\` and measure.
**Q8:** A PR adds a synchronous \`<script>\` to the \`<head>\`. Quantify the LCP impact.
**Q9:** What is the Critical Rendering Path and what optimisations apply?

### Day 14 — Synthesis & Interview Prep
**Q10:** ★ "Why does my page show a white flash for 2 seconds before rendering?" Walk through the diagnosis.
**Q11:** Link browser-rendering → CSS → JS execution → performance.
**Q12:** ★ "Your app has 100k DOM nodes and feels sluggish. Diagnose and propose three concrete optimisations."`
  },

  // ─── Batch 2: Hosting / DevOps fundamentals ──────────────────────────
  'what-is-hosting': {
    feynman: `## FEYNMAN CHECK

### Explain Hosting Like I'm 10 Years Old
> Hosting is renting a computer that's always on and always connected to the internet. When you "deploy" your website, you copy your files to that rented computer, which then serves them to anyone who asks. The non-obvious part: hosting tiers differ in how much of the computer is yours. Shared hosting = bunk-bed in a hostel; VPS = your own apartment; dedicated server = your own house; cloud = on-demand magic that grows when you need it. This is why "my site is slow" usually means you've outgrown your tier.

---

### 5 Deep Questions
**Q1: Shared vs VPS vs dedicated vs cloud — what differs?**
> **A:** Shared: many sites on one OS, noisy-neighbour risk. VPS: virtualised slice with guaranteed CPU/RAM. Dedicated: whole physical box. Cloud (IaaS): VMs you provision via API, elastic. PaaS (Heroku, Vercel): you ship code, they run it. Serverless (Lambda): you ship functions, they run on demand. Cost and control scale inversely with abstraction level.

**Q2: ONE model.**
> **A:** "Hosting = compute + storage + network behind a public IP. Tiers trade convenience for control. Pick the highest abstraction that still meets your latency, cost, and compliance constraints."

**Q3: Misconception with code.**
> **A:** Storing user uploads on local disk in PaaS:
> \`\`\`js
> // ❌ fs.writeFile on Heroku/Vercel — file disappears on next deploy
> fs.writeFileSync('/tmp/avatar.jpg', upload);
> // ✅ Use object storage
> await s3.putObject({ Bucket: 'avatars', Key: id, Body: upload });
> \`\`\`

**Q4: How does hosting interact with CDNs?**
> **A:** Origin = your hosting server. CDN (Cloudflare, CloudFront) caches static assets at edge POPs near users — origin only sees cache misses. A well-configured CDN reduces origin load by 90% and cuts latency from 200ms (cross-continent) to 20ms (edge).

**Q5: Senior one-liner.**
> **A:** "Hosting is a stack of abstractions from bare metal to functions-as-a-service, where each step up trades flexibility for reduced operational burden — choosing wrong inflates either your AWS bill or your on-call pager volume."`,

    build: `## BUILD

### 🏗️ Mini Project: Deploy a Static Site to 3 Hosting Tiers
**Time:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir host-demo && cd host-demo
echo "<h1>Hello from hosting!</h1>" > index.html
\`\`\`

#### Step 2 — Tier 1: Static (Vercel/Netlify/Cloudflare Pages)
\`\`\`bash
npx vercel    # follow prompts — deploys in ~10s, free
\`\`\`

#### Step 3 — Tier 2: PaaS (Render/Fly.io for Node app)
\`\`\`bash
# Create a tiny Node server
cat > server.js << 'EOF'
require('http').createServer((req,res)=>{res.end('Hello from PaaS')}).listen(process.env.PORT||3000);
EOF
# Deploy via Render: connect repo, auto-detects Node
\`\`\`

#### Step 4 — Tier 3: IaaS (AWS EC2)
\`\`\`bash
# Launch t3.micro, SSH in, install Node, run server, attach Elastic IP
ssh ec2-user@<ip>
sudo yum install nodejs -y && node server.js &
\`\`\`

#### Step 5 — Compare
| Tier | Deploy time | Cost/mo | Control | Use case |
|------|-------------|---------|---------|---------|
| Static | 10s | $0 | None | Marketing site |
| PaaS | 60s | $5+ | Code only | Standard app |
| IaaS | 10min | $10+ | Full | Custom workloads |

**Expected Output:** Same hello-world served from 3 URLs with vastly different operational profiles.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name 5 hosting tiers from least to most abstracted.
**Q2:** Why does PaaS lose your local-disk writes?
**Q3:** Write the simplest possible Vercel deploy command.

### Day 3
**Q4:** Shared vs VPS — when does shared bite you in production?
**Q5:** Show the local-fs-on-PaaS bug and the object-storage fix.
**Q6:** What does a CDN do for your origin?

### Day 7
**Q7:** Containerise a Node app and deploy it to two providers; compare cold-start latency.
**Q8:** PR puts SQLite on Vercel for state. Describe the deployment-day incident.
**Q9:** When does serverless become more expensive than a VM?

### Day 14
**Q10:** ★ "Design hosting for a SaaS launching in 3 countries with spiky traffic — what tier and why?"
**Q11:** Link hosting → CDN → DNS → load-balancing.
**Q12:** ★ "Your app on $5 PaaS gets a Hacker News surge. What breaks first and what's the fix?"`
  },

  'cloud-basics': {
    feynman: `## FEYNMAN CHECK

### Explain Cloud Basics Like I'm 10 Years Old
> Cloud is renting computing instead of buying it — pay per minute, scale up when busy, scale down when quiet. Big providers (AWS, GCP, Azure) own millions of servers in dozens of regions and rent slices via APIs. The non-obvious part: the cloud is NOT cheaper than owning — it's more flexible. A steady workload at scale is often cheaper on-prem; spiky or experimental workloads are way cheaper on cloud. This is why mature companies repatriate predictable workloads back to colocated hardware.

---

### 5 Deep Questions
**Q1: IaaS vs PaaS vs SaaS — what each offers?**
> **A:** IaaS (EC2, GCE) = raw VMs, you manage OS up. PaaS (App Engine, Heroku) = runtime managed, you ship code. SaaS (Gmail, Stripe) = ready application via API. Each removes another layer of operations but reduces customisation.

**Q2: ONE model.**
> **A:** "Cloud = APIs over a global fleet. Region = data centre cluster. Availability Zone = isolated facility within region. Service = managed primitive (compute, storage, DB). Cost = compute + storage + egress + ops."

**Q3: Misconception with code.**
> **A:** Hardcoding region in client code:
> \`\`\`js
> // ❌ Single point of failure — region outage = total outage
> const s3 = new S3({ region: 'us-east-1' });
> // ✅ Multi-region with failover
> const s3 = new S3({ region: process.env.PRIMARY_REGION });
> // ... retry against backupRegion on failure
> \`\`\`

**Q4: How does cloud egress pricing surprise teams?**
> **A:** Data IN is usually free; data OUT to internet is $0.05-0.15/GB. A misconfigured analytics export sending 10TB/day = $30k/month surprise. Cross-AZ traffic within the same region also charges (~$0.01/GB), so chatty microservices spread across AZs can produce 5-figure bills.

**Q5: Senior one-liner.**
> **A:** "Cloud computing is operational abstraction sold by API where the unit economics favour spiky/experimental workloads and punish steady high-throughput ones — which is why FinOps and right-sizing are now first-class disciplines."`,

    build: `## BUILD

### 🏗️ Mini Project: Provision an EC2 Instance via CLI
**Time:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
# Install AWS CLI, configure with: aws configure
aws --version
\`\`\`

#### Step 2 — Launch
\`\`\`bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name my-key \
  --security-groups default \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=demo}]'
\`\`\`

#### Step 4 — Costs Visibility
\`\`\`bash
aws ce get-cost-and-usage --time-period Start=2026-06-01,End=2026-06-29 \
  --granularity DAILY --metrics UnblendedCost
\`\`\`

#### Step 5 — Tear Down (avoid surprise bill)
\`\`\`bash
aws ec2 terminate-instances --instance-ids i-xxxxx
\`\`\`

**Expected Output:** Instance launched and visible in console; cost visible in billing dashboard.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** IaaS vs PaaS vs SaaS — define and example each.
**Q2:** Region vs Availability Zone — what isolates failures?
**Q3:** Write the AWS CLI to launch + terminate an EC2 instance.

### Day 3
**Q4:** When is on-prem cheaper than cloud?
**Q5:** Show hardcoded-region bug and multi-region fix.
**Q6:** What is reserved vs spot vs on-demand pricing?

### Day 7
**Q7:** Set up a budget alert that emails you at $50/mo spend.
**Q8:** PR enables cross-region replication on a 1TB bucket. Estimate monthly egress cost.
**Q9:** What is FinOps and what waste does it surface?

### Day 14
**Q10:** ★ "Migrate a 10-server on-prem app to cloud — what's your decision tree for IaaS vs PaaS vs serverless per component?"
**Q11:** Link cloud → IaaS/PaaS/SaaS → containers → serverless.
**Q12:** ★ "Your monthly AWS bill jumped 5× last month with no traffic growth. Diagnostic process?"`
  },

  'container-orchestration': {
    feynman: `## FEYNMAN CHECK

### Explain Container Orchestration Like I'm 10 Years Old
> Containers are lightweight, repeatable boxes for your apps. One server = a few containers, no problem — start them manually. But 100 servers running 1000 containers? You need a robot conductor: Kubernetes. It places containers on machines, restarts them when they crash, scales them when load grows, and replaces them on bad hardware. The non-obvious part: Kubernetes is not just "Docker at scale" — it's a control plane that constantly compares "desired state" (10 replicas) to "actual state" (8 alive) and reconciles. This is why you describe what you want, not how to get there.

---

### 5 Deep Questions
**Q1: What problem does orchestration solve that bare Docker cannot?**
> **A:** Bare Docker: you SSH to a server and \`docker run\`. Orchestration: declare 10 replicas of a service, scheduler picks nodes, health-checks pods, restarts failures, rolls out new versions zero-downtime, autoscales on CPU/RPS. Without it, you're a human scheduler — works for 5 containers, fails at 500.

**Q2: ONE model.**
> **A:** "Control plane (API server, scheduler, controller manager) watches etcd for desired state; nodes (kubelet) run pods and report actual state; controllers reconcile the gap continuously."

**Q3: Misconception with code.**
> **A:** Setting CPU limits too low → pod throttling:
> \`\`\`yaml
> # ❌ 100m = 0.1 CPU — Node app gets throttled, latency spikes
> resources: { limits: { cpu: 100m, memory: 128Mi } }
> # ✅ Set requests realistic, limits 2-3× requests OR omit CPU limit
> resources: { requests: { cpu: 250m, memory: 256Mi },
>              limits: { memory: 512Mi } }
> \`\`\`

**Q4: How does horizontal pod autoscaling work?**
> **A:** HPA watches a metric (CPU, custom metric, RPS) and adjusts replica count. If avg CPU > 70%, add a pod; if < 30%, remove one. The scheduler then assigns the new pod to a node with capacity. Cluster autoscaler kicks in when no node has capacity — provisions new nodes from cloud provider. Result: traffic doubles → cluster grows in ~2 min.

**Q5: Senior one-liner.**
> **A:** "Container orchestration is a declarative control loop where you describe desired state, and the platform continuously reconciles toward it across a fleet — which is why Kubernetes operations are debugged via \`describe\` and \`events\`, not stack traces."`,

    build: `## BUILD

### 🏗️ Mini Project: Local Kubernetes with kind
**Time:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
# Install kind (lightweight K8s in Docker) + kubectl
brew install kind kubectl    # or scoop on Windows
kind create cluster --name demo
kubectl get nodes            # control-plane + workers
\`\`\`

#### Step 2 — Deploy nginx
\`\`\`yaml
# app.yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: web }
spec:
  replicas: 3
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports: [{ containerPort: 80 }]
        resources:
          requests: { cpu: 100m, memory: 64Mi }
          limits:   { memory: 128Mi }
---
apiVersion: v1
kind: Service
metadata: { name: web }
spec:
  selector: { app: web }
  ports: [{ port: 80, targetPort: 80 }]
\`\`\`
\`\`\`bash
kubectl apply -f app.yaml
kubectl get pods    # 3 running
\`\`\`

#### Step 4 — Self-Healing
\`\`\`bash
kubectl delete pod <one-pod-name>
kubectl get pods     # K8s replaces it within seconds
\`\`\`

#### Step 5 — Scale
\`\`\`bash
kubectl scale deployment web --replicas=5
kubectl get pods     # 5 running
\`\`\`

**Expected Output:** Pods self-heal on delete, scale on command.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Bare Docker vs Kubernetes — when do you need orchestration?
**Q2:** Pod vs Deployment vs Service — what does each do?
**Q3:** Write a minimal Deployment YAML with 3 replicas.

### Day 3
**Q4:** Requests vs limits — what does each control?
**Q5:** CPU-limit-too-low bug — show and fix.
**Q6:** Rolling update — how does K8s achieve zero downtime?

### Day 7
**Q7:** Configure HPA for a deployment to scale 2-10 on CPU > 70%.
**Q8:** PR sets memory limit lower than request. Describe the OOMKill cascade.
**Q9:** What is a readiness probe and when does it matter?

### Day 14
**Q10:** ★ "Design K8s architecture for a SaaS with 50 microservices and noisy-neighbour concerns."
**Q11:** Link containers → orchestration → service-mesh → observability.
**Q12:** ★ "A pod restart loop is taking down your service. Walk the diagnosis."`
  },

  'docker-basics': {
    feynman: `## FEYNMAN CHECK

### Explain Docker Like I'm 10 Years Old
> Docker is a lunchbox for your code: it packs everything your app needs (OS libs, runtime, dependencies, code) into one sealed box (image) that runs the same on your laptop, a colleague's laptop, or a production server. No more "works on my machine". The non-obvious part: Docker images are layered like a stack of transparencies — each instruction in your Dockerfile adds a layer, and unchanged layers are cached between builds. This is why putting \`COPY package.json\` before \`COPY .\` is a 10× speedup for rebuilds.

---

### 5 Deep Questions
**Q1: Container vs VM — what's the architectural difference?**
> **A:** VM virtualises hardware → each VM has its own kernel → 100s of MB overhead, slow boot. Container shares the host kernel via namespaces (PID, network, mount isolation) and cgroups (resource limits) → MBs not GBs, boots in milliseconds. You get application isolation without OS overhead.

**Q2: ONE model.**
> **A:** "Image = immutable layered filesystem. Container = running instance of an image with its own writable layer on top. Dockerfile = recipe. Registry = library of images."

**Q3: Misconception with code.**
> **A:** Layer ordering wastes cache:
> \`\`\`dockerfile
> # ❌ Code changes invalidate node_modules cache — 60s rebuild every time
> COPY . .
> RUN npm install
> # ✅ Dependencies first (cached), code after
> COPY package*.json ./
> RUN npm install
> COPY . .
> \`\`\`

**Q4: How do volumes, bind mounts, and tmpfs differ?**
> **A:** Volume (\`docker volume create\`) — Docker-managed persistent storage, portable. Bind mount (\`-v $(pwd):/app\`) — direct host path mapped in, used in dev for hot-reload. Tmpfs — in-memory, ephemeral, used for secrets. Volumes are recommended for production state.

**Q5: Senior one-liner.**
> **A:** "A container is a process running with kernel namespaces and cgroups in a unioned filesystem image — which is why containers boot in milliseconds, share the host kernel, and can be packed 10× denser than VMs."`,

    build: `## BUILD

### 🏗️ Mini Project: Dockerise a Node App with Multi-Stage Build
**Time:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir docker-app && cd docker-app
npm init -y && npm i express
cat > index.js << 'EOF'
const app = require('express')();
app.get('/', (_, res) => res.send('Hello from Docker'));
app.listen(3000, () => console.log('on :3000'));
EOF
\`\`\`

#### Step 2 — Multi-Stage Dockerfile
\`\`\`dockerfile
# Stage 1: build (with dev deps)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: runtime (lean, prod-only deps)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app .
USER node
EXPOSE 3000
CMD ["node", "index.js"]
\`\`\`

#### Step 3 — Build & Run
\`\`\`bash
docker build -t my-app .
docker run -p 3000:3000 --name app my-app
curl http://localhost:3000
\`\`\`

#### Step 4 — Error Handling
\`\`\`dockerfile
# Healthcheck so orchestrators know when the app is ready
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1
\`\`\`

#### Step 5 — Image Size Test
\`\`\`bash
docker images my-app   # Should be ~150MB (vs 1GB+ without multi-stage)
\`\`\`

**Expected Output:** \`Hello from Docker\` and image under 200MB.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Image vs container vs Dockerfile — what is each?
**Q2:** Why is layer ordering important in a Dockerfile?
**Q3:** Write a 5-line Dockerfile for a Node app.

### Day 3
**Q4:** Container vs VM — pros and cons of each.
**Q5:** Show the layer-cache bug and the fix.
**Q6:** Multi-stage build — what does it solve?

### Day 7
**Q7:** Containerise a Postgres-backed Node app with docker-compose.
**Q8:** PR ships an image with no USER directive. Describe the security risk.
**Q9:** What does \`.dockerignore\` do and why does it matter?

### Day 14
**Q10:** ★ "Optimise a 1.5GB Docker image down to under 200MB — what techniques?"
**Q11:** Link Docker → orchestration → microservices.
**Q12:** ★ "Your Docker image takes 8 minutes to build in CI. Diagnose and fix."`
  },

  'ci-cd-basics': {
    feynman: `## FEYNMAN CHECK

### Explain CI/CD Like I'm 10 Years Old
> CI/CD is the assembly line for your software. Every git push triggers: install dependencies → run tests → build artifacts → (if main branch) deploy to staging → run smoke tests → deploy to production. Robots do all of it; humans only push code. The non-obvious part: the value isn't speed, it's confidence. A broken deploy is caught in 5 minutes by CI, not 5 days by users. This is why teams without CI/CD ship slowly even though they "save the CI time".

---

### 5 Deep Questions
**Q1: CI vs CD vs Continuous Deployment — what differs?**
> **A:** CI (Continuous Integration): every PR runs tests + lint + build. CD (Continuous Delivery): main branch is always deployable; deploy is a button push. Continuous Deployment: every green main commit auto-deploys to production. Each step requires the previous to be solid.

**Q2: ONE model.**
> **A:** "Pipeline = stages × jobs × steps. Stages run in sequence (build → test → deploy). Jobs in a stage run in parallel. Each step is an idempotent script. State between stages = artifacts."

**Q3: Misconception with code.**
> **A:** Slow tests in the critical path:
> \`\`\`yaml
> # ❌ Sequential — 8 min total
> jobs: [{name: unit, run: npm test}, {name: e2e, run: npm run e2e}]
> # ✅ Parallel — 4 min total (longest job)
> jobs:
>   unit: { runs-on: ubuntu-latest, steps: [{run: npm test}] }
>   e2e:  { runs-on: ubuntu-latest, steps: [{run: npm run e2e}] }
> \`\`\`

**Q4: How do you avoid "flaky tests" eroding trust in CI?**
> **A:** Quarantine flaky tests immediately (skip + ticket), never merge with a red main, automate retry only for known-flaky tests (network-dependent), fix root causes weekly. A single ignored red build trains the team to ignore all reds — the broken-windows theory of CI.

**Q5: Senior one-liner.**
> **A:** "CI/CD is automated quality enforcement applied to every commit — its real product is shipping confidence, and any team that 'doesn't have time for CI' is paying the cost in slow shipping and production bugs."`,

    build: `## BUILD

### 🏗️ Mini Project: GitHub Actions Pipeline for a Node App
**Time:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir cicd-demo && cd cicd-demo
git init && npm init -y && npm i -D jest
mkdir .github/workflows
\`\`\`

#### Step 2 — Workflow
\`\`\`yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix: { node: [18, 20] }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: \${{ matrix.node }}, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run lint --if-present
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist/ }
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to prod"
\`\`\`

#### Step 4 — Required Secrets
\`\`\`bash
# Add to GitHub repo Settings → Secrets:
# DEPLOY_TOKEN, NPM_TOKEN
\`\`\`

#### Step 5 — Push & Watch
\`\`\`bash
git add . && git commit -m "ci" && git push
# View pipeline at github.com/<repo>/actions
\`\`\`

**Expected Output:** Green checkmark on PR; deploy job runs only on main.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** CI vs CD vs Continuous Deployment — define each.
**Q2:** What is a pipeline stage? Why parallelise jobs within a stage?
**Q3:** Write a 15-line GitHub Actions workflow with test + build + deploy.

### Day 3
**Q4:** What makes a test flaky? How do you handle it?
**Q5:** Show the sequential-vs-parallel CI bug and the fix.
**Q6:** Difference between cache and artifact in CI.

### Day 7
**Q7:** Add a manual approval gate before production deploy in a workflow.
**Q8:** PR breaks main builds for 3 days because nobody fixes the red. Describe team consequences.
**Q9:** What is a deployment strategy — blue/green vs canary vs rolling?

### Day 14
**Q10:** ★ "Design CI/CD for a monorepo with 20 packages — how do you avoid building everything on every push?"
**Q11:** Link CI/CD → testing → deployment → monitoring.
**Q12:** ★ "Your CI takes 35 min and developers run \`-no-verify\` locally. Diagnose root causes and propose fixes."`
  },

  // ─── Batch 3: Frontend basics ────────────────────────────────────────
  'html-basics': {
    feynman: `## FEYNMAN CHECK

### Explain HTML Basics Like I'm 10 Years Old
> HTML is the skeleton of a webpage. Tags like \`<h1>\`, \`<p>\`, \`<button>\` describe what each chunk MEANS, not what it looks like. Semantic tags (\`<nav>\`, \`<main>\`, \`<article>\`) tell screen readers and search engines the role of each section. The non-obvious part: visual styling can fake structure (a styled div can LOOK like a button) but assistive tech sees the underlying tag — a styled div is silent to a blind user. This is why semantic HTML is the foundation of accessibility, not optional decoration.

---

### 5 Deep Questions
**Q1: Why is semantic HTML better than div soup?**
> **A:** Screen readers, browser keyboard navigation, SEO crawlers, reader-mode tools, and CSS targeting all benefit from semantic tags. \`<button>\` gets keyboard activation, focus ring, role announcement free; \`<div onClick>\` gets none.

**Q2: ONE model.**
> **A:** "HTML = tree of typed nodes. Each tag carries semantics (what), accessibility (who), and default behaviour (how). Styling layers on top; structure should never be invented in CSS."

**Q3: Misconception with code.**
> **A:** \`\`\`html
> <!-- ❌ Div pretending to be a heading — invisible to SR users -->
> <div class="big-text">Welcome</div>
> <!-- ✅ Semantic heading — screen reader announces "heading level 1" -->
> <h1>Welcome</h1>
> \`\`\`

**Q4: How does HTML interact with the DOM at runtime?**
> **A:** Browser parses HTML into a tree of nodes (the DOM). JavaScript mutates the DOM directly via \`document.querySelector\` etc. The DOM is the live representation — HTML is only the initial snapshot.

**Q5: Senior one-liner.**
> **A:** "HTML is a tree of semantically-typed elements that double as the accessibility tree and the SEO contract — which is why divs-everywhere creates parallel maintenance costs in CSS, JS, ARIA, and SEO that semantic markup avoids."`,

    build: `## BUILD

### 🏗️ Mini Project: Semantic Blog Post Page
**Time:** 20 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir semantic-blog && cd semantic-blog && touch index.html
\`\`\`

#### Step 2 — Core
\`\`\`html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Building accessible UIs — DevMastery</title>
  <meta name="description" content="Why semantic HTML matters">
</head>
<body>
  <header>
    <nav aria-label="Main">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/blog">Blog</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <article>
      <header>
        <h1>Building accessible UIs</h1>
        <p><time datetime="2026-06-29">29 June 2026</time> by <a href="/authors/jane">Jane Doe</a></p>
      </header>
      <section>
        <h2>Why semantic HTML</h2>
        <p>Semantic tags give meaning to assistive technologies…</p>
      </section>
      <footer><p>Tagged: <a href="/tag/a11y">accessibility</a></p></footer>
    </article>
  </main>
  <footer><p>© 2026 DevMastery</p></footer>
</body>
</html>
\`\`\`

#### Step 5 — Verify
- Open in browser → reader-view should show clean content
- Run axe-core or Lighthouse → 100/100 accessibility
- Inspect with screen reader (NVDA/VoiceOver) → hear landmarks

**Expected Output:** Lighthouse a11y score 100, all landmarks announced.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name 6 semantic HTML5 landmark elements.
**Q2:** Why is \`<button>\` better than \`<div onClick>\`?
**Q3:** Write a semantic blog article skeleton in 15 lines.

### Day 3
**Q4:** \`<section>\` vs \`<article>\` vs \`<div>\` — when each?
**Q5:** Show the styled-div-as-button bug and the fix.
**Q6:** Why does \`<h1>\` matter for SEO?

### Day 7
**Q7:** Convert a div-soup page to semantic HTML and run Lighthouse before/after.
**Q8:** PR uses \`<div role="button">\` for 30 controls. Describe SR + keyboard impact.
**Q9:** What ARIA do you need on top of semantic HTML, and what does HTML give for free?

### Day 14
**Q10:** ★ "Audit a real news site's HTML structure — what would you change and why?"
**Q11:** Link HTML → ARIA → CSS → JS.
**Q12:** ★ "Your SEO traffic drops 40% after a redesign. How does HTML structure cause this?"`
  },

  'css-basics': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Basics Like I'm 10 Years Old
> CSS is the makeup for your HTML. You write rules like \`button { color: red }\` and every button gets red text. Selectors choose elements; properties say how they look; the cascade decides who wins when two rules conflict. The non-obvious part: CSS specificity is a four-number score (inline > id > class > tag) — a class selector ALWAYS beats a tag selector even if the tag rule is written later. This is why "my styles aren't applying" is usually a specificity battle, not a syntax bug.

---

### 5 Deep Questions
**Q1: What is the cascade and specificity?**
> **A:** Cascade = order of stylesheets and rules. Specificity = weight of each selector: inline (1000) > IDs (100) > classes/attrs/pseudo (10) > tags (1). Higher specificity wins regardless of order. \`!important\` overrides everything (use sparingly).

**Q2: ONE model.**
> **A:** "Element matches multiple rules → browser computes specificity per rule → highest wins → cascade order breaks ties. Inherited properties propagate down the tree."

**Q3: Misconception with code.**
> **A:** \`\`\`css
> /* ❌ More specific selector wins regardless of order */
> .btn { color: red; }          /* specificity 10 */
> button { color: blue; }       /* specificity 1 — IGNORED */
> /* ✅ Match specificity or use single source */
> .btn { color: red; }
> .btn-secondary { color: blue; }
> \`\`\`

**Q4: How do flex and grid differ?**
> **A:** Flex = 1D layout (row or column) with easy alignment and ordering. Grid = 2D layout with rows AND columns simultaneously. Use flex for components (button groups, nav bars); grid for page layouts (sidebar + main + footer).

**Q5: Senior one-liner.**
> **A:** "CSS is a declarative cascade where specificity (inline > id > class > tag) plus source order plus inheritance decide which property value wins — which is why architectural CSS strategies (BEM, utility-first, CSS-in-JS) all exist to make specificity predictable."`,

    build: `## BUILD

### 🏗️ Mini Project: Responsive Card Grid with Flex + Grid
**Time:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir css-cards && cd css-cards
touch index.html style.css
\`\`\`

#### Step 2 — Core
\`\`\`html
<!doctype html><html><head><link rel="stylesheet" href="style.css"></head>
<body>
  <main class="grid">
    <article class="card"><h2>Card 1</h2><p>Body</p></article>
    <article class="card"><h2>Card 2</h2><p>Body</p></article>
    <article class="card"><h2>Card 3</h2><p>Body</p></article>
    <article class="card"><h2>Card 4</h2><p>Body</p></article>
  </main>
</body></html>
\`\`\`
\`\`\`css
* { box-sizing: border-box; }
body { font-family: system-ui; margin: 0; padding: 1rem; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
.card {
  border: 1px solid #ddd; border-radius: 8px; padding: 1rem;
  display: flex; flex-direction: column; gap: 0.5rem;
}
.card h2 { margin: 0; font-size: 1.25rem; }
@media (min-width: 1200px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
}
\`\`\`

#### Step 5 — Verify
Resize browser → cards reflow at every breakpoint with no JavaScript.

**Expected Output:** 4 cards in a fluid grid that becomes 1-column on mobile.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What is specificity? Order from highest to lowest.
**Q2:** Flex vs Grid — when each?
**Q3:** Write a responsive 3-column → 1-column grid in 10 lines of CSS.

### Day 3
**Q4:** \`em\` vs \`rem\` vs \`px\` vs \`%\` — when each?
**Q5:** Show the specificity bug and the fix.
**Q6:** What is the box model (content/padding/border/margin)?

### Day 7
**Q7:** Build a sticky header with backdrop blur, using only CSS.
**Q8:** PR uses \`!important\` in 40 places. Describe the maintenance impact.
**Q9:** How does \`box-sizing: border-box\` change layout math?

### Day 14
**Q10:** ★ "Design a CSS architecture for a 200-component design system — utility-first vs BEM vs CSS-in-JS?"
**Q11:** Link CSS → cascade → specificity → architecture.
**Q12:** ★ "Your stylesheet is 800KB and the cascade is unpredictable. Refactor strategy?"`
  },

  'javascript-basics': {
    feynman: `## FEYNMAN CHECK

### Explain JavaScript Basics Like I'm 10 Years Old
> JavaScript is the brain of a webpage. HTML is structure, CSS is look, JS is behaviour — clicks, forms, animations, network calls. It runs in a single-threaded loop that handles one task at a time but uses callbacks/promises to JUGGLE many async operations efficiently. The non-obvious part: JS variables come in three flavours (var/let/const) with different scoping rules, and the wrong choice causes "ghost" variables that leak across scopes. This is why ESLint configs ban \`var\` outright.

---

### 5 Deep Questions
**Q1: var vs let vs const?**
> **A:** \`var\`: function-scoped, hoisted with undefined, can redeclare. \`let\`: block-scoped, temporal dead zone, cannot redeclare. \`const\`: block-scoped, no reassignment (but object contents can mutate). Use const by default, let when reassignment needed, never var.

**Q2: ONE model.**
> **A:** "Variables = bindings in lexical scope. let/const respect blocks; var leaks to nearest function. \`this\` is dynamic; arrow functions inherit it. Async = callbacks → promises → async/await."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ var in loop — closure captures the SAME variable
> for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 3,3,3
> // ✅ let creates new binding per iteration
> for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 0,1,2
> \`\`\`

**Q4: == vs ===?**
> **A:** \`==\` coerces types (\`'1' == 1\` is true); \`===\` strict equality, no coercion. Always use \`===\` — coercion produces surprising bugs (\`[] == false\` is true).

**Q5: Senior one-liner.**
> **A:** "JavaScript is a single-threaded event-loop language with lexically-scoped closures, prototype-based inheritance, and an async model built on microtasks/macrotasks — which is why understanding the event loop is the difference between async code that scales and async code that deadlocks."`,

    build: `## BUILD

### 🏗️ Mini Project: TODO App in Vanilla JS
**Time:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir todo && cd todo && touch index.html app.js style.css
\`\`\`

#### Step 2 — Core
\`\`\`html
<!doctype html><html>
<head><link rel="stylesheet" href="style.css"></head>
<body>
  <form id="form"><input id="input" placeholder="New task" required><button>Add</button></form>
  <ul id="list"></ul>
  <script type="module" src="app.js"></script>
</body></html>
\`\`\`
\`\`\`js
// app.js
const STORAGE_KEY = 'todos';
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
const form = document.getElementById('form');
const input = document.getElementById('input');
const list = document.getElementById('list');

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); render(); }
function render() {
  list.innerHTML = todos.map((t, i) =>
    \`<li><label><input type="checkbox" \${t.done?'checked':''} data-i="\${i}">\${t.text}</label> <button data-del="\${i}">×</button></li>\`
  ).join('');
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  todos.push({ text: input.value.trim(), done: false });
  input.value = ''; save();
});
list.addEventListener('click', (e) => {
  const i = e.target.dataset.i ?? e.target.dataset.del;
  if (i == null) return;
  if (e.target.dataset.del != null) todos.splice(i, 1);
  else todos[i].done = !todos[i].done;
  save();
});
render();
\`\`\`

#### Step 4 — Error Handling
\`\`\`js
// Guard malformed localStorage
try { todos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
catch { todos = []; localStorage.removeItem(STORAGE_KEY); }
\`\`\`

#### Step 5 — Tests
Manually: add task, toggle, refresh page, delete.

**Expected Output:** Tasks persist across refreshes.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** var vs let vs const — scope rules of each.
**Q2:** == vs === — which to use and why.
**Q3:** Write a 5-line function that returns a counter using closures.

### Day 3
**Q4:** Hoisting — what gets hoisted, what doesn't?
**Q5:** Show the var-in-loop closure bug.
**Q6:** \`this\` in arrow vs regular functions.

### Day 7
**Q7:** Write a debounce function in 10 lines.
**Q8:** PR uses \`var\` throughout a new codebase. Describe ESLint + bug impact.
**Q9:** What is the event loop and how does microtask vs macrotask differ?

### Day 14
**Q10:** ★ "Explain prototypal inheritance vs class inheritance."
**Q11:** Link JS → event loop → DOM → async patterns.
**Q12:** ★ "Your single-page app freezes for 2s after clicking 'Export'. Diagnose."`
  },

  'typescript-basics': {
    feynman: `## FEYNMAN CHECK

### Explain TypeScript Basics Like I'm 10 Years Old
> TypeScript is JavaScript with sticky-notes (types) attached to every variable. The compiler reads the sticky-notes and yells at you if you try to do something illegal — like passing a number where a string was expected. The non-obvious part: TypeScript is COMPILE-time only. At runtime, your code is just plain JavaScript — the sticky-notes are erased. This is why you can't \`if (typeof user === 'User')\` at runtime — \`User\` doesn't exist after compilation.

---

### 5 Deep Questions
**Q1: What does TypeScript actually compile to and what does it remove?**
> **A:** TS → plain JS (target version configurable). Types, interfaces, and \`as\` casts are erased. Enums and namespaces become objects. Decorators emit metadata. Result: zero runtime cost from types themselves.

**Q2: ONE model.**
> **A:** "Types live at compile time only. Interfaces describe shapes. Generics parameterise types. Strict mode catches null/undefined. Inference handles 80% of annotations automatically."

**Q3: Misconception with code.**
> **A:** \`\`\`ts
> // ❌ Type assertion lies to the compiler
> const user = data as User; // No runtime check — crashes if wrong
> // ✅ Runtime validation with zod/io-ts
> const user = UserSchema.parse(data); // throws at boundary
> \`\`\`

**Q4: interface vs type — when each?**
> **A:** \`interface\` for object shapes that may be extended (declaration merging). \`type\` for unions, intersections, primitives, tuples, function types. Most codebases use \`type\` by default and \`interface\` only when class implementation or merging is needed.

**Q5: Senior one-liner.**
> **A:** "TypeScript is a structural type system over JavaScript with full type erasure at compile time — its value is shifting runtime errors to compile time, but only when strict mode is enabled and external data is parsed at boundaries with runtime validators."`,

    build: `## BUILD

### 🏗️ Mini Project: Typed REST Client
**Time:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir ts-client && cd ts-client
npm init -y && npm i -D typescript ts-node @types/node
npx tsc --init --strict
touch client.ts
\`\`\`

#### Step 2 — Core
\`\`\`ts
// client.ts
interface User { id: number; name: string; email: string; }
interface ApiError { code: string; message: string; }

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(\`https://jsonplaceholder.typicode.com/users/\${id}\`);
  if (!res.ok) throw { code: 'HTTP_' + res.status, message: res.statusText } satisfies ApiError;
  const data = await res.json();
  // Runtime validation — TS types alone don't validate response
  if (typeof data.id !== 'number' || typeof data.name !== 'string') {
    throw { code: 'SCHEMA', message: 'Invalid User shape' } satisfies ApiError;
  }
  return data as User;
}

(async () => {
  try {
    const u = await fetchUser(1);
    console.log(u.name);  // TS knows name exists
  } catch (e) {
    console.error((e as ApiError).code);
  }
})();
\`\`\`

#### Step 3 — Run
\`\`\`bash
npx ts-node client.ts
\`\`\`

#### Step 4 — Error Handling
\`\`\`ts
type Result<T, E = ApiError> = { ok: true; data: T } | { ok: false; error: E };
async function safeFetch(id: number): Promise<Result<User>> {
  try { return { ok: true, data: await fetchUser(id) }; }
  catch (e) { return { ok: false, error: e as ApiError }; }
}
\`\`\`

#### Step 5 — Test
\`\`\`bash
npx tsc --noEmit  # Type-check only, must pass with 0 errors
\`\`\`

**Expected Output:** \`Leanne Graham\` printed.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What does TS compile to and what gets erased?
**Q2:** interface vs type — when each?
**Q3:** Write a generic identity function.

### Day 3
**Q4:** unknown vs any — when each?
**Q5:** Show the \`as\`-cast lie and the runtime-validation fix.
**Q6:** What does \`strict: true\` enable?

### Day 7
**Q7:** Build a typed Result<T, E> error wrapper around fetch.
**Q8:** PR uses \`any\` throughout. Quantify type safety loss.
**Q9:** What are mapped types? Give a Partial<T> implementation.

### Day 14
**Q10:** ★ "Migrate a JS codebase to TS — what's the incremental strategy?"
**Q11:** Link TS → JS → runtime-validators → API design.
**Q12:** ★ "Your TS app crashes in prod with 'cannot read property of undefined' — but compile passed. Root cause?"`
  },

  'fetch-and-xhr': {
    feynman: `## FEYNMAN CHECK

### Explain Fetch & XHR Like I'm 10 Years Old
> Fetch and XHR (XMLHttpRequest) are the browser's mailman — they send HTTP requests to servers and bring responses back. XHR is the old way (callback-based, verbose); fetch is the modern way (promise-based, clean). The non-obvious part: \`fetch\` does NOT reject on HTTP errors — a 500 response resolves the promise normally. You must check \`response.ok\` yourself. This is why "my fetch error handler never runs" is the #1 fetch bug.

---

### 5 Deep Questions
**Q1: fetch vs XHR vs axios?**
> **A:** XHR: old, callback-based, supports upload progress events. fetch: modern, promise-based, cleaner API, lacks upload progress and timeout natively. axios: library wrapping XHR with interceptors, automatic JSON, timeout, request cancellation. Most apps use fetch + manual extensions.

**Q2: ONE model.**
> **A:** "fetch(url, init) returns Promise<Response>. Response has .ok, .status, .headers, and async body readers (.json, .text). It only rejects on network failure, never on HTTP errors."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Treats 4xx/5xx as success — error never thrown
> const data = await fetch('/api').then(r => r.json());
> // ✅ Check ok explicitly
> const res = await fetch('/api');
> if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
> const data = await res.json();
> \`\`\`

**Q4: How do you cancel a fetch request?**
> **A:** Use \`AbortController\`: create controller, pass \`controller.signal\` in fetch init, call \`controller.abort()\` to cancel. The fetch promise rejects with AbortError. Critical for SPA route changes (cancel in-flight requests for the old page).

**Q5: Senior one-liner.**
> **A:** "fetch is a promise-based network primitive that only rejects on transport failure — production fetch wrappers add status checks, JSON parsing, timeout via AbortController, retry-with-backoff, and request deduplication — most of which axios provides out of the box."`,

    build: `## BUILD

### 🏗️ Mini Project: Production Fetch Wrapper
**Time:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir fetch-lib && cd fetch-lib && touch api.js test.html
\`\`\`

#### Step 2 — Core
\`\`\`js
// api.js — typed-ish fetch wrapper with timeout, retry, abort
class HTTPError extends Error {
  constructor(res) { super(\`HTTP \${res.status} \${res.statusText}\`); this.res = res; }
}
export async function request(url, { method='GET', body, headers={}, timeoutMs=10000, retries=2, signal } = {}) {
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onAbort);
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    let attempt = 0;
    while (true) {
      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', ...headers },
          body: body ? JSON.stringify(body) : undefined,
          signal: ctrl.signal,
        });
        if (!res.ok) throw new HTTPError(res);
        const ct = res.headers.get('content-type') || '';
        return ct.includes('json') ? await res.json() : await res.text();
      } catch (err) {
        const transient = err.name === 'TypeError' || (err instanceof HTTPError && err.res.status >= 500);
        if (transient && attempt < retries && method === 'GET') {
          attempt++;
          await new Promise(r => setTimeout(r, 2 ** attempt * 200));
          continue;
        }
        throw err;
      }
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
\`\`\`

#### Step 4 — Error Handling
\`\`\`js
try {
  const user = await request('/api/users/1', { timeoutMs: 3000 });
} catch (e) {
  if (e.name === 'AbortError') console.error('Timeout');
  else if (e instanceof HTTPError) console.error('HTTP', e.res.status);
  else console.error('Network', e);
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// 200 success
await request('https://jsonplaceholder.typicode.com/users/1');
// 404 throws
await request('https://jsonplaceholder.typicode.com/notfound').catch(e => console.log('Caught:', e.res.status));
\`\`\`

**Expected Output:** Successful JSON, 404 caught with status.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Why doesn't fetch throw on 500 responses?
**Q2:** What does AbortController do?
**Q3:** Write a 5-line fetch with proper error checking.

### Day 3
**Q4:** fetch vs axios — when each?
**Q5:** Show the "fetch never errors" bug and the fix.
**Q6:** Why are upload-progress events missing from fetch?

### Day 7
**Q7:** Build a request-deduplication layer (same URL in-flight returns same promise).
**Q8:** PR fires 50 parallel fetches with no concurrency limit. Describe the impact.
**Q9:** How do you implement retry with exponential backoff?

### Day 14
**Q10:** ★ "Design a fetch wrapper for an enterprise SPA — what concerns must it handle?"
**Q11:** Link fetch → AbortController → React effects → cancellation.
**Q12:** ★ "Your app fires a request that completes after the user navigates away and overwrites the new page's data. Root cause + fix?"`
  },

  // ─── Batch 4: Backend basics ────────────────────────────────────────
  'nodejs-basics': {
    feynman: `## FEYNMAN CHECK

### Explain Node.js Like I'm 10 Years Old
> Node.js is JavaScript running outside the browser — on a server. It uses Google's V8 engine plus a system layer (libuv) that does async I/O. The non-obvious part: Node runs ONE thread for your JavaScript but a thread pool for file/network I/O. This is why Node is fast for I/O-heavy apps (web servers, APIs) and slow for CPU-heavy work (image processing) — a long CPU loop blocks every other request.

---

### 5 Deep Questions
**Q1: Why is Node single-threaded but capable of high throughput?**
> **A:** JavaScript runs single-threaded, but I/O (disk, network) is delegated to libuv's thread pool. While 100 connections wait for DB responses, the JS thread is free to handle new requests. This works because typical web requests spend 95% of time waiting, not computing.

**Q2: ONE model.**
> **A:** "Event loop processes JS tasks one at a time. I/O is async via callbacks/promises. CPU-bound work blocks everything — offload to worker_threads or external services."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Sync CPU work blocks all requests
> app.get('/hash', (req, res) => {
>   const h = crypto.pbkdf2Sync(req.body.pw, 'salt', 100000, 64, 'sha512');
>   res.json({ h });
> }); // 200ms per request — server handles 5 req/s
> // ✅ Async with worker thread or async API
> app.get('/hash', async (req, res) => {
>   const h = await pbkdf2Async(req.body.pw, 'salt', 100000, 64, 'sha512');
>   res.json({ h });
> }); // event loop free during work — 500+ req/s
> \`\`\`

**Q4: CommonJS vs ESM in Node?**
> **A:** CommonJS (\`require\`/\`module.exports\`): older, synchronous, allowed in .js by default. ESM (\`import\`/\`export\`): standard, async, requires .mjs or \`"type":"module"\`. ESM is the future; many libs still publish CJS for compatibility.

**Q5: Senior one-liner.**
> **A:** "Node.js is a single-threaded event-loop runtime over V8 with libuv-managed async I/O — its concurrency model excels at I/O-bound workloads and collapses under CPU-bound ones, which is why production Node systems offload computation to worker_threads, services, or external runtimes."`,

    build: `## BUILD

### 🏗️ Mini Project: Express API with Health Check and Graceful Shutdown
**Time:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir node-api && cd node-api
npm init -y && npm i express
touch server.js
\`\`\`

#### Step 2 — Core
\`\`\`js
// server.js
const express = require('express');
const app = express();
app.use(express.json());

let ready = true;
app.get('/healthz', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/readyz',  (req, res) => res.status(ready ? 200 : 503).json({ ready }));
app.get('/api/users', (req, res) => res.json([{ id: 1, name: 'Alice' }]));

const server = app.listen(3000, () => console.log('on :3000'));

// Graceful shutdown — drain in-flight requests
function shutdown(signal) {
  console.log(\`\${signal} received, draining…\`);
  ready = false;  // Fail readiness so LB stops sending traffic
  server.close(err => {
    if (err) { console.error(err); process.exit(1); }
    console.log('Drained, exiting');
    process.exit(0);
  });
  setTimeout(() => { console.error('Forced exit'); process.exit(1); }, 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
\`\`\`

#### Step 4 — Error Handling
\`\`\`js
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});
process.on('unhandledRejection', (r) => console.error('unhandled', r));
process.on('uncaughtException', (e) => { console.error(e); process.exit(1); });
\`\`\`

#### Step 5 — Test
\`\`\`bash
node server.js &
curl http://localhost:3000/healthz
curl http://localhost:3000/readyz
kill -TERM $!  # should drain gracefully
\`\`\`

**Expected Output:** Health/ready respond, SIGTERM drains in <10s.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What is the event loop and why is Node single-threaded?
**Q2:** CommonJS vs ESM — when each?
**Q3:** Write a 10-line Express server with one GET endpoint.

### Day 3
**Q4:** Why are CPU-bound operations dangerous in Node?
**Q5:** Show sync-crypto bug and async fix.
**Q6:** What is graceful shutdown and why does it matter for K8s?

### Day 7
**Q7:** Use worker_threads to offload a CPU task without blocking the event loop.
**Q8:** PR ships a sync bcrypt call. Quantify throughput collapse.
**Q9:** What is the difference between process and cluster?

### Day 14
**Q10:** ★ "Design a Node API for 10k req/s — how do you scale beyond one process?"
**Q11:** Link Node → event-loop → I/O → backpressure.
**Q12:** ★ "Your Node server's p99 latency tripled after deploying a new feature. Diagnose."`
  },

  'rest-api-design': {
    feynman: `## FEYNMAN CHECK

### Explain REST API Design Like I'm 10 Years Old
> REST is a convention for designing web APIs as nouns + verbs. URLs are nouns (\`/users/42\` = user 42), HTTP methods are verbs (GET = read, POST = create, PUT = replace, PATCH = update, DELETE = remove). Status codes communicate outcome (2xx success, 4xx client wrong, 5xx server wrong). The non-obvious part: REST is NOT about JSON or HTTP per se — it's about uniform interfaces, statelessness, and resource-orientation. This is why "POST /createUser" is anti-REST; "POST /users" is correct.

---

### 5 Deep Questions
**Q1: What are REST's core constraints?**
> **A:** Client-server separation, stateless requests, cacheability, uniform interface (resources + verbs + representations + HATEOAS), layered system, code-on-demand (optional). Most APIs called "REST" follow only the first 4.

**Q2: ONE model.**
> **A:** "Resource = noun (URL). Action = verb (HTTP method). State change = client→server (POST/PUT/PATCH/DELETE). State read = GET. Status = numeric outcome."

**Q3: Misconception with code.**
> **A:** \`\`\`http
> # ❌ RPC-style — verb in URL, ignores HTTP semantics
> POST /api/createUser?name=Alice
> # ✅ REST — noun URL + correct verb
> POST /api/users
> Content-Type: application/json
> { "name": "Alice" }
> \`\`\`

**Q4: How do you version a REST API?**
> **A:** Three options: URL prefix (\`/v1/users\`) — explicit, easy. Header (\`Accept: application/vnd.api.v1+json\`) — clean URLs. Query param — least common. URL versioning is most popular for public APIs; header versioning for internal APIs.

**Q5: Senior one-liner.**
> **A:** "REST is an architectural style where resources have URLs, methods have semantics, and responses have codes — its discipline produces self-describing APIs that scale via caching, but its rigidity loses to GraphQL when client needs are highly variable."`,

    build: `## BUILD

### 🏗️ Mini Project: RESTful Notes API
**Time:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir notes-api && cd notes-api
npm init -y && npm i express
touch server.js
\`\`\`

#### Step 2 — Core
\`\`\`js
const express = require('express');
const app = express();
app.use(express.json());

const notes = new Map();
let nextId = 1;

// Collection
app.get('/api/notes', (req, res) => res.json([...notes.values()]));
app.post('/api/notes', (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'title required' });
  const note = { id: nextId++, title: req.body.title, body: req.body.body ?? '' };
  notes.set(note.id, note);
  res.status(201).location(\`/api/notes/\${note.id}\`).json(note);
});

// Item
app.get('/api/notes/:id', (req, res) => {
  const note = notes.get(Number(req.params.id));
  if (!note) return res.sendStatus(404);
  res.json(note);
});
app.put('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!notes.has(id)) return res.sendStatus(404);
  const note = { id, title: req.body.title, body: req.body.body ?? '' };
  notes.set(id, note);
  res.json(note);
});
app.patch('/api/notes/:id', (req, res) => {
  const note = notes.get(Number(req.params.id));
  if (!note) return res.sendStatus(404);
  Object.assign(note, req.body);
  res.json(note);
});
app.delete('/api/notes/:id', (req, res) => {
  notes.delete(Number(req.params.id));
  res.sendStatus(204);
});

app.listen(3000);
\`\`\`

#### Step 5 — Test
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d '{"title":"Hi"}' http://localhost:3000/api/notes
# 201, returns {"id":1,"title":"Hi","body":""}
curl http://localhost:3000/api/notes/1     # 200
curl -X DELETE http://localhost:3000/api/notes/1   # 204
curl http://localhost:3000/api/notes/1     # 404
\`\`\`

**Expected Output:** Correct status codes for each verb.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name 5 HTTP methods and the REST semantic of each.
**Q2:** What does each 2xx/4xx/5xx range mean?
**Q3:** Write 5 endpoints for a /users resource.

### Day 3
**Q4:** PUT vs PATCH — when each?
**Q5:** Show the RPC-style URL bug and the REST fix.
**Q6:** What is idempotency and which verbs are idempotent?

### Day 7
**Q7:** Add pagination and filtering to GET /users.
**Q8:** PR returns 200 for "not found" errors. Describe client confusion.
**Q9:** REST vs GraphQL — when each?

### Day 14
**Q10:** ★ "Design a REST API for an e-commerce product catalogue."
**Q11:** Link REST → HTTP → caching → versioning.
**Q12:** ★ "Your API has 200 endpoints with no consistent error format. Plan the migration."`
  },

  'json-and-rest': {
    feynman: `## FEYNMAN CHECK

### Explain JSON & REST Like I'm 10 Years Old
> JSON is the way computers exchange data over the internet — a human-readable text format of nested keys and values (\`{"name":"Alice","age":30}\`). REST APIs typically send and receive JSON because every language can parse it. The non-obvious part: JSON has only 6 types (string, number, boolean, null, object, array). No dates, no integers vs floats distinction, no bigint, no undefined — which is why \`new Date()\` and \`BigInt\` cause silent serialisation bugs in JSON APIs.

---

### 5 Deep Questions
**Q1: What types does JSON support and lack?**
> **A:** Supports: string, number, boolean, null, object, array. Lacks: Date (use ISO strings), BigInt (use strings), undefined (skipped in serialisation), Symbol, function. JSON.stringify silently drops unsupported types — silent data loss.

**Q2: ONE model.**
> **A:** "JSON = subset of JS literals usable as text. Parse converts text→JS value. Stringify converts JS value→text. Both lossy at the type-system boundary."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Date silently becomes a string on serialise/parse round-trip
> const obj = { createdAt: new Date() };
> const parsed = JSON.parse(JSON.stringify(obj));
> parsed.createdAt.getTime();  // TypeError: not a Date
> // ✅ Reviver function or schema validator restores types
> JSON.parse(text, (key, value) =>
>   key === 'createdAt' ? new Date(value) : value);
> \`\`\`

**Q4: How do you handle BigInt or precise decimals in JSON APIs?**
> **A:** JSON numbers are 64-bit floats — precision degrades above 2^53. For BigInt or currency, serialise as strings (\`"amount": "1000000000000.50"\`) and parse with BigInt() or Decimal libraries on receipt. Many financial APIs use strings for all monetary values.

**Q5: Senior one-liner.**
> **A:** "JSON is a text-based subset of JS object literals with 6 primitive types — its simplicity drives universal adoption but its lossy type mapping forces production APIs to use string-encoded dates, decimals, and BigInts to survive round-trips."`,

    build: `## BUILD

### 🏗️ Mini Project: Type-Safe JSON Roundtrip with Zod
**Time:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir json-zod && cd json-zod
npm init -y && npm i zod
touch index.js
\`\`\`

#### Step 2 — Core
\`\`\`js
const { z } = require('zod');
const UserSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.string().datetime().transform(s => new Date(s)),  // ISO → Date
  balance: z.string().regex(/^\\d+(\\.\\d+)?$/),  // BigInt-safe currency
});

const wireData = JSON.parse(JSON.stringify({
  id: 1, name: 'Alice', email: 'a@b.co',
  createdAt: new Date().toISOString(), balance: '1000000.50'
}));

const user = UserSchema.parse(wireData);
console.log(user.createdAt instanceof Date);  // true
console.log(BigInt(user.balance.split('.')[0])); // 1000000n
\`\`\`

#### Step 4 — Error Handling
\`\`\`js
try { UserSchema.parse({ id: 'not-a-number' }); }
catch (e) { console.error(e.issues); }  // [{ path: ['id'], message: 'Expected number' }]
\`\`\`

#### Step 5 — Test
\`\`\`bash
node index.js
\`\`\`

**Expected Output:** \`true\` (Date restored), BigInt parsed correctly.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What 6 types does JSON support?
**Q2:** What gets lost in JSON.stringify(new Date())?
**Q3:** Write a Zod schema for a User object.

### Day 3
**Q4:** Why are JSON numbers unsafe for BigInt or currency?
**Q5:** Show the Date roundtrip bug and the reviver fix.
**Q6:** JSON.parse with reviver — when do you need it?

### Day 7
**Q7:** Build a typed API client that validates responses at the boundary with Zod.
**Q8:** PR sends \`balance: 12345678901234567\` over JSON. Describe the precision loss.
**Q9:** What is JSON Schema and how does it differ from Zod/io-ts?

### Day 14
**Q10:** ★ "Design a JSON wire format for a financial trading API — what types and conventions?"
**Q11:** Link JSON → REST → types → validation.
**Q12:** ★ "A client reports balance off by 1 cent. Trace the JSON round-trip bug."`
  },

  'authentication-basics': {
    feynman: `## FEYNMAN CHECK

### Explain Authentication Like I'm 10 Years Old
> Authentication is "who are you?" Authorisation is "what can you do?" Login = the server checks your password and gives you a wristband (session token or JWT) you wave on every request to prove you're you. The non-obvious part: passwords must NEVER be stored plain — they're salted and hashed (bcrypt/argon2). Even if attackers steal your DB, they can't recover passwords from hashes. This is why "passwords stored in plain text" is the #1 security failure that gets companies on the news.

---

### 5 Deep Questions
**Q1: How does password hashing protect users?**
> **A:** Bcrypt/argon2 are one-way functions — given the hash, you can't recover the password. Salt makes pre-computed rainbow tables useless. Iteration count slows brute-force. If your DB leaks, attackers must brute-force each password individually at billions of guesses per second — but a 12-char random password still takes years.

**Q2: ONE model.**
> **A:** "Authn = prove identity (password, OTP, biometric). Authz = check permission (role, ACL). Session = wristband (cookie session, JWT). Refresh = renew wristband without re-authn."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Plain-text comparison — breach = total password compromise
> if (user.password === input) return 'ok';
> // ✅ Bcrypt compare — slow + salted
> const ok = await bcrypt.compare(input, user.passwordHash);
> \`\`\`

**Q4: Sessions vs JWT — when each?**
> **A:** Session cookie: server stores session ID → user, can revoke instantly. JWT: signed claim, stateless, can't be revoked until expiry. Sessions for first-party web; JWT for microservices/mobile/cross-domain. Mixing both (session ID inside JWT) gives revocability + statelessness.

**Q5: Senior one-liner.**
> **A:** "Authentication is identity proof via hashed credentials + multi-factor; authorisation is permission check via roles/ACLs; sessions/JWTs are transport — and conflating any of these three causes the most-exploited security bugs in production."`,

    build: `## BUILD

### 🏗️ Mini Project: Secure Login with bcrypt + JWT
**Time:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir auth-demo && cd auth-demo
npm init -y && npm i express bcrypt jsonwebtoken
touch server.js
\`\`\`

#### Step 2 — Core
\`\`\`js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev-only-change-in-prod';
const app = express();
app.use(express.json());

const users = new Map();   // demo only, use real DB

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) return res.status(400).json({ error: 'weak' });
  if (users.has(email)) return res.status(409).json({ error: 'exists' });
  const passwordHash = await bcrypt.hash(password, 12);  // 12 rounds ≈ 250ms
  users.set(email, { email, passwordHash });
  res.status(201).json({ email });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  // Always run bcrypt even if user missing — prevents timing-based user enumeration
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : await bcrypt.compare(password, '$2b$12$invalid');
  if (!user || !ok) return res.status(401).json({ error: 'invalid' });
  const token = jwt.sign({ sub: email }, SECRET, { expiresIn: '15m' });
  res.json({ token });
});

function authn(req, res, next) {
  const h = req.headers.authorization || '';
  const [, token] = h.match(/^Bearer (.+)$/) || [];
  if (!token) return res.status(401).json({ error: 'no token' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'bad token' }); }
}

app.get('/me', authn, (req, res) => res.json({ sub: req.user.sub }));

app.listen(3000);
\`\`\`

#### Step 5 — Test
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"a@b.co","password":"hunter2!!!!"}' http://localhost:3000/signup
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"a@b.co","password":"hunter2!!!!"}' http://localhost:3000/login | jq -r .token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/me
\`\`\`

**Expected Output:** \`{ "sub": "a@b.co" }\``,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** authn vs authz — define each.
**Q2:** Why salt + hash passwords?
**Q3:** Write a bcrypt hash + compare in 6 lines.

### Day 3
**Q4:** Sessions vs JWT — pros/cons.
**Q5:** Show plain-text-password bug and bcrypt fix.
**Q6:** What is timing-based user enumeration?

### Day 7
**Q7:** Add refresh token rotation to a JWT auth flow.
**Q8:** PR stores JWT in localStorage. Describe the XSS risk.
**Q9:** What is MFA and what attacks does it prevent?

### Day 14
**Q10:** ★ "Design auth for a SaaS with SSO, MFA, and API keys."
**Q11:** Link authn → authz → sessions → JWT → OAuth.
**Q12:** ★ "A breach exposes your password DB. Walk the incident response."`
  },

  'api-security': {
    feynman: `## FEYNMAN CHECK

### Explain API Security Like I'm 10 Years Old
> API security is the locks, alarms, and bouncer for your back-end. Common threats: unauthorised access (no auth), broken authz (logged-in user sees other users' data), injection (SQL/NoSQL/command), excessive data exposure, rate-limit absence (brute-force, DDoS), and insecure deserialisation. The non-obvious part: most breaches are NOT zero-days — they're missing controls (no rate-limit on login, missing authz check on /admin route, default credentials). This is why OWASP Top 10 has stayed remarkably stable for 10+ years.

---

### 5 Deep Questions
**Q1: What is BOLA (Broken Object-Level Authorisation) and why is it #1?**
> **A:** API returns object by ID but doesn't verify the caller owns it. \`GET /orders/123\` returns order 123 even if it belongs to another user — because authn (logged in) was checked but authz (owns this order) was not. Fix: every object endpoint must verify ownership.

**Q2: ONE model.**
> **A:** "Auth = identity. Authz per object = ownership. Validation = input shape. Sanitisation = output. Rate-limit = abuse. Logging = forensics. Each is a separate layer; skipping any creates exploitable gaps."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Authenticated but not authorised
> app.get('/orders/:id', authn, async (req, res) => {
>   res.json(await db.orders.findById(req.params.id));  // Any logged-in user reads any order
> });
> // ✅ Verify ownership
> app.get('/orders/:id', authn, async (req, res) => {
>   const order = await db.orders.findById(req.params.id);
>   if (!order || order.userId !== req.user.sub) return res.sendStatus(404);
>   res.json(order);
> });
> \`\`\`

**Q4: How do you prevent SQL injection?**
> **A:** ALWAYS use parameterised queries (prepared statements). Never string-concatenate user input into SQL. ORMs do this by default. Even with ORM, raw escape hatches (\`pool.query(\`SELECT * FROM users WHERE name = '\${name}'\`)\`) reintroduce the vulnerability.

**Q5: Senior one-liner.**
> **A:** "API security is layered defence — authn + per-object authz + input validation + output sanitisation + rate-limit + audit — and 95% of breaches come from a missing layer, not a zero-day, which is why OWASP Top 10 has remained stable for a decade."`,

    build: `## BUILD

### 🏗️ Mini Project: Hardened API Endpoint
**Time:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir api-sec && cd api-sec
npm init -y && npm i express express-rate-limit helmet jsonwebtoken zod
touch server.js
\`\`\`

#### Step 2 — Core (defence in depth)
\`\`\`js
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const app = express();
app.use(helmet());                          // 1. security headers
app.use(express.json({ limit: '10kb' }));   // 2. body size cap
app.use('/api/', rateLimit({ windowMs: 60_000, max: 60 })); // 3. rate-limit

function authn(req, res, next) { /* JWT verify, set req.user */ next(); }

const QuerySchema = z.object({ page: z.coerce.number().int().min(1).max(1000).default(1) });

app.get('/api/orders/:id', authn, async (req, res) => {
  // 4. input validation
  const id = z.coerce.number().int().positive().parse(req.params.id);
  // 5. per-object authz
  const order = await db.orders.findById(id);
  if (!order || order.userId !== req.user.sub) return res.sendStatus(404);
  // 6. output filtering — never leak internal fields
  const { internalNotes, ...safe } = order;
  res.json(safe);
});

app.use((err, req, res, next) => {
  console.error(err);   // 7. logging
  res.status(500).json({ error: 'internal' });  // 8. no stack trace leak
});

app.listen(3000);
\`\`\`

#### Step 5 — Test
\`\`\`bash
# Should rate-limit after 60 requests/min
for i in $(seq 1 100); do curl -s -o /dev/null -w "%{http_code}\\n" http://localhost:3000/api/orders/1; done | sort | uniq -c
\`\`\`

**Expected Output:** Mix of 200 and 429 (rate-limited).`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name 5 of OWASP API Top 10.
**Q2:** BOLA — what is it and why #1?
**Q3:** Write a per-object authz check.

### Day 3
**Q4:** SQL injection — show the bug and fix.
**Q5:** Show the authn-but-no-authz bug.
**Q6:** What does helmet middleware do?

### Day 7
**Q7:** Add rate-limiting + body-size cap + input validation to an endpoint.
**Q8:** PR exposes \`/api/users\` listing all users. Describe the data-exposure incident.
**Q9:** How do you log securely without leaking PII?

### Day 14
**Q10:** ★ "Audit an API for OWASP Top 10 — what's your checklist?"
**Q11:** Link API security → authn → authz → input-validation → rate-limit.
**Q12:** ★ "Your endpoint is being scraped at 10k req/s from rotating IPs. Mitigation?"`
  },

  // ─── Batch 5: Frameworks + tooling ──────────────────────────────────
  'react-or-angular-basics': {
    feynman: `## FEYNMAN CHECK

### Explain React/Angular Basics Like I'm 10 Years Old
> React and Angular are libraries/frameworks that let you describe your UI as components — small reusable pieces (\`<Button>\`, \`<Card>\`) — that re-render automatically when their data changes. You declare WHAT the UI should look like for a given state; the framework figures out HOW to update the DOM. The non-obvious part: React re-renders the entire component tree on state change, then diffs against the previous tree (virtual DOM) to compute the minimum DOM mutation. Angular uses zone.js to detect changes and dirty-checks bindings. Both abstract DOM updates away from you.

---

### 5 Deep Questions
**Q1: React vs Angular philosophy?**
> **A:** React: library, you compose tools (router, state, form). Angular: framework, batteries included (router, forms, HTTP, DI). React's mental model is functions of state → UI; Angular's is decorators + dependency injection + RxJS. React leans functional; Angular leans OOP/enterprise.

**Q2: ONE model.**
> **A:** "Component = function/class. State change → re-render → framework diffs against previous → minimum DOM mutation. You write declarative templates; framework owns DOM."

**Q3: Misconception with code.**
> **A:** \`\`\`jsx
> // ❌ Mutating state directly — React doesn't re-render
> state.items.push(newItem);
> // ✅ Immutable update — new array reference triggers re-render
> setState({ items: [...state.items, newItem] });
> \`\`\`

**Q4: Why do React/Angular have keys on list items?**
> **A:** Keys identify items across renders so the framework knows which DOM nodes to keep, move, or recreate. Wrong keys (or array indices) cause stale state, lost input focus, and component instance mixing. Use stable, unique IDs (database ID, not index).

**Q5: Senior one-liner.**
> **A:** "React and Angular are component-based UI runtimes where declarative state-to-UI mappings are reconciled against the live DOM — React optimises for compositional flexibility, Angular for enterprise-grade convention, and both fail when developers mutate state or misuse keys."`,

    build: `## BUILD

### 🏗️ Mini Project: Counter App in React
**Time:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
npx create-react-app counter --template typescript
cd counter
\`\`\`

#### Step 2 — Core
\`\`\`tsx
// src/App.tsx
import { useState } from 'react';
export default function App() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </main>
  );
}
\`\`\`

#### Step 5 — Run
\`\`\`bash
npm start
\`\`\`

**Expected Output:** Counter increments/decrements/resets. Open React DevTools to see state.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** React vs Angular — pick one and justify.
**Q2:** What triggers a React re-render?
**Q3:** Write a 10-line stateful counter component.

### Day 3
**Q4:** Why do list items need keys?
**Q5:** Show the state-mutation bug and fix.
**Q6:** Functional vs class components — when each?

### Day 7
**Q7:** Build a Todo list with add/toggle/delete using only useState.
**Q8:** PR uses array index as key on a sortable list. Describe the bug.
**Q9:** What does React's virtual DOM optimise?

### Day 14
**Q10:** ★ "When would you choose React vs Angular vs Vue for a new project?"
**Q11:** Link components → state → render → reconciliation.
**Q12:** ★ "Your app re-renders 1000 components on every keystroke. Optimisation strategy?"`
  },

  'react-or-angular-advanced': {
    feynman: `## FEYNMAN CHECK

### Explain Advanced React/Angular Like I'm 10 Years Old
> Advanced React/Angular means: managing complex state (Redux, NgRx, Zustand), optimising re-renders (memo, useMemo, OnPush), handling side effects safely (useEffect, RxJS), code-splitting for fast initial loads, and server-side rendering for SEO/performance. The non-obvious part: most "advanced" problems are AVOIDABLE — pick smaller components, lift state correctly, and you rarely need Redux. The optimisations that matter most are bundle size and avoiding unnecessary re-renders, not micro-memoisation.

---

### 5 Deep Questions
**Q1: When do you need Redux/NgRx vs local state?**
> **A:** Local state for data used by one component. Lift to parent if 2-3 components share it. Use Context/Service for tree-wide data (theme, user). Reach for Redux/NgRx only when: complex state machines, time-travel debugging needed, or 10+ components share rapidly-mutating state. Most apps never need it.

**Q2: ONE model.**
> **A:** "Optimise renders, not memory. Memo only when profiler shows a problem. Code-split routes. SSR for SEO + first paint. State at the lowest common ancestor."

**Q3: Misconception with code.**
> **A:** \`\`\`tsx
> // ❌ Premature memoisation — overhead > benefit
> const Item = React.memo(({ name }) => <li>{name}</li>);
> // ✅ Profile first — memo only hot components with stable props
> const Row = React.memo(VirtualisedRow);  // 1000+ instances, prop-stable
> \`\`\`

**Q4: How does React Suspense / Angular SSR change rendering?**
> **A:** React Server Components + Suspense: server renders shell instantly, streams components as data loads. Angular SSR: full page rendered on server, hydrated on client. Both cut TTI but add complexity (data fetching boundaries, hydration mismatches).

**Q5: Senior one-liner.**
> **A:** "Advanced React/Angular is the discipline of measuring before optimising — bundle-size, render counts, and data-fetching waterfalls — because most performance wins come from architecture (code-splitting, suspense, lifting state) not micro-optimisation (excessive memo)."`,

    build: `## BUILD

### 🏗️ Mini Project: React App with Suspense + Code-Splitting
**Time:** 35 minutes

#### Step 2 — Core
\`\`\`tsx
import { lazy, Suspense } from 'react';
const Settings = lazy(() => import('./Settings'));
const Profile  = lazy(() => import('./Profile'));

export default function App() {
  const [tab, setTab] = useState<'home'|'settings'|'profile'>('home');
  return (
    <>
      <nav>
        <button onClick={() => setTab('home')}>Home</button>
        <button onClick={() => setTab('settings')}>Settings</button>
        <button onClick={() => setTab('profile')}>Profile</button>
      </nav>
      <Suspense fallback={<div>Loading…</div>}>
        {tab === 'settings' && <Settings />}
        {tab === 'profile'  && <Profile />}
      </Suspense>
    </>
  );
}
\`\`\`

#### Step 5 — Verify
\`\`\`bash
npm run build
ls build/static/js   # Multiple chunks instead of one bundle
\`\`\`

**Expected Output:** Each route loaded only when visited.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** When NOT to use Redux?
**Q2:** What does React.memo do?
**Q3:** Write lazy-loaded route in React.

### Day 3
**Q4:** Suspense vs traditional loading state.
**Q5:** Premature memoisation bug.
**Q6:** useMemo vs useCallback.

### Day 7
**Q7:** Add SSR via Next.js to an existing app.
**Q8:** PR memoises every component. Quantify overhead.
**Q9:** What is render-as-you-fetch?

### Day 14
**Q10:** ★ "Performance audit a React app — what 5 things do you check first?"
**Q11:** Link advanced → SSR → Suspense → bundle-splitting.
**Q12:** ★ "Your bundle is 4MB and TTI is 8s. Reduce to <1MB and <2s."`
  },

  'nextjs-or-nuxt': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js / Nuxt Like I'm 10 Years Old
> Next.js (React) and Nuxt (Vue) are meta-frameworks that give you SSR, static generation, file-based routing, API routes, and image optimisation out of the box. Instead of wiring up Webpack + React Router + Express + ImageMagick yourself, you get a single tool that does all of it. The non-obvious part: Next.js has TWO rendering models — pages router (older, getServerSideProps) and app router (newer, server components + streaming). Mixing them in one app causes hydration mismatches that take hours to debug.

---

### 5 Deep Questions
**Q1: Why Next.js over plain React?**
> **A:** SSR/SSG out of the box, file-based routing, automatic code splitting, API routes (no separate Express), image/font optimisation, ISR (incremental static regeneration). For SEO-critical or content-heavy apps, the framework saves weeks of glue code.

**Q2: ONE model.**
> **A:** "Pages = file-based routes. Server Components = run on server, never ship to client. Client Components = hydrated. Data fetching = on server (fetch in RSC) or client (SWR/React Query). API routes = serverless endpoints."

**Q3: Misconception with code.**
> **A:** \`\`\`tsx
> // ❌ useEffect for data fetching in app router — defeats SSR
> 'use client';
> useEffect(() => { fetch('/api/users').then(r=>r.json()).then(setData); }, []);
> // ✅ Server component fetches at build/request time
> export default async function Page() {
>   const data = await fetch('https://api/users').then(r=>r.json());
>   return <UserList data={data} />;
> }
> \`\`\`

**Q4: SSR vs SSG vs ISR vs CSR?**
> **A:** CSR (client-side): browser fetches, slow first paint, bad SEO. SSR (per-request server render): always fresh, server cost per request. SSG (build-time static): instant, no server compute, stale until rebuild. ISR (incremental): SSG + periodic regeneration. Choose per page based on freshness vs cost.

**Q5: Senior one-liner.**
> **A:** "Next.js/Nuxt are convention-driven meta-frameworks that unify routing, rendering modes, data fetching, and edge deployment — their value is removing 80% of glue code, but their two-rendering-model history means architecture choices made on day one constrain you for years."`,

    build: `## BUILD

### 🏗️ Mini Project: Next.js App with API Route + Server Component
**Time:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
\`\`\`

#### Step 2 — API Route
\`\`\`ts
// app/api/users/route.ts
export async function GET() {
  return Response.json([{ id: 1, name: 'Alice' }]);
}
\`\`\`

#### Step 3 — Server Component
\`\`\`tsx
// app/page.tsx — server component, runs on server
async function getUsers() {
  const res = await fetch('http://localhost:3000/api/users', { cache: 'no-store' });
  return res.json();
}
export default async function Page() {
  const users = await getUsers();
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

#### Step 5 — Run
\`\`\`bash
npm run dev
# View page source — users rendered as HTML, not hydrated
\`\`\`

**Expected Output:** \`<li>Alice</li>\` visible in HTML source.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** SSR vs SSG vs ISR vs CSR — define each.
**Q2:** When use server component vs client component?
**Q3:** Write a Next.js API route returning JSON.

### Day 3
**Q4:** Pages router vs app router — when each?
**Q5:** Show useEffect-fetch-in-app-router bug.
**Q6:** What does revalidate option do in fetch?

### Day 7
**Q7:** Convert a CSR data fetch to ISR with 60s revalidation.
**Q8:** PR adds 'use client' to every component. Describe SSR loss impact.
**Q9:** How does Next.js handle images differently than \`<img>\`?

### Day 14
**Q10:** ★ "Choose between Next.js, Remix, Astro for a marketing + SaaS combo."
**Q11:** Link Next → React → SSR → edge.
**Q12:** ★ "Your Next.js app has 500ms TTFB. Diagnose and reduce to <100ms."`
  },

  'module-bundlers': {
    feynman: `## FEYNMAN CHECK

### Explain Module Bundlers Like I'm 10 Years Old
> A module bundler (Webpack, Vite, esbuild, Rollup, Turbopack) takes hundreds of source files (\`import\` chains, CSS, images) and combines them into a few optimised files the browser can load fast. It walks the import graph, tree-shakes unused code, transpiles modern JS to compatible JS, splits large bundles into chunks, and produces hashed filenames for caching. The non-obvious part: bundlers are slow at scale because they re-parse everything on every change unless you use HMR (hot module replacement) or a Go/Rust-based bundler (esbuild, Turbopack) that's 10-100× faster.

---

### 5 Deep Questions
**Q1: Webpack vs Vite vs esbuild — when each?**
> **A:** Webpack: most plugins, slowest, mature, used in legacy / Next.js. Vite: Rollup for prod + esbuild for dev, fast HMR, modern default. esbuild: 100× faster, fewer features, used inside other tools. For new projects, Vite or Next.js (Turbopack). Migrate Webpack only when it actively hurts you.

**Q2: ONE model.**
> **A:** "Bundler = entry → walk imports → transform (TS/JSX/CSS) → tree-shake → split chunks → emit hashed files. Dev mode = fast incremental + HMR. Prod = minify + optimise."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Importing the whole library — bundles 200KB
> import _ from 'lodash';
> _.debounce(fn, 100);
> // ✅ Named import — tree-shakes to 5KB
> import { debounce } from 'lodash-es';
> debounce(fn, 100);
> \`\`\`

**Q4: What is code splitting and how does it work?**
> **A:** Dynamic imports (\`import('./heavy')\`) tell the bundler to emit a separate chunk loaded on demand. Combined with React.lazy/Vue defineAsyncComponent, routes/components load only when visited. Critical for first-paint performance.

**Q5: Senior one-liner.**
> **A:** "A module bundler is a graph-walking transform-and-emit pipeline whose speed (Vite vs Webpack) dominates dev velocity and whose output strategy (chunks, tree-shaking, modern targets) dominates production performance."`,

    build: `## BUILD

### 🏗️ Mini Project: Vite Project with Code-Split Routes
**Time:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm i react-router-dom
\`\`\`

#### Step 2 — Code-Split Routes
\`\`\`tsx
// src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
\`\`\`

#### Step 5 — Build & Inspect
\`\`\`bash
npm run build
ls dist/assets   # Multiple JS chunks per route
\`\`\`

**Expected Output:** Separate chunks for Home and About routes.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Bundler purpose — name 4 things it does.
**Q2:** Webpack vs Vite — dev speed differs how?
**Q3:** Write a dynamic import for code splitting.

### Day 3
**Q4:** Tree shaking — when does it work, when doesn't?
**Q5:** Show whole-library-import bundle bloat bug.
**Q6:** HMR — what is it and why does it matter for dev velocity?

### Day 7
**Q7:** Analyse a bundle with rollup-plugin-visualizer or webpack-bundle-analyzer.
**Q8:** PR adds moment.js (200KB) for one date format. Describe alternative.
**Q9:** ESM vs CJS — how does each affect tree-shaking?

### Day 14
**Q10:** ★ "Migrate a Webpack project to Vite — what breaks?"
**Q11:** Link bundler → tree-shaking → code-split → performance.
**Q12:** ★ "Your prod bundle is 5MB. Analyse and reduce to under 1MB."`
  },

  'npm-and-package-managers': {
    feynman: `## FEYNMAN CHECK

### Explain npm & Package Managers Like I'm 10 Years Old
> A package manager (npm, pnpm, Yarn) is the app store for code libraries. \`package.json\` lists what you depend on; \`npm install\` downloads them into \`node_modules\`. \`package-lock.json\` pins exact versions so everyone gets the same code. The non-obvious part: \`node_modules\` is the heaviest folder on earth (50k+ files, GBs) — pnpm fixes this with hard links sharing one global store. This is why pnpm installs are 3-10× faster than npm.

---

### 5 Deep Questions
**Q1: npm vs pnpm vs Yarn?**
> **A:** npm: default, slow, deep node_modules tree. pnpm: hard-linked global store, 10× faster, strict (no phantom deps). Yarn 1: classic, fast for its era. Yarn Berry (v2+): zero-installs, PnP (no node_modules), niche. For new projects: pnpm.

**Q2: ONE model.**
> **A:** "package.json = manifest. lockfile = pinned graph. node_modules = installed tree (or PnP for Yarn Berry). Semver ranges (^1.2.3) allow minor/patch updates within compatible majors."

**Q3: Misconception with code.**
> **A:** \`\`\`json
> // ❌ No lockfile committed — CI installs different versions than dev
> // ✅ Commit package-lock.json (npm) or pnpm-lock.yaml (pnpm)
> \`\`\`

**Q4: dependencies vs devDependencies vs peerDependencies?**
> **A:** dependencies: runtime, bundled. devDependencies: build/test tools, not bundled. peerDependencies: "host app provides this" — used by libraries to share React/Vue instance with the consuming app.

**Q5: Senior one-liner.**
> **A:** "Package managers resolve a semver graph into a deterministic install via lockfiles — npm's design produces deep duplicated trees, pnpm's hard-linked store eliminates duplication, and skipping the lockfile produces 'works on my machine' incidents at every job change."`,

    build: `## BUILD

### 🏗️ Mini Project: Migrate Project from npm to pnpm
**Time:** 20 minutes

#### Step 1 — Setup
\`\`\`bash
# Install pnpm
npm i -g pnpm
cd existing-project
\`\`\`

#### Step 2 — Migrate
\`\`\`bash
# Remove npm artifacts
rm -rf node_modules package-lock.json
# Install with pnpm
pnpm install
# pnpm-lock.yaml created
\`\`\`

#### Step 3 — Verify Speed
\`\`\`bash
time npm install        # Baseline: maybe 60s
rm -rf node_modules
time pnpm install       # Maybe 8s
\`\`\`

#### Step 4 — Verify Disk Usage
\`\`\`bash
du -sh ~/.local/share/pnpm/store  # One global store
du -sh node_modules               # Hard links into store, tiny on disk
\`\`\`

**Expected Output:** 5-10× faster install, smaller disk footprint.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** dependencies vs devDependencies vs peerDependencies.
**Q2:** Why commit a lockfile?
**Q3:** Write \`npm install\` commands for: runtime, dev, peer.

### Day 3
**Q4:** ^1.2.3 vs ~1.2.3 vs 1.2.3 — what each allows.
**Q5:** Show the no-lockfile reproducibility bug.
**Q6:** pnpm vs npm — concrete speed/space differences.

### Day 7
**Q7:** Use \`npm audit\` (or \`pnpm audit\`) to find and fix vulnerabilities.
**Q8:** PR upgrades a major version of React without testing. Describe the regression risk.
**Q9:** What is a phantom dependency and how does pnpm prevent it?

### Day 14
**Q10:** ★ "Choose a package manager for a 50-package monorepo and justify."
**Q11:** Link package-manager → lockfile → semver → CI.
**Q12:** ★ "A transitive dependency vulnerability ships to production. Walk the response."`
  },

  // ─── Batch 6: Databases, ORM, system ─────────────────────────────────
  'databases-intro': {
    feynman: `## FEYNMAN CHECK

### Explain Databases Like I'm 10 Years Old
> A database is an organised, queryable, persistent store. Relational DBs (PostgreSQL, MySQL) store rows in tables with strict schemas + ACID transactions; NoSQL (MongoDB, DynamoDB) stores flexible documents/key-values. The non-obvious part: 99% of "I need NoSQL for scale" turns out to be wrong — PostgreSQL handles 100k+ TPS with proper indexing and connection pooling. NoSQL is for specific access patterns (giant key-value workloads, schemaless documents), not a general scale fix.

---

### 5 Deep Questions
**Q1: SQL vs NoSQL — when each?**
> **A:** SQL: relational data, transactions, joins, strong consistency, complex queries (most apps). NoSQL Document (Mongo): nested JSON, flexible schema, single-collection queries. NoSQL KV (Redis, DynamoDB): O(1) lookups by key, caches, sessions. NoSQL Graph (Neo4j): many-to-many traversals (social, fraud). Don't pick NoSQL for "scale" — pick for access pattern.

**Q2: ONE model.**
> **A:** "DB = persistent indexed store + query engine + transaction manager. Relational = normalised tables with foreign keys + JOIN; NoSQL = denormalised aggregates optimised for specific access patterns."

**Q3: Misconception with code.**
> **A:** \`\`\`sql
> -- ❌ Full table scan on million-row table
> SELECT * FROM orders WHERE user_id = 42;  -- 5 seconds, no index
> -- ✅ Index on user_id
> CREATE INDEX idx_orders_user ON orders(user_id);
> -- Same query: 2 ms
> \`\`\`

**Q4: What is ACID?**
> **A:** Atomicity (transaction all or nothing), Consistency (constraints upheld), Isolation (concurrent transactions don't interfere — controlled by isolation level), Durability (committed = survives crash). PostgreSQL gives all four; many NoSQL trade isolation/consistency for availability (CAP theorem).

**Q5: Senior one-liner.**
> **A:** "A database is an indexed persistent store with a query planner and a concurrency model — relational gives ACID + arbitrary queries, NoSQL gives access-pattern-specialised storage, and choosing wrong creates either 10× cost or 10× operational complexity."`,

    build: `## BUILD

### 🏗️ Mini Project: Postgres Setup + Query Plan Comparison
**Time:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
docker run --name pg -e POSTGRES_PASSWORD=pw -p 5432:5432 -d postgres:16
docker exec -it pg psql -U postgres
\`\`\`

#### Step 2 — Schema + Data
\`\`\`sql
CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT, total NUMERIC);
INSERT INTO orders (user_id, total)
SELECT (random()*1000)::int, random()*1000 FROM generate_series(1, 1000000);
\`\`\`

#### Step 3 — Compare Plans
\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- Seq Scan on orders ... cost=... actual time=120ms
CREATE INDEX idx_orders_user ON orders(user_id);
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- Index Scan using idx_orders_user ... actual time=1ms
\`\`\`

**Expected Output:** ~100× speedup after index.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name 4 DB categories with one example each.
**Q2:** What does ACID stand for?
**Q3:** Write SQL to create a table + index.

### Day 3
**Q4:** SQL vs NoSQL — when each?
**Q5:** Show full-scan-vs-index bug.
**Q6:** EXPLAIN ANALYZE — what does it tell you?

### Day 7
**Q7:** Design schema for a multi-tenant app.
**Q8:** PR adds an N+1 query in production. Quantify.
**Q9:** What is connection pooling and why does it matter?

### Day 14
**Q10:** ★ "Choose a DB for a real-time analytics dashboard."
**Q11:** Link DB → indexing → query-planning → caching.
**Q12:** ★ "Your prod DB CPU is 100% under read load. Five options to mitigate."`
  },

  'database-design': {
    feynman: `## FEYNMAN CHECK

### Explain Database Design Like I'm 10 Years Old
> Database design = deciding what data lives in which tables and how they reference each other. Normalisation (1NF/2NF/3NF) eliminates duplication. Foreign keys enforce integrity. Indexes speed up lookups. The non-obvious part: over-normalisation (10 JOINs to read one screen) and under-normalisation (denormalised JSON columns) both cause production pain. The right answer is "normalised for writes, denormalised views for reads" — separating concerns.

---

### 5 Deep Questions
**Q1: Why normalise?**
> **A:** Single source of truth — update once, reflected everywhere. Avoids inconsistency (user changes email, only one row updated). Reduces storage. Cost: more JOINs to read.

**Q2: ONE model.**
> **A:** "Normalise the source-of-truth tables. Index for read patterns. Use materialised views or caches for read-heavy denormalisation. Use foreign keys + constraints for integrity."

**Q3: Misconception with code.**
> **A:** \`\`\`sql
> -- ❌ Storing CSV in a column — breaks JOINs, breaks queries
> CREATE TABLE posts (id INT, tags TEXT);  -- 'javascript,react,nodejs'
> -- ✅ Many-to-many junction table
> CREATE TABLE post_tags (post_id INT, tag_id INT, PRIMARY KEY (post_id, tag_id));
> \`\`\`

**Q4: When use a many-to-many junction table vs an array column (Postgres)?**
> **A:** Junction table: queryable, indexable, supports cardinality limits, joinable. Array column: faster reads for nested aggregates, harder to constrain. Junction is default; arrays for small fixed-size sets where JOIN cost matters.

**Q5: Senior one-liner.**
> **A:** "Database design balances integrity (normalisation + constraints) against read performance (indexes + denormalised views) — getting it wrong on day one costs 10× the work to migrate at scale."`,

    build: `## BUILD

### 🏗️ Mini Project: Design a Blog Schema
**Time:** 30 minutes

#### Step 2 — Schema
\`\`\`sql
CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, body TEXT, published_at TIMESTAMPTZ);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published_at) WHERE published_at IS NOT NULL;

CREATE TABLE tags (id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE post_tags (post_id INT REFERENCES posts(id) ON DELETE CASCADE, tag_id INT REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (post_id, tag_id));

CREATE TABLE comments (id SERIAL PRIMARY KEY, post_id INT REFERENCES posts(id) ON DELETE CASCADE, user_id INT REFERENCES users(id), body TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE INDEX idx_comments_post ON comments(post_id);
\`\`\`

#### Step 5 — Verify
\`\`\`sql
EXPLAIN ANALYZE SELECT p.*, u.email FROM posts p JOIN users u ON u.id = p.user_id WHERE p.published_at > now() - INTERVAL '7 days';
\`\`\`

**Expected Output:** Index Scan on idx_posts_published.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Define 1NF, 2NF, 3NF.
**Q2:** Why use foreign keys?
**Q3:** Design a User-Post-Tag schema.

### Day 3
**Q4:** When denormalise?
**Q5:** Show CSV-in-column bug + junction-table fix.
**Q6:** What does ON DELETE CASCADE do?

### Day 7
**Q7:** Add a soft-delete pattern (deleted_at column + partial index).
**Q8:** PR adds 6 NULL-able columns to a hot table. Describe schema bloat.
**Q9:** UUID vs serial PK — pros/cons.

### Day 14
**Q10:** ★ "Design schema for a multi-tenant CRM."
**Q11:** Link normalisation → indexing → query-planning → caching.
**Q12:** ★ "Posts table has 1B rows and queries slow down. Partitioning + indexing plan?"`
  },

  'orm-and-jpa': {
    feynman: `## FEYNMAN CHECK

### Explain ORM & JPA Like I'm 10 Years Old
> An ORM (Object-Relational Mapper) translates between your code's objects and SQL tables — \`user.save()\` becomes \`INSERT INTO users\`. JPA is Java's standard ORM spec, implemented by Hibernate. The non-obvious part: ORMs hide SQL until they don't. The N+1 query problem (loading 100 posts then 100 user records one-by-one) is the universal ORM trap, slowing pages 10-100×. This is why "EXPLAIN every query in your test environment" is non-negotiable.

---

### 5 Deep Questions
**Q1: ORM pros and cons?**
> **A:** Pros: less boilerplate, type-safety, schema migrations, query builders. Cons: hides performance issues (N+1), generated SQL can be inefficient, lazy-loading footguns, learning curve per ORM. For 80% of CRUD, ORMs win; for analytics queries, raw SQL still wins.

**Q2: ONE model.**
> **A:** "ORM = object graph ↔ SQL. Eager loading = JOIN. Lazy loading = additional query on access. Transactions = unit of work. Migrations = schema versioning."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ N+1: 1 query for posts + N queries for each post.author
> const posts = await Post.findAll();
> for (const p of posts) console.log((await p.getAuthor()).name);
> // ✅ Eager load with include
> const posts = await Post.findAll({ include: ['author'] });  // 1 query with JOIN
> for (const p of posts) console.log(p.author.name);
> \`\`\`

**Q4: When use raw SQL instead of ORM?**
> **A:** Complex reports/analytics (CTEs, window functions). Bulk operations (INSERT 100k rows — use COPY). Database-specific features (PostgreSQL JSONB ops). Most ORMs provide a raw-SQL escape hatch (\`queryRaw\`); use it freely for these cases.

**Q5: Senior one-liner.**
> **A:** "ORMs trade SQL boilerplate for hidden query patterns — productive for 80% of CRUD, dangerous for queries that touch many rows or relations, which is why senior engineers EXPLAIN every generated query before merging."`,

    build: `## BUILD

### 🏗️ Mini Project: Prisma ORM with Eager Loading
**Time:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir orm-demo && cd orm-demo
npm init -y && npm i prisma @prisma/client
npx prisma init --datasource-provider postgresql
\`\`\`

#### Step 2 — Schema
\`\`\`prisma
// prisma/schema.prisma
model User { id Int @id @default(autoincrement()) email String @unique posts Post[] }
model Post { id Int @id @default(autoincrement()) title String authorId Int author User @relation(fields: [authorId], references: [id]) }
\`\`\`

#### Step 3 — Migrate & Query
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`
\`\`\`js
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ log: ['query'] });

// N+1
const posts = await db.post.findMany();
for (const p of posts) console.log(await db.user.findUnique({ where: { id: p.authorId } }));

// Eager — 1 query
const postsWithAuthors = await db.post.findMany({ include: { author: true } });
\`\`\`

#### Step 5 — Verify
Watch query log — N+1 path emits N+1 queries; include path emits 1.

**Expected Output:** Log shows query count drop from N+1 to 1.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What is an ORM? Name 3.
**Q2:** N+1 problem — describe.
**Q3:** Write Prisma model for User + Post.

### Day 3
**Q4:** Eager vs lazy loading — when each?
**Q5:** Show N+1 bug + eager fix.
**Q6:** When use raw SQL over ORM?

### Day 7
**Q7:** Add pagination and filtering to a Prisma query.
**Q8:** PR fetches all rows then filters in JS. Quantify cost.
**Q9:** Hibernate session vs JPA EntityManager.

### Day 14
**Q10:** ★ "Choose ORM for a Node project with complex reporting needs."
**Q11:** Link ORM → SQL → N+1 → query-planning.
**Q12:** ★ "An endpoint emits 200 queries per request. Diagnose and fix without rewriting."`
  },

  'system-design-basics': {
    feynman: `## FEYNMAN CHECK

### Explain System Design Basics Like I'm 10 Years Old
> System design is laying out the major pieces of a software system and the connections between them — clients, load balancers, services, databases, caches, message queues, CDNs. You decide how requests flow, where data lives, where bottlenecks form, and how to scale each piece. The non-obvious part: system design is about TRADE-OFFS, not "best practices" — consistency vs availability, latency vs cost, simple vs scalable. There is no right answer, only choices appropriate to constraints.

---

### 5 Deep Questions
**Q1: Vertical vs horizontal scaling?**
> **A:** Vertical: bigger machine (easy, limits at ~$50k servers). Horizontal: more machines (complex but unbounded). Modern systems start vertical, go horizontal when one machine can't keep up. Stateless services scale horizontally trivially; stateful (DBs) require partitioning/sharding.

**Q2: ONE model.**
> **A:** "Client → CDN → LB → service tier (stateless, horizontal) → cache → DB (stateful, partitioned). Async work → queue → workers. Identify the bottleneck and scale that layer."

**Q3: Misconception with code.**
> **A:** \`\`\`yaml
> # ❌ Single point of failure — DB outage = total outage
> service: { db: postgres-primary }
> # ✅ Replica + failover + read-replica routing
> service: { db_writer: postgres-primary, db_reader: [postgres-replica-1, postgres-replica-2] }
> \`\`\`

**Q4: What is the CAP theorem?**
> **A:** In a network partition, you choose either Consistency or Availability — not both. Postgres = CP (refuses writes if partitioned). Cassandra = AP (accepts conflicting writes, reconciles later). Real systems mix: financial transactions = CP, social feed = AP. Knowing your domain's tolerance is essential.

**Q5: Senior one-liner.**
> **A:** "System design is the discipline of mapping requirements (RPS, latency SLO, durability, budget) to a topology (services, data stores, async layers, caches) by making explicit trade-offs — and the answer changes every time the constraints change."`,

    build: `## BUILD

### 🏗️ Mini Project: Sketch System Design for a URL Shortener
**Time:** 35 minutes

#### Step 1 — Requirements
\`\`\`
- 100M URLs created/day, 10B redirects/day
- Read:write = 100:1
- 6-char short codes
- Sub-100ms p99 redirect latency globally
\`\`\`

#### Step 2 — Capacity Math
\`\`\`
Reads: 10B/day ÷ 86,400s = 115k req/s avg, peak ~3× = 350k
Writes: 100M/day = 1.2k req/s avg
Storage: 100M × 200B/row = 20GB/day, 7.3TB/year
\`\`\`

#### Step 3 — Architecture
\`\`\`
[Client]
  ↓
[Cloudflare CDN cache 5min] ← absorbs 90% of reads
  ↓
[Anycast LB]
  ↓
[Stateless read service (auto-scaling 20-200 pods)]
  ↓
[Redis cache, 95% hit rate, 1ms latency]
  ↓
[Postgres read replica, partitioned by short_code prefix]

Write path: Client → API service → ID generator (Snowflake) → write Postgres + invalidate cache
\`\`\`

#### Step 4 — Failure Modes
\`\`\`
- Cache cold start → 5min of slow redirects → solve with warmup
- DB primary fails → automatic failover ~30s → solve with read-only mode
- Region outage → DNS failover to backup region
\`\`\`

**Expected Output:** Diagram + capacity math + failure plan you could whiteboard in 45 min.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Vertical vs horizontal scaling — when each?
**Q2:** CAP theorem — explain in one paragraph.
**Q3:** Sketch a 3-tier web architecture in 5 boxes.

### Day 3
**Q4:** Latency budget for a 200ms p99 page — how spend it across layers?
**Q5:** Show single-DB-SPOF + replica fix.
**Q6:** Cache invalidation strategies — name three.

### Day 7
**Q7:** Design a global URL shortener (above project at full depth).
**Q8:** PR proposes Cassandra for user profiles "for scale". Critique.
**Q9:** What is a back-of-the-envelope capacity calculation?

### Day 14
**Q10:** ★ "Design Twitter's home timeline."
**Q11:** Link LB → service → cache → DB → queue.
**Q12:** ★ "Your service is hitting 100k req/s and CPU is fine but p99 spikes randomly. Diagnose."`
  },

  // ─── Batch 7: Distributed systems + ops ──────────────────────────────
  'microservices-architecture': {
    feynman: `## FEYNMAN CHECK

### Explain Microservices Like I'm 10 Years Old
> Microservices = breaking one big app (monolith) into many small services that talk over the network. Each service owns one business capability (auth, payments, search) with its own database and team. The non-obvious part: microservices solve organisational problems (10 teams stepping on each other in a monolith) more than technical ones. They INTRODUCE network failure, distributed transactions, observability complexity, and operational burden. This is why "start with a monolith, extract services when team coordination breaks" is now mainstream advice.

---

### 5 Deep Questions
**Q1: When should you adopt microservices?**
> **A:** When team coordination becomes the bottleneck (50+ engineers stepping on each other in one repo). Below ~20 engineers, a modular monolith is faster to ship and operate. The cost of microservices (network, observability, ops) only pays off when team independence > coordination cost.

**Q2: ONE model.**
> **A:** "Service = bounded context with its own DB, owned by one team, deployed independently. Communication via async events (durable, decoupled) or sync APIs (simple, coupled). Distributed monolith = microservices that share a DB or deploy together = worst of both worlds."

**Q3: Misconception with code.**
> **A:** \`\`\`
> # ❌ Distributed monolith — services share DB
> [Auth Service] → [shared.users table] ← [Order Service]
> # Any schema change requires coordinating both
> # ✅ DB per service + events
> [Auth Service] → [auth.users] → publishes UserCreated event
>                                ↓
>                  [Order Service] → [orders.user_summary]
> \`\`\`

**Q4: How do microservices handle distributed transactions?**
> **A:** Avoid them. Use Saga pattern: chain of local transactions + compensating actions on failure. Or use outbox pattern: write business data + event in same transaction, separate process publishes events. Two-phase commit across services is fragile and rare in modern systems.

**Q5: Senior one-liner.**
> **A:** "Microservices trade in-process complexity for distributed-systems complexity — they solve team-scale coordination but introduce network failure, eventual consistency, and observability burden, which is why the modular monolith remains the right starting point for most teams."`,

    build: `## BUILD

### 🏗️ Mini Project: Two-Service Architecture with Events
**Time:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
docker run -d --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management
mkdir auth-svc order-svc
\`\`\`

#### Step 2 — Auth Service publishes
\`\`\`js
// auth-svc/server.js
const amqp = require('amqplib');
async function publish(event) {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertExchange('user.events', 'topic', { durable: true });
  ch.publish('user.events', 'user.created', Buffer.from(JSON.stringify(event)));
}
// On signup: publish({ id: 42, email: 'a@b.co' });
\`\`\`

#### Step 3 — Order Service subscribes
\`\`\`js
// order-svc/server.js
const conn = await amqp.connect('amqp://localhost');
const ch = await conn.createChannel();
await ch.assertExchange('user.events', 'topic', { durable: true });
const { queue } = await ch.assertQueue('order.user-projection', { durable: true });
await ch.bindQueue(queue, 'user.events', 'user.*');
ch.consume(queue, (msg) => {
  const event = JSON.parse(msg.content);
  console.log('Order svc projecting:', event);
  // INSERT INTO order.user_summary ...
  ch.ack(msg);
});
\`\`\`

#### Step 5 — Test
Auth signs up user → publishes → Order projects without direct call.

**Expected Output:** Decoupled flow — Order survives Auth being offline.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Monolith vs microservices — when each?
**Q2:** What is a distributed monolith?
**Q3:** Sketch 3 microservices with their communication.

### Day 3
**Q4:** Sync API vs async event — when each?
**Q5:** Show shared-DB anti-pattern + DB-per-service fix.
**Q6:** What is the Saga pattern?

### Day 7
**Q7:** Implement an outbox pattern for reliable event publishing.
**Q8:** PR adds direct DB access from Service B to Service A's table. Critique.
**Q9:** What is a service mesh (Istio/Linkerd) and what does it solve?

### Day 14
**Q10:** ★ "Migrate a monolith to microservices — what's the strangler-fig strategy?"
**Q11:** Link microservices → events → saga → observability.
**Q12:** ★ "Your microservices have 200ms p99 from cascading sync calls. Architectural fix?"`
  },

  'message-queues': {
    feynman: `## FEYNMAN CHECK

### Explain Message Queues Like I'm 10 Years Old
> A message queue (RabbitMQ, SQS, Kafka) is the asynchronous middle-man between services. Producer puts a job in the queue; consumer takes one off and processes it. The non-obvious part: queues give you durability (jobs survive consumer crashes), back-pressure (slow consumers don't break producers), and decoupling (producer doesn't need to know who consumes). The trap: at-least-once delivery means consumers MUST be idempotent — handling the same message twice safely.

---

### 5 Deep Questions
**Q1: When do you need a message queue?**
> **A:** Slow operations (email sending, report generation) — return 200 immediately, process async. Decoupling producer/consumer deploys. Smoothing traffic spikes. Fan-out (one event, many subscribers). Don't add a queue for synchronous request/response — adds 50ms+ latency and no benefit.

**Q2: ONE model.**
> **A:** "Producer → broker → queue → consumer. Acks confirm processing. Retry on failure. Dead-letter queue holds messages that failed N times. At-least-once delivery = idempotent consumers required."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Non-idempotent consumer — duplicate delivery charges twice
> async function processPayment(msg) {
>   await chargeCustomer(msg.amount);
>   ack();
> }
> // ✅ Idempotency key prevents double-charge
> async function processPayment(msg) {
>   if (await alreadyProcessed(msg.idempotencyKey)) return ack();
>   await chargeCustomer(msg.amount, msg.idempotencyKey);
>   await markProcessed(msg.idempotencyKey);
>   ack();
> }
> \`\`\`

**Q4: RabbitMQ vs Kafka — when each?**
> **A:** RabbitMQ: task queues, work distribution, low latency, modest throughput. Kafka: event streaming, replay, high throughput (millions/sec), log-based, multiple consumers replay the same events. SQS (AWS): managed, simple, scales massively, less control.

**Q5: Senior one-liner.**
> **A:** "A message queue is durable async coupling between producer and consumer with at-least-once delivery semantics — its value is back-pressure + replay + decoupling, and skipping idempotent consumers is the #1 production data corruption bug in event-driven systems."`,

    build: `## BUILD

### 🏗️ Mini Project: RabbitMQ Worker with Retry + Dead-Letter
**Time:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
docker run -d --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management
npm init -y && npm i amqplib
touch producer.js consumer.js
\`\`\`

#### Step 2 — Setup Queues with DLQ
\`\`\`js
// setup.js
const amqp = require('amqplib');
(async () => {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertExchange('jobs.dlx', 'direct', { durable: true });
  await ch.assertQueue('jobs.dlq', { durable: true });
  await ch.bindQueue('jobs.dlq', 'jobs.dlx', 'failed');
  await ch.assertQueue('jobs.work', { durable: true, deadLetterExchange: 'jobs.dlx', deadLetterRoutingKey: 'failed' });
  conn.close();
})();
\`\`\`

#### Step 3 — Producer
\`\`\`js
ch.sendToQueue('jobs.work', Buffer.from(JSON.stringify({ id: 42, amount: 100 })), { persistent: true });
\`\`\`

#### Step 4 — Consumer with Retry
\`\`\`js
ch.consume('jobs.work', async (msg) => {
  const job = JSON.parse(msg.content);
  try { await process(job); ch.ack(msg); }
  catch { ch.nack(msg, false, false); /* Routes to DLQ */ }
});
\`\`\`

#### Step 5 — Test
Send a job that throws → ends up in jobs.dlq → manually inspect via management UI.

**Expected Output:** Failed jobs visible in DLQ, not lost.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Sync vs async — when async via queue?
**Q2:** What does at-least-once delivery mean for consumers?
**Q3:** Write a 10-line producer + consumer with amqplib.

### Day 3
**Q4:** RabbitMQ vs Kafka — when each?
**Q5:** Show non-idempotent consumer bug + idempotency-key fix.
**Q6:** What is a dead-letter queue?

### Day 7
**Q7:** Implement exponential backoff retry in a consumer.
**Q8:** PR processes orders synchronously, blocking the API. Latency cost?
**Q9:** What is exactly-once delivery and why is it hard?

### Day 14
**Q10:** ★ "Design event-driven architecture for an e-commerce checkout."
**Q11:** Link queue → consumer → idempotency → observability.
**Q12:** ★ "Your DLQ has 50k failed messages. Investigation + reprocess plan?"`
  },

  'caching-strategies': {
    feynman: `## FEYNMAN CHECK

### Explain Caching Strategies Like I'm 10 Years Old
> Caching = storing computed/fetched results so the next request returns instantly instead of re-doing the work. Common layers: browser cache, CDN, in-memory app cache, Redis/Memcached, DB query cache. The non-obvious part: cache invalidation is famously hard (Phil Karlton: "There are only two hard things in CS: cache invalidation and naming things"). Stale data served from cache after a write is the #1 cache bug.

---

### 5 Deep Questions
**Q1: Cache-aside vs write-through vs write-behind?**
> **A:** Cache-aside: app reads cache, falls back to DB on miss, writes go to DB only — cache fills lazily. Write-through: writes go to cache AND DB synchronously — always consistent. Write-behind: writes to cache, async to DB — fast but loses data on crash. Cache-aside is most common; write-through for strict consistency.

**Q2: ONE model.**
> **A:** "Cache = key→value+TTL. Read: check cache; if hit, return; if miss, compute, store, return. Write: update source, invalidate cache. TTL bounds staleness; eviction bounds memory."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Cache stampede — 1000 concurrent misses each compute the same expensive value
> let value = await cache.get(key);
> if (!value) {
>   value = await expensiveCompute();
>   await cache.set(key, value);
> }
> // ✅ Single-flight: only one request computes, others wait
> if (inflight.has(key)) return inflight.get(key);
> const p = expensiveCompute().then(v => { cache.set(key, v); inflight.delete(key); return v; });
> inflight.set(key, p);
> return p;
> \`\`\`

**Q4: What is cache invalidation and what strategies exist?**
> **A:** TTL-based: simple, eventual consistency, may serve stale. Event-driven: publish invalidation on write — accurate, complex. Versioned keys: include version in key (user:42:v3) — naturally invalidates by changing version. Choose by acceptable staleness window.

**Q5: Senior one-liner.**
> **A:** "Caching is a memory/latency tradeoff governed by invalidation policy (TTL, event, version), eviction policy (LRU, LFU), and stampede protection (single-flight) — and ignoring any one of the three produces production incidents at scale."`,

    build: `## BUILD

### 🏗️ Mini Project: Cache-Aside with Single-Flight Protection
**Time:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
npm init -y && npm i ioredis
touch cache.js
\`\`\`

#### Step 2 — Core
\`\`\`js
const Redis = require('ioredis');
const redis = new Redis();
const inflight = new Map();

async function cached(key, ttlSec, compute) {
  // 1. Try cache
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  // 2. Single-flight — coalesce concurrent misses
  if (inflight.has(key)) return inflight.get(key);
  const promise = (async () => {
    const value = await compute();
    await redis.set(key, JSON.stringify(value), 'EX', ttlSec);
    return value;
  })();
  inflight.set(key, promise);
  try { return await promise; }
  finally { inflight.delete(key); }
}

// Usage
async function getUser(id) {
  return cached(\`user:\${id}\`, 60, async () => {
    console.log('DB hit for', id);
    return { id, name: 'Alice' };
  });
}

(async () => {
  await Promise.all([getUser(1), getUser(1), getUser(1)]); // 1 DB hit, not 3
})();
\`\`\`

#### Step 4 — Invalidation
\`\`\`js
async function updateUser(id, data) {
  await db.update(id, data);
  await redis.del(\`user:\${id}\`);  // invalidate
}
\`\`\`

**Expected Output:** Log shows 1 DB hit for 3 concurrent calls.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name 3 cache layers in a typical web app.
**Q2:** Cache-aside vs write-through.
**Q3:** Write a 15-line cache-aside helper.

### Day 3
**Q4:** What is cache stampede?
**Q5:** Show stampede bug + single-flight fix.
**Q6:** TTL vs event-driven invalidation.

### Day 7
**Q7:** Build a versioned-key cache for user profiles.
**Q8:** PR sets TTL to 1 hour on a heavily-edited resource. Staleness impact?
**Q9:** LRU vs LFU eviction — when each?

### Day 14
**Q10:** ★ "Design caching for a product catalogue with 10M items + frequent price updates."
**Q11:** Link caching → invalidation → eviction → consistency.
**Q12:** ★ "Cache hit rate dropped from 95% → 60%. Diagnose."`
  },

  'performance-optimization': {
    feynman: `## FEYNMAN CHECK

### Explain Performance Optimization Like I'm 10 Years Old
> Performance optimisation is a feedback loop: MEASURE → identify bottleneck → fix → measure again. Never optimise without measuring — you almost certainly guess wrong about where time goes. The non-obvious part: 80% of perceived performance is network + first paint, not CPU. A 50ms backend with 3s of bundle parsing FEELS slow; a 500ms backend with instant render FEELS fast.

---

### 5 Deep Questions
**Q1: What are the Core Web Vitals?**
> **A:** LCP (Largest Contentful Paint) < 2.5s — perceived load speed. FID/INP (Interaction to Next Paint) < 200ms — responsiveness. CLS (Cumulative Layout Shift) < 0.1 — visual stability. Google ranks SEO partly on these — they're not optional for content sites.

**Q2: ONE model.**
> **A:** "Optimisation = profile → identify p95 bottleneck → fix → re-profile. Frontend = network, parse, render. Backend = DB, IO, CPU. Each layer has different tools (Chrome DevTools, APM, flame graphs)."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Micro-optimisation that doesn't matter
> for (let i = 0, len = arr.length; i < len; i++) {} // saves 0.001ms
> // ✅ Macro-optimisation that does
> const results = await Promise.all(ids.map(fetchUser)); // parallelise 10 serial fetches
> \`\`\`

**Q4: When is asynchronous parallelism the right fix?**
> **A:** When operations are independent (no data dependency). Fetching 10 user records: parallel. Computing then storing: serial. Use \`Promise.all\` for unbounded parallel, \`p-limit\` for bounded (avoid hammering downstreams).

**Q5: Senior one-liner.**
> **A:** "Performance optimisation is a measurement discipline — profile, find the p95 bottleneck, fix it, re-profile — because intuition is wrong 80% of the time and the cost of optimising the wrong thing is opportunity cost on real bottlenecks."`,

    build: `## BUILD

### 🏗️ Mini Project: Profile and Fix a Slow Endpoint
**Time:** 35 minutes

#### Step 1 — Slow Endpoint
\`\`\`js
// server.js
app.get('/api/dashboard', async (req, res) => {
  const user = await db.users.findById(req.user.id);     // 50ms
  const orders = await db.orders.findByUser(req.user.id); // 80ms
  const prefs = await db.prefs.findByUser(req.user.id);   // 30ms
  // Total: 160ms serial
  res.json({ user, orders, prefs });
});
\`\`\`

#### Step 2 — Profile
\`\`\`bash
node --prof server.js
# Hit endpoint 1000 times with autocannon
autocannon http://localhost:3000/api/dashboard
# Process the profile
node --prof-process isolate-0x...-v8.log > prof.txt
\`\`\`

#### Step 3 — Optimise: Parallel
\`\`\`js
app.get('/api/dashboard', async (req, res) => {
  const [user, orders, prefs] = await Promise.all([
    db.users.findById(req.user.id),
    db.orders.findByUser(req.user.id),
    db.prefs.findByUser(req.user.id),
  ]);
  // Total: 80ms (max of the three)
  res.json({ user, orders, prefs });
});
\`\`\`

#### Step 4 — Cache Hot Reads
\`\`\`js
const prefs = await cached(\`prefs:\${req.user.id}\`, 300, () => db.prefs.findByUser(req.user.id));
// Future reads: 1ms instead of 30ms
\`\`\`

#### Step 5 — Verify
\`\`\`bash
autocannon http://localhost:3000/api/dashboard
# Before: 160ms p99; After parallel: 80ms; After cache: 50ms
\`\`\`

**Expected Output:** 3× latency reduction without changing logic.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name the 3 Core Web Vitals.
**Q2:** Why measure before optimising?
**Q3:** Show serial → parallel conversion.

### Day 3
**Q4:** Frontend vs backend optimisation priorities.
**Q5:** Show micro-optimisation that doesn't matter + macro that does.
**Q6:** APM vs profiler vs flame graph — when each?

### Day 7
**Q7:** Profile a slow endpoint and document the bottleneck.
**Q8:** PR adds Lodash import (200KB) for one function. LCP impact?
**Q9:** What is layout thrashing in browsers?

### Day 14
**Q10:** ★ "Your app's TTFB is 800ms. Diagnostic flow + 3 likely causes."
**Q11:** Link perf → profiling → caching → architecture.
**Q12:** ★ "Reduce Time-to-Interactive from 8s to under 2s — staged plan."`
  },

  'monitoring-and-logging': {
    feynman: `## FEYNMAN CHECK

### Explain Monitoring & Logging Like I'm 10 Years Old
> Monitoring = your system's heart-rate monitor (request rate, error rate, latency, CPU). Logging = the diary (what happened, when, with what data). Together = observability. The non-obvious part: structured logs (JSON with consistent fields) are queryable; plain-text logs (\`console.log('user did thing')\`) are useless at scale. This is why every modern logger emits JSON and ships to a central aggregator (Datadog, New Relic, ELK).

---

### 5 Deep Questions
**Q1: Metrics vs logs vs traces?**
> **A:** Metrics: time-series numbers (cpu, rps, p99). Aggregated, cheap. Logs: discrete events with context. Searchable, expensive. Traces: end-to-end request path across services. Best for diagnosing distributed latency. Modern systems use all three (the "three pillars of observability").

**Q2: ONE model.**
> **A:** "Metrics tell you THAT something is wrong (alert). Logs tell you WHAT happened (context). Traces tell you WHERE the time went (root cause). Pick the right tool per phase of incident."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ Unstructured log — can't filter or aggregate
> console.log('User logged in: ' + user.id);
> // ✅ Structured JSON — queryable in Datadog/Splunk
> logger.info({ event: 'login', userId: user.id, ip: req.ip, durationMs: t });
> \`\`\`

**Q4: What is a SLO/SLI/SLA?**
> **A:** SLI = indicator (p99 latency, error rate). SLO = objective (99.9% of requests < 200ms). SLA = contract with consequences (refund if SLO breached). SRE practice: alert on SLO burn rate, not raw metrics — fewer false positives.

**Q5: Senior one-liner.**
> **A:** "Monitoring + logging + tracing form the three pillars of observability, each answering a different question (what's wrong vs what happened vs where the time went) — and structured, sampled, correlated telemetry is the difference between a 5-minute root cause and a 5-hour war room."`,

    build: `## BUILD

### 🏗️ Mini Project: Structured Logging + Metrics for Express
**Time:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir obs && cd obs
npm init -y && npm i express pino pino-http prom-client
touch server.js
\`\`\`

#### Step 2 — Logger
\`\`\`js
const pino = require('pino');
const logger = pino({ level: 'info' });   // JSON output
const httpLogger = require('pino-http')({ logger });
\`\`\`

#### Step 3 — Metrics
\`\`\`js
const { Registry, Counter, Histogram } = require('prom-client');
const registry = new Registry();
const httpRequests = new Counter({ name: 'http_requests_total', help: 'Total', labelNames: ['method','route','status'], registers: [registry] });
const httpDuration = new Histogram({ name: 'http_request_duration_seconds', help: 'Latency', labelNames: ['route'], registers: [registry] });
\`\`\`

#### Step 4 — Server
\`\`\`js
const express = require('express');
const app = express();
app.use(httpLogger);
app.use((req, res, next) => {
  const end = httpDuration.startTimer({ route: req.path });
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
    end();
  });
  next();
});

app.get('/api/users/:id', (req, res) => {
  req.log.info({ userId: req.params.id }, 'fetching user');
  res.json({ id: req.params.id, name: 'Alice' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});

app.listen(3000);
\`\`\`

#### Step 5 — Verify
\`\`\`bash
curl http://localhost:3000/api/users/42       # JSON log
curl http://localhost:3000/metrics            # Prometheus metrics
\`\`\`

**Expected Output:** JSON logs in stdout; Prometheus metrics at /metrics.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Metrics vs logs vs traces — purpose of each.
**Q2:** Why structured JSON logs?
**Q3:** Write a pino logger and emit a structured event.

### Day 3
**Q4:** SLO vs SLA vs SLI.
**Q5:** Show unstructured-log bug.
**Q6:** What is correlation ID and why does it matter?

### Day 7
**Q7:** Add distributed tracing with OpenTelemetry to a Node app.
**Q8:** PR logs PII (email, password) to stdout. Compliance + cost impact?
**Q9:** What is log sampling and when do you need it?

### Day 14
**Q10:** ★ "Design observability for a 50-service architecture."
**Q11:** Link logs → metrics → traces → alerts.
**Q12:** ★ "Your alert fires every 10 min with no real issue. Diagnose."`
  },

  // ─── Batch 8: Final 5 — terminal, git, security, backend, devtools ────
  'terminal-basics': {
    feynman: `## FEYNMAN CHECK

### Explain Terminal Basics Like I'm 10 Years Old
> The terminal is a text interface for talking to your computer. Instead of clicking, you TYPE commands. \`ls\` = "list files", \`cd folder\` = "go into folder", \`grep pattern file\` = "find pattern". The non-obvious part: pipelines are the superpower — \`cat log.txt | grep ERROR | wc -l\` chains commands together, each reading the previous's output. This is why senior devs work 5× faster in the terminal than in GUIs for repetitive tasks.

---

### 5 Deep Questions
**Q1: Why use the terminal over GUI?**
> **A:** Scriptable (automate anything you can type), composable (pipes), remote (SSH), uniform across machines, faster for repetitive ops. GUIs win for exploration, terminals win for production.

**Q2: ONE model.**
> **A:** "Everything is a file or a process. Commands read stdin and write stdout/stderr. Pipes (|) connect them. Redirection (>, <, 2>) routes streams. Exit code (0 success, non-zero failure) drives chaining (&&, ||)."

**Q3: Misconception with code.**
> **A:** \`\`\`bash
> # ❌ Word splitting bug — spaces in filenames break this
> for f in $(ls); do rm $f; done
> # ✅ Quote everything
> for f in *; do rm "$f"; done
> # Or use find -print0 | xargs -0 for arbitrary filenames
> \`\`\`

**Q4: What is the difference between stdin/stdout/stderr?**
> **A:** stdin (fd 0): input stream. stdout (fd 1): normal output. stderr (fd 2): error/diagnostic output. \`> file\` redirects stdout; \`2> file\` redirects stderr; \`2>&1\` merges. Separating allows piping stdout while logging stderr.

**Q5: Senior one-liner.**
> **A:** "The terminal is a composable text-interface over Unix primitives (files, processes, pipes, signals) — and fluency multiplies engineering velocity because every diagnostic, deploy, and DB query is faster typed than clicked."`,

    build: `## BUILD

### 🏗️ Mini Project: Log Analysis Pipeline
**Time:** 20 minutes

#### Step 1 — Setup
\`\`\`bash
# Generate sample log
for i in $(seq 1 1000); do
  status=$((200 + (RANDOM % 4) * 100))
  echo "$(date -Iseconds) GET /api/users/$i $status" >> access.log
done
\`\`\`

#### Step 2 — Common Patterns
\`\`\`bash
# Count errors by status
grep -E ' 5[0-9]{2}$' access.log | wc -l

# Top requested paths
awk '{print $3}' access.log | sort | uniq -c | sort -rn | head -10

# Errors per minute
grep ' 500$' access.log | cut -c1-16 | uniq -c

# Watch live
tail -f access.log | grep --color ' 5[0-9]{2}'

# Find files modified in last 5 min
find . -type f -mmin -5
\`\`\`

#### Step 3 — Pipeline Chain
\`\`\`bash
# Compute p99 latency from a "duration_ms" log column
awk '{print $5}' access.log | sort -n | awk 'NR == int(NR * 0.99)'
\`\`\`

**Expected Output:** Top 10 paths and total 500 count printed in <1s on 1M lines.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** What does \`|\` do? What does \`>\` do?
**Q2:** stdout vs stderr — when separate them?
**Q3:** Write a one-liner to count errors in a log.

### Day 3
**Q4:** \`grep\` vs \`ag\` vs \`rg\` — what differs?
**Q5:** Show word-splitting bug + quoting fix.
**Q6:** What does \`&&\` vs \`||\` do for chaining?

### Day 7
**Q7:** Write a bash function that retries a command 3 times with backoff.
**Q8:** PR uses \`rm -rf\` without confirmation in a deploy script. Risks?
**Q9:** What is a heredoc and when to use one?

### Day 14
**Q10:** ★ "Construct a one-liner to find the 5 slowest endpoints in 10GB of NGINX logs."
**Q11:** Link terminal → pipes → scripts → automation.
**Q12:** ★ "Build a daily report from logs as a bash script + cron."`
  },

  'git-workflow': {
    feynman: `## FEYNMAN CHECK

### Explain Git Workflow Like I'm 10 Years Old
> A git workflow is the agreed pattern for how a team uses branches, commits, and PRs. Trunk-based: short-lived branches off main, merge daily. GitFlow: long-lived develop + release branches (complex, mostly dead). GitHub Flow: feature branches + PR + CI + merge to main. The non-obvious part: workflow disagreements waste days; pick one, document it, enforce via CI (branch protection, required reviews). Most modern teams use trunk-based or GitHub Flow with feature flags.

---

### 5 Deep Questions
**Q1: Trunk-based vs GitFlow vs GitHub Flow?**
> **A:** Trunk-based: all to main, feature flags for incomplete work, daily merges. GitFlow: develop branch + release branches + hotfix branches — heavy, suits scheduled releases. GitHub Flow: short-lived feature branches → PR → merge — pragmatic default. Most SaaS teams use GitHub Flow or trunk-based.

**Q2: ONE model.**
> **A:** "Branch = isolated work. PR = review checkpoint. CI = quality gate. Merge to main = ship. Short branches reduce conflicts; long branches accumulate debt."

**Q3: Misconception with code.**
> **A:** \`\`\`bash
> # ❌ Long-lived feature branch — 100+ commits, painful merge
> git checkout -b epic/redesign  # branches for 3 months
> # ✅ Short-lived branch + feature flag
> git checkout -b feat/new-button  # 1-3 days, behind FLAG_NEW_BUTTON
> \`\`\`

**Q4: What is git rebase vs merge?**
> **A:** Merge: creates merge commit, preserves history. Rebase: rewrites your commits on top of target — linear history. Use rebase for feature branches before merging; merge for shared branches. NEVER rebase shared branches — rewrites history others depend on.

**Q5: Senior one-liner.**
> **A:** "Git workflow is the team's contract for branching, reviewing, and merging — short-lived branches with feature flags beat long-lived branches with hopes, and the workflow's enforcement (CI gates + branch protection) matters more than which workflow you pick."`,

    build: `## BUILD

### 🏗️ Mini Project: GitHub Flow with Conventional Commits + Branch Protection
**Time:** 25 minutes

#### Step 1 — Repo Setup
\`\`\`bash
git init my-project && cd my-project
git checkout -b main
echo "# Project" > README.md
git add . && git commit -m "chore: initial"
git remote add origin git@github.com:you/my-project.git
git push -u origin main
\`\`\`

#### Step 2 — Branch Protection (on GitHub.com)
\`\`\`
Settings → Branches → Add rule → main
- Require PR before merging
- Require status checks (CI)
- Require linear history
- Include administrators
\`\`\`

#### Step 3 — Feature Branch
\`\`\`bash
git checkout -b feat/login-button
# work, commit
git commit -m "feat(auth): add login button" -m "Closes #42"
git push -u origin feat/login-button
gh pr create --fill
\`\`\`

#### Step 4 — Conventional Commits
\`\`\`
feat: new feature
fix: bug fix
chore: tooling/maintenance
docs: docs only
refactor: code change, no behaviour change
test: tests
\`\`\`

#### Step 5 — Rebase Before Merge
\`\`\`bash
git fetch origin
git rebase origin/main
git push --force-with-lease
\`\`\`

**Expected Output:** Linear commit history on main; every change behind a reviewed PR.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Trunk-based vs GitHub Flow vs GitFlow.
**Q2:** Rebase vs merge — when each?
**Q3:** Write 3 conventional commit messages.

### Day 3
**Q4:** Why short-lived branches?
**Q5:** Show long-branch pain + feature-flag fix.
**Q6:** What does \`--force-with-lease\` protect against vs \`--force\`?

### Day 7
**Q7:** Set up Husky + commitlint to enforce conventional commits.
**Q8:** PR rebases shared branch and force-pushes. Describe the team impact.
**Q9:** What is git bisect and when do you need it?

### Day 14
**Q10:** ★ "Define a git workflow for a 50-engineer team — what gates and conventions?"
**Q11:** Link git → branching → CI → release.
**Q12:** ★ "Your main branch has 3 broken builds. Recovery plan + prevention."`
  },

  'version-control-basics': {
    feynman: `## FEYNMAN CHECK

### Explain Version Control Like I'm 10 Years Old
> Version control = a time machine for your code. Every commit is a snapshot you can revisit, compare, or revert. Git is the most popular VCS. The non-obvious part: git tracks CHANGES (snapshots referencing parent commits), not files in isolation — which is why branching and merging are cheap (just pointers) and why \`git log\` can show the entire history of any line. This is the foundation for code review, blame, and rollback.

---

### 5 Deep Questions
**Q1: Why git vs older VCSes (SVN, CVS)?**
> **A:** Distributed (every clone is full history), fast branching (pointers, not file copies), offline commits, content-addressed (commits identified by SHA of content), staging area for partial commits. SVN's central repo is a SPOF; git has no central authority.

**Q2: ONE model.**
> **A:** "Working tree → staging area → local commit → remote. Each commit is a snapshot + parent pointer. Branches = movable pointers to commits. Merge = new commit with multiple parents."

**Q3: Misconception with code.**
> **A:** \`\`\`bash
> # ❌ Vague commit message — useless in git log
> git commit -m "fix"
> # ✅ Conventional, descriptive
> git commit -m "fix(auth): prevent double-submission of login form"
> \`\`\`

**Q4: What is the staging area / index?**
> **A:** Intermediate area between working tree and commits. \`git add\` moves changes here; \`git commit\` snapshots the staged state. Lets you split a working session into logical commits — \`git add -p\` interactively stages chunks.

**Q5: Senior one-liner.**
> **A:** "Version control is content-addressed history with movable branch pointers — its real value is fearless experimentation (cheap branches), provable provenance (every line has authorship), and reversible mistakes (every state is recoverable)."`,

    build: `## BUILD

### 🏗️ Mini Project: Git Essentials in 10 Commands
**Time:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
\`\`\`

#### Step 2 — Local Repo
\`\`\`bash
mkdir demo && cd demo && git init
echo "# Demo" > README.md
git add README.md
git commit -m "chore: initial commit"
git log --oneline
\`\`\`

#### Step 3 — Branch + Merge
\`\`\`bash
git checkout -b feat/intro
echo "Intro paragraph" >> README.md
git commit -am "feat: add intro"
git checkout main
git merge --no-ff feat/intro -m "Merge: intro feature"
\`\`\`

#### Step 4 — Inspect
\`\`\`bash
git log --graph --oneline --all
git blame README.md
git diff HEAD~1 HEAD
\`\`\`

#### Step 5 — Undo
\`\`\`bash
git revert HEAD                    # creates a new "undo" commit
git reset --soft HEAD~1            # uncommit, keep changes staged
git reset --hard HEAD~1            # nuclear: drop commit + changes (careful)
\`\`\`

**Expected Output:** Full local git workflow with merge, blame, and safe undo.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Working tree vs staging vs commit.
**Q2:** Why is git distributed?
**Q3:** Write 5 essential git commands.

### Day 3
**Q4:** Soft vs mixed vs hard reset — what stays/changes.
**Q5:** Show vague commit + descriptive fix.
**Q6:** What does \`git stash\` do?

### Day 7
**Q7:** Use \`git rebase -i\` to squash 5 commits into 1.
**Q8:** PR does \`git reset --hard\` to discard a colleague's commit. Recovery?
**Q9:** What is the reflog and how does it save you?

### Day 14
**Q10:** ★ "Recover code that was accidentally force-pushed over."
**Q11:** Link git → branching → workflow → CI.
**Q12:** ★ "Onboard a new engineer to git — what 10 commands are essential?"`
  },

  'spring-boot-or-nodejs-backend': {
    feynman: `## FEYNMAN CHECK

### Explain Backend Choice (Spring Boot vs Node.js) Like I'm 10 Years Old
> Spring Boot (Java) and Node.js (JS) are two popular ways to build server-side apps. Spring Boot = enterprise-grade, type-safe, mature ecosystem, JVM performance, larger memory footprint. Node.js = JavaScript everywhere, fast I/O, huge npm ecosystem, lighter footprint, single-threaded gotchas. The non-obvious part: language is a smaller factor than ecosystem fit (team skills, third-party SDKs) and operational model. Most teams pick what their team knows — the cost of mis-pick is months of slow shipping.

---

### 5 Deep Questions
**Q1: Spring Boot strengths vs Node.js?**
> **A:** Spring: static typing, mature DI/AOP, transaction management, JVM observability, multi-threading. Node: faster I/O concurrency, JS shared with frontend, smaller cold starts, npm scale. Spring wins on enterprise integration (Kafka, Oracle, LDAP); Node wins on I/O-heavy APIs and edge functions.

**Q2: ONE model.**
> **A:** "Pick by: team skills (biggest factor), operational maturity (Spring needs more JVM tuning), ecosystem fit (Node for JS SDKs, Spring for Java SDKs), and workload (CPU-heavy = JVM, I/O-heavy = Node)."

**Q3: Misconception with code.**
> **A:** \`\`\`
> # ❌ Picking Node for CPU-bound work
> // CSV-processing service in Node — single thread, blocks
> # ✅ JVM thread pool handles CPU work natively
> // Same in Spring — parallel processing via thread pool
> \`\`\`

**Q4: When is the choice strategic vs tactical?**
> **A:** Greenfield startup: tactical — use what the founders know. Enterprise platform serving 100 teams: strategic — invest in tooling, observability, golden paths around one stack. Mid-size SaaS often runs both: Node for edge/BFF, Spring for core business services.

**Q5: Senior one-liner.**
> **A:** "Backend choice is dominated by team familiarity and ecosystem fit, with secondary factors of workload (I/O vs CPU) and operational tooling — both Spring Boot and Node are production-grade at 10M users, the difference is in time-to-ship and on-call burden."`,

    build: `## BUILD

### 🏗️ Mini Project: Same API in Spring Boot AND Node.js
**Time:** 40 minutes

#### Step 1 — Setup Both
\`\`\`bash
# Node side
mkdir node-api && cd node-api && npm init -y && npm i express
# Spring Boot side (with Spring Initializr CLI or web)
spring init --dependencies=web spring-api && cd spring-api
\`\`\`

#### Step 2 — Node Implementation
\`\`\`js
// node-api/server.js
const express = require('express');
const app = express();
app.use(express.json());
const users = new Map();
app.get('/users/:id', (req, res) => {
  const u = users.get(req.params.id);
  if (!u) return res.sendStatus(404);
  res.json(u);
});
app.post('/users', (req, res) => {
  const id = String(Date.now());
  users.set(id, { id, ...req.body });
  res.status(201).json(users.get(id));
});
app.listen(3000);
\`\`\`

#### Step 3 — Spring Boot Implementation
\`\`\`java
// src/main/java/.../UserController.java
@RestController @RequestMapping("/users")
class UserController {
  private final Map<String, User> users = new ConcurrentHashMap<>();
  @GetMapping("/{id}") ResponseEntity<User> get(@PathVariable String id) {
    var u = users.get(id);
    return u == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(u);
  }
  @PostMapping ResponseEntity<User> create(@RequestBody User in) {
    var id = String.valueOf(System.currentTimeMillis());
    var u = new User(id, in.name(), in.email());
    users.put(id, u);
    return ResponseEntity.status(201).body(u);
  }
}
record User(String id, String name, String email) {}
\`\`\`

#### Step 5 — Benchmark Both
\`\`\`bash
autocannon -c 100 -d 30 http://localhost:3000/users/1
# Node:    ~25k req/s typical
# Spring:  ~15k req/s typical, but constant-time GC pauses
\`\`\`

**Expected Output:** Both APIs functional; Node typically faster for tiny in-memory ops, Spring catching up at scale.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Spring vs Node — strengths of each in one line.
**Q2:** Why is Node bad for CPU work?
**Q3:** Write a GET endpoint in both.

### Day 3
**Q4:** Cold start: Node vs Spring vs GraalVM native image.
**Q5:** Show CPU-bound-in-Node bug.
**Q6:** Dependency injection — Spring's @Autowired vs Node manual.

### Day 7
**Q7:** Add a Postgres-backed endpoint in both.
**Q8:** PR adds Spring Boot to a Node-shop. Cost of fragmentation?
**Q9:** Which has better static analysis — TypeScript or Java?

### Day 14
**Q10:** ★ "Choose backend for a startup with one full-stack engineer."
**Q11:** Link backend → ecosystem → operations → cost.
**Q12:** ★ "Your team runs Spring + Node + Python. Consolidation strategy?"`
  },

  'web-security-advanced': {
    feynman: `## FEYNMAN CHECK

### Explain Advanced Web Security Like I'm 10 Years Old
> Advanced web security = defending against the actual attacks running daily: XSS (inject JS into pages), CSRF (trick browsers into actions), clickjacking (overlay invisible buttons), SQL injection (sneak SQL into inputs), SSRF (trick servers into fetching internal URLs), supply-chain (poison your dependencies). The non-obvious part: defence-in-depth is the only winning strategy — CSP + sanitisation + cookies-with-flags + HTTPS + audit logs. One layer is never enough. This is why "we use HTTPS" is not a security plan.

---

### 5 Deep Questions
**Q1: What is XSS and how do you prevent it?**
> **A:** XSS = attacker injects \`<script>\` into your page that runs in users' browsers, stealing cookies/data. Prevent: escape all user content on output (frameworks do this by default), set CSP header (\`Content-Security-Policy: default-src 'self'\`), set HttpOnly on cookies. Never use \`innerHTML\` with user input.

**Q2: ONE model.**
> **A:** "Threats: input (injection), output (XSS), state (CSRF), transport (MITM), supply chain (deps). Defences: validate input, sanitise output, signed/SameSite cookies, HTTPS+HSTS, dep audit. Defence-in-depth — every layer adds friction for attackers."

**Q3: Misconception with code.**
> **A:** \`\`\`tsx
> // ❌ XSS — user comment renders as HTML
> <div dangerouslySetInnerHTML={{ __html: comment }} />
> // ✅ Framework auto-escapes — text only
> <div>{comment}</div>
> // If HTML must render, sanitise first with DOMPurify
> import DOMPurify from 'dompurify';
> <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment) }} />
> \`\`\`

**Q4: What is CSRF and what defences work?**
> **A:** CSRF = attacker tricks user's browser into submitting a request with the user's cookies. Defences: SameSite=Strict cookies (modern browsers default), CSRF token in form/header (server validates), check Origin/Referer headers. Modern frameworks handle this automatically when configured.

**Q5: Senior one-liner.**
> **A:** "Web security is defence-in-depth against a stable OWASP Top 10 of attacks — CSP, parameterised queries, SameSite cookies, HTTPS+HSTS, dependency audits, and audit logging together close the gaps no single mitigation can — and the breach reports of failed companies are the curriculum."`,

    build: `## BUILD

### 🏗️ Mini Project: Harden an Express App
**Time:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir secure-app && cd secure-app
npm init -y && npm i express helmet csurf cookie-parser express-rate-limit
touch server.js
\`\`\`

#### Step 2 — Defence Layers
\`\`\`js
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. Security headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// 2. Body parsing with size cap
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 3. CSRF protection — issue token on GET, verify on POST/PUT/DELETE
app.use(csurf({ cookie: { httpOnly: true, sameSite: 'strict', secure: true } }));

// 4. Rate-limit auth endpoints heavily
app.use('/api/auth/', rateLimit({ windowMs: 60_000, max: 5 }));
app.use('/api/',      rateLimit({ windowMs: 60_000, max: 100 }));

// 5. Secure cookies
function setSession(res, value) {
  res.cookie('session', value, {
    httpOnly: true,     // XSS can't read
    secure: true,       // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 15 * 60 * 1000,
  });
}

app.get('/form', (req, res) => {
  res.send(\`<form method="POST" action="/api/comment">
    <input name="_csrf" value="\${req.csrfToken()}" type="hidden">
    <textarea name="text"></textarea>
    <button>Post</button>
  </form>\`);
});

app.post('/api/comment', (req, res) => {
  // CSRF middleware already verified the token
  res.json({ ok: true, text: req.body.text });  // Express escapes by default
});

app.listen(3000);
\`\`\`

#### Step 5 — Verify
\`\`\`bash
curl -I http://localhost:3000/   # Inspect security headers (helmet)
# Try a POST without CSRF token — should 403
curl -X POST http://localhost:3000/api/comment -d "text=hi"
\`\`\`

**Expected Output:** Headers present, CSRF blocks token-less POSTs, rate-limit triggers on bursts.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name 5 of OWASP Top 10.
**Q2:** XSS — how does it work and how do you stop it?
**Q3:** Write a CSP header allowing only self-origin scripts.

### Day 3
**Q4:** CSRF defences — name three layers.
**Q5:** Show dangerouslySetInnerHTML bug + DOMPurify fix.
**Q6:** What does SameSite=Strict cookie do?

### Day 7
**Q7:** Add HSTS + CSP + secure cookies to a real app.
**Q8:** PR loads inline scripts violating CSP. Risk + fix.
**Q9:** What is SSRF and how do you prevent it?

### Day 14
**Q10:** ★ "Pen-test your app — what's your 10-item attack checklist?"
**Q11:** Link XSS → CSP → cookies → CSRF.
**Q12:** ★ "A supply-chain compromise injects malicious npm. Detection + response plan."`
  },

  'browser-devtools': {
    feynman: `## FEYNMAN CHECK

### Explain Browser DevTools Like I'm 10 Years Old
> DevTools is the X-ray machine for your webpage. F12 opens panels that let you inspect HTML/CSS (Elements), run JS (Console), watch network requests (Network), profile performance (Performance), inspect storage (Application), and debug breakpoints (Sources). The non-obvious part: DevTools throttles, profiles, and debugs as if it were a real user on a 3G phone — replicating production scenarios you'd never reproduce manually. Senior devs live in DevTools; juniors live in console.log.

---

### 5 Deep Questions
**Q1: What can each major DevTools panel do?**
> **A:** Elements: live DOM/CSS edit. Console: REPL + logs. Network: request timing, headers, payload. Performance: flame chart of render + scripting. Application: cookies, localStorage, IndexedDB, service workers. Sources: breakpoints, watches, conditional breaks. Lighthouse: automated audit (perf, a11y, SEO).

**Q2: ONE model.**
> **A:** "DevTools = panels mapping to browser subsystems. Use Elements for layout bugs, Network for latency, Performance for jank, Sources for logic bugs, Lighthouse for audit baselines."

**Q3: Misconception with code.**
> **A:** \`\`\`js
> // ❌ console.log everywhere — slow and clutters
> function process(x) { console.log('got', x); /* ... */ return result; }
> // ✅ Conditional breakpoint in DevTools — only stops when x > 100, no code change
> // Right-click line in Sources → "Add conditional breakpoint" → "x > 100"
> \`\`\`

**Q4: How do you debug a memory leak using DevTools?**
> **A:** Memory panel → Take heap snapshot → interact with app → Take snapshot → Compare. Detached DOM nodes and growing arrays indicate leaks. Allocation timeline shows what's allocated over time. Chrome's Performance Monitor shows live heap growth.

**Q5: Senior one-liner.**
> **A:** "Browser DevTools is the production debugging tool that runs at the user's network speed, device CPU, and viewport — and fluent use of breakpoints, network throttling, and the performance flame chart distinguishes engineers who diagnose in minutes from those who guess for hours."`,

    build: `## BUILD

### 🏗️ Mini Project: Performance Audit a Real Page
**Time:** 25 minutes

#### Step 1 — Setup
Open Chrome → F12 → DevTools.

#### Step 2 — Network Audit
\`\`\`
1. Network tab → Disable cache
2. Throttling → "Fast 3G"
3. Reload page
4. Sort by Size + Time
5. Identify: largest assets, slowest requests, render-blocking
\`\`\`

#### Step 3 — Performance Profile
\`\`\`
1. Performance tab → click record
2. Interact with page (scroll, click, type)
3. Stop
4. Inspect flame chart:
   - Yellow = scripting
   - Purple = rendering
   - Green = painting
   - Red bars = long tasks (>50ms — blocks interactivity)
\`\`\`

#### Step 4 — Lighthouse Audit
\`\`\`
1. Lighthouse tab → Generate report (Mobile, Performance only)
2. Score 90+ = good
3. Read "Opportunities" — actionable wins
4. Click each → see exactly which files to optimise
\`\`\`

#### Step 5 — Console Power Use
\`\`\`js
// In Console panel
copy(JSON.stringify(window.users, null, 2))   // copy to clipboard
$0                                             // last-inspected element
$$('.row')                                     // querySelectorAll shortcut
console.table(users)                          // tabular view
\`\`\`

**Expected Output:** Lighthouse score + specific bottleneck identified + 3 fixes prioritised.`,

    spacedReview: `## SPACED REVIEW

### Day 1
**Q1:** Name 6 DevTools panels and what each is for.
**Q2:** Network throttling — what does Fast 3G simulate?
**Q3:** Show 3 console power-use shortcuts.

### Day 3
**Q4:** Conditional breakpoint vs console.log — when each?
**Q5:** Show console.log-everywhere bug + breakpoint fix.
**Q6:** What does a yellow vs purple vs red bar mean in the flame chart?

### Day 7
**Q7:** Diagnose a real memory leak using heap snapshots.
**Q8:** PR claims "page is fast" without running Lighthouse on 3G. What's missing?
**Q9:** What is the difference between LCP, FCP, and TTI in Lighthouse?

### Day 14
**Q10:** ★ "Walk through your debugging workflow for a 'page is slow' report."
**Q11:** Link DevTools → Network → Performance → Lighthouse.
**Q12:** ★ "Your app drops 30fps when scrolling. Diagnose using Performance panel."`
  },

  // ─── Stragglers: java-mastery duplicates needing full sections ────────
  'garbage-collection-basics': {
    visual: `## VISUALIZATION_CONFIG\n\n\`\`\`json\n{ "component": "MemoryDiagram", "state": "fullstack-gc-basics" }\n\`\`\``,
    code: `## CODE\n\n### Level 1 — Beginner: Trigger a GC in Node\n\`\`\`js\nconst arr = []; for (let i=0;i<1e6;i++) arr.push({i});\nconsole.log(process.memoryUsage().heapUsed/1e6, 'MB');\narr.length=0; if (global.gc) global.gc();\nconsole.log('after gc:', process.memoryUsage().heapUsed/1e6, 'MB');\n// Run with: node --expose-gc script.js\n\`\`\`\n\n### Level 2 — Intermediate: Detect a Leak\n\`\`\`js\nconst leaked = [];\nsetInterval(() => {\n  for (let i=0;i<10000;i++) leaked.push({ data: new Array(100).fill(i) });\n  console.log('heap:', (process.memoryUsage().heapUsed/1e6).toFixed(1), 'MB');\n}, 100);\n// Watch heap grow without bound\n\`\`\`\n\n### Level 3 — Advanced: Heap Snapshot for Diagnosis\n\`\`\`js\nconst v8 = require('v8');\nconst path = require('path');\nfunction snapshot(label) {\n  const file = path.join(__dirname, \`heap-\${label}-\${Date.now()}.heapsnapshot\`);\n  v8.writeHeapSnapshot(file);\n  console.log('wrote', file);\n}\nsnapshot('baseline');\nfor (let i=0;i<1000;i++) doWork();\nsnapshot('after-work');\n// Diff in Chrome DevTools → Memory tab\n\`\`\`\n\n### Level 4 — Production: GC Monitoring with perf_hooks\n\`\`\`js\nconst { PerformanceObserver } = require('perf_hooks');\nconst obs = new PerformanceObserver((items) => {\n  for (const e of items.getEntries()) {\n    if (e.entryType === 'gc') {\n      const kind = ['', 'scavenge', 'minor', 'incremental', 'weakcb'][e.detail?.kind ?? 0] || 'major';\n      console.log(\`GC \${kind}: \${e.duration.toFixed(1)}ms\`);\n      if (e.duration > 100) console.warn('LONG GC PAUSE — investigate');\n    }\n  }\n});\nobs.observe({ entryTypes: ['gc'] });\n// Now app emits GC pause metrics; alert on long pauses\n\`\`\``,
    realworld: `## REAL_WORLD\n\n### How Node.js / V8 Uses GC\nV8 uses a generational GC: young generation (Scavenger, runs often, fast) + old generation (Mark-Sweep-Compact, runs rarely, can pause). Most allocations die young so the cheap scavenger handles them. Long-lived objects promote to old gen, swept incrementally to avoid stop-the-world pauses.\n\n### Production Gotcha: Closure Leak\n\`\`\`js\n// ❌ Each handler closes over huge \`data\` — never GC'd\napp.get('/hit', (req, res) => {\n  const data = new Array(1e6).fill('x');\n  setInterval(() => console.log('alive'), 1000); // closure retains data\n  res.send('ok');\n});\n// ✅ Don't capture large objects in long-lived closures\n\`\`\`\n\n### Performance Characteristics\n| GC Type | Pause | Frequency |\n|---|---|---|\n| Scavenge (young) | <1ms | Frequent |\n| Mark-Sweep (old) | 10-100ms | Occasional |\n| Mark-Compact | 50-500ms | Rare |`,
    interview: `## INTERVIEW\n\n**Q1 (J): What is garbage collection?** A: Automatic memory reclamation — the runtime tracks reachable objects and frees memory used by unreachable ones, so the developer doesn't manually free.\n\n**Q2 (J): Why can a Node app run out of memory?** A: References pin objects: closures over large data, global maps, event listeners not removed, caches without eviction.\n\n**Q3 (M): Generational GC?** A: Most objects die young → use a fast cheap collector (scavenger) for young gen, slower thorough collector for old gen. Reduces total GC cost dramatically.\n\n**Q4 (M): How do you detect a leak in production?** A: Monitor heap size over time, take heap snapshots at intervals, diff in DevTools to find growing retainers.\n\n**Q5 (S): Stop-the-world vs incremental GC?** A: STW pauses all execution; incremental interleaves with work to keep pauses short. V8 uses incremental + concurrent marking to keep pauses under 10ms.\n\n**Q6 (S): When does GC become your bottleneck?** A: High-allocation hot paths (parsing, JSON), large heaps (>4GB), short-lived spikes. Object pools or pre-allocated buffers fix.`,
    feynman: `## FEYNMAN CHECK\n\n### Explain GC Like I'm 10\n> GC is the runtime's vacuum cleaner. It walks the live objects starting from roots (globals, stack) and any object it CAN'T reach gets swept. Newer objects die quickly so the runtime collects them with a fast cheap pass; survivors are promoted to a slower pass. The non-obvious part: closures and event listeners ROOT objects you forgot about — most "memory leaks" are forgotten references, not real bugs.\n\n---\n\n### 5 Deep Questions\n**Q1: How does GC decide what to collect?** > A: Reachability from roots. Anything not transitively reachable is garbage.\n**Q2: ONE model.** > A: "Roots → trace reachable → sweep unreachable. Young gen = cheap, old gen = expensive."\n**Q3: Misconception+code.** > A: \`\`\`js\n// ❌ Cache never evicts\nconst cache = new Map();\nfunction get(k) { if(!cache.has(k)) cache.set(k, load(k)); return cache.get(k); }\n// ✅ WeakMap or LRU\nconst cache = new LRU({ max: 1000 });\n\`\`\`\n**Q4: With event loop?** > A: GC pauses the JS thread; long pauses spike p99 latency.\n**Q5: Senior one-liner.** > A: "GC is automatic reachability-based memory reclamation whose pauses become app latency — closures and global maps are the #1 production leak source."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Detect a Memory Leak\n**Time:** 25 min\n\n#### Step 2 — Leaky Server\n\`\`\`js\nconst express = require('express');\nconst app = express();\nconst leaked = [];\napp.get('/work', (req, res) => { leaked.push(new Array(10000).fill(0)); res.json({ heap: process.memoryUsage().heapUsed }); });\napp.listen(3000);\n\`\`\`\n\n#### Step 3 — Detect with autocannon + heap snapshot\n\`\`\`bash\nautocannon -c 10 -d 30 http://localhost:3000/work\n# Watch heap grow indefinitely; take snapshot before/after; diff in DevTools\n\`\`\`\n\n#### Step 5 — Fix\n\`\`\`js\n// Remove the leaked array; or cap with LRU\n\`\`\`\n\n**Expected Output:** Heap stable after fix, growing before.`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** What is reachability in GC?\n**Q2:** Young vs old gen — why split?\n**Q3:** Write a heap snapshot in 5 lines.\n\n### Day 3\n**Q4:** Closure leak — show and fix.\n**Q5:** Cache-without-eviction bug.\n**Q6:** STW vs incremental.\n\n### Day 7\n**Q7:** Use perf_hooks to alert on GC > 100ms.\n**Q8:** PR adds unbounded cache. Memory impact at 1M users?\n**Q9:** Object pooling — when worth it?\n\n### Day 14\n**Q10:** ★ "Diagnose a Node OOM in production."\n**Q11:** Link GC → event loop → p99 latency.\n**Q12:** ★ "Heap grows 100MB/hour. Investigation steps."`
  },

  'java-class-loading-subsystem': {
    visual: `## VISUALIZATION_CONFIG\n\n\`\`\`json\n{ "component": "FlowChart", "state": "fullstack-java-classloading" }\n\`\`\``,
    code: `## CODE\n\n### Level 1 — Beginner: Print Class Loader\n\`\`\`java\npublic class Demo {\n  public static void main(String[] args) {\n    System.out.println(Demo.class.getClassLoader());          // AppClassLoader\n    System.out.println(String.class.getClassLoader());        // null (bootstrap)\n  }\n}\n\`\`\`\n\n### Level 2 — Intermediate: Load Class Dynamically\n\`\`\`java\nClass<?> c = Class.forName("java.util.ArrayList");\nObject obj = c.getDeclaredConstructor().newInstance();\nSystem.out.println(obj.getClass().getName());\n\`\`\`\n\n### Level 3 — Advanced: Custom ClassLoader\n\`\`\`java\npublic class MyLoader extends ClassLoader {\n  @Override protected Class<?> findClass(String name) throws ClassNotFoundException {\n    byte[] b = readClassFromDisk(name);\n    return defineClass(name, b, 0, b.length);\n  }\n  private byte[] readClassFromDisk(String name) { /* read .class file */ return new byte[0]; }\n}\n\`\`\`\n\n### Level 4 — Production: Plugin Isolation\n\`\`\`java\n// Each plugin gets its own URLClassLoader so plugin v1 and v2 can coexist\nURL[] urls = { new File("plugin-v1.jar").toURI().toURL() };\nURLClassLoader plugin1 = new URLClassLoader(urls, getClass().getClassLoader());\nClass<?> entry = plugin1.loadClass("com.example.Plugin");\nObject inst = entry.getDeclaredConstructor().newInstance();\n// Different loader for v2 — isolated\n\`\`\``,
    realworld: `## REAL_WORLD\n\n### How Tomcat / Spring Use Class Loaders\nTomcat creates a separate WebappClassLoader per deployed WAR so two apps using different library versions can coexist. Spring Boot uses a LaunchedURLClassLoader to load nested JAR contents from a fat-jar layout.\n\n### Production Gotcha: ClassCastException Across Loaders\n\`\`\`java\n// ❌ Same class name loaded by different loaders → not assignable\nObject a = pluginLoader.loadClass("Foo").newInstance();\nFoo b = (Foo) a; // ClassCastException — even though name matches\n// ✅ Use a shared parent loader for interfaces; isolate impl\n\`\`\`\n\n### Performance Characteristics\n| Phase | Cost | When |\n|---|---|---|\n| Bootstrap load | Once | JVM start |\n| App class load | Once per class | First use |\n| Custom loader | Variable | Per plugin |`,
    interview: `## INTERVIEW\n\n**Q1 (J): What is a class loader?** A: JVM component that loads .class bytecode into memory and produces a Class<?> object. Three default loaders: bootstrap (core JDK), platform (extensions), system/app (your classpath).\n\n**Q2 (J): Parent-delegation model?** A: Loader asks parent first to load a class — prevents user code from replacing JDK classes (e.g., your String class can't override java.lang.String).\n\n**Q3 (M): When use a custom class loader?** A: Plugin systems (isolate plugin classpaths), hot reload (load new bytecode without restart), bytecode rewriting (load instrumented classes).\n\n**Q4 (M): Static init order?** A: Loaded → linked (verify+prepare+resolve) → initialised (run static blocks). Initialisation is lazy — first active use triggers it.\n\n**Q5 (S): ClassCastException across loaders?** A: Two loaders load same class name → JVM treats them as different types. Common in plugin systems; fix with shared parent loader for interfaces.\n\n**Q6 (S): How does Spring Boot fat-jar load nested classes?** A: LaunchedURLClassLoader knows how to read .jar inside .jar without unzipping, using a custom URLStreamHandler.`,
    feynman: `## FEYNMAN CHECK\n\n### Explain Java Class Loading Like I'm 10\n> The JVM doesn't load all your code at startup — it loads classes lazily on first use. A chain of class loaders (bootstrap → platform → app → custom) decide WHO can load WHICH classes. The non-obvious part: same class loaded by two different loaders = two different types in the JVM. This is why plugin systems must share interfaces from a parent loader.\n\n---\n\n### 5 Deep Questions\n**Q1: Why parent-delegation?** > A: Security and consistency — user code can't replace core JDK classes.\n**Q2: ONE model.** > A: "Lazy load on first use → delegate up the chain → only the leaf loader handles what parents can't."\n**Q3: Misconception+code.** > A: \`\`\`java\n// ❌ Reload by re-running new ClassLoader without dropping old refs — leaks Class objects\n// ✅ Drop all refs to old loader so GC can reclaim Class metadata\n\`\`\`\n**Q4: With JVM memory?** > A: Class metadata lives in Metaspace; class loader leaks bloat Metaspace until OOM.\n**Q5: Senior one-liner.** > A: "Class loaders implement a lazy delegation hierarchy whose identity is part of class equality — same bytecode under two loaders is two distinct types, which is the foundation of plugin isolation and the source of subtle ClassCastException bugs."`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Plugin Loader\n**Time:** 30 min\n\n#### Step 2 — Plugin API (shared)\n\`\`\`java\npublic interface Plugin { String name(); }\n\`\`\`\n\n#### Step 3 — Load Multiple Versions\n\`\`\`java\nURLClassLoader v1 = new URLClassLoader(new URL[]{new File("p1.jar").toURI().toURL()}, Plugin.class.getClassLoader());\nPlugin p1 = (Plugin) v1.loadClass("com.acme.PluginImpl").getDeclaredConstructor().newInstance();\nSystem.out.println(p1.name());\nv1.close();\n\`\`\`\n\n#### Step 5 — Verify Isolation\nLoad two .jars with same class name → both work, both isolated.\n\n**Expected Output:** Two plugin versions coexist in one JVM.`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1\n**Q1:** Name 3 default class loaders.\n**Q2:** Parent-delegation — what does it prevent?\n**Q3:** Print Demo.class's loader.\n\n### Day 3\n**Q4:** Bootstrap returns null — why?\n**Q5:** Show CCE-across-loaders bug.\n**Q6:** Metaspace vs PermGen.\n\n### Day 7\n**Q7:** Build a plugin loader supporting hot-swap.\n**Q8:** PR holds references to old class loaders. Memory impact?\n**Q9:** Static init order — describe.\n\n### Day 14\n**Q10:** ★ "Design plugin system with isolated classpaths."\n**Q11:** Link class-loading → JVM memory → Metaspace.\n**Q12:** ★ "Class loader leak causes OOM after deploys. Diagnose."`
  }

};





