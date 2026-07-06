'use client';

import { useState, useCallback } from 'react';

// ─── Capacity Estimator ────────────────────────────────────────────────────

interface Inputs {
  dau: number;          // daily active users (millions)
  reqPerUserDay: number;// requests per user per day
  avgPayloadKB: number; // average payload KB
  readWriteRatio: number; // reads per write
  replicationFactor: number;
  cachingPercent: number; // % of reads served from cache (0-100)
  dataRetentionYears: number;
}

interface Estimates {
  rps: number;
  peakRps: number;
  bandwidthMbps: number;
  storagePerYearGB: number;
  totalStorageTB: number;
  cacheHitRps: number;
  dbRps: number;
  readRps: number;
  writeRps: number;
}

function calc(i: Inputs): Estimates {
  const rps = (i.dau * 1_000_000 * i.reqPerUserDay) / 86_400;
  const peakRps = rps * 3; // 3× average = rough peak
  const bandwidthMbps = (peakRps * i.avgPayloadKB * 8) / 1_000;
  const writeRps = rps / (1 + i.readWriteRatio);
  const readRps  = rps - writeRps;
  const cacheHitRps = readRps * (i.cachingPercent / 100);
  const dbRps = rps - cacheHitRps;
  const dailyWriteGB = (writeRps * 86_400 * i.avgPayloadKB * i.replicationFactor) / 1_000_000;
  const storagePerYearGB = dailyWriteGB * 365;
  const totalStorageTB   = (storagePerYearGB * i.dataRetentionYears) / 1_024;
  return { rps, peakRps, bandwidthMbps, storagePerYearGB, totalStorageTB,
           cacheHitRps, dbRps, readRps, writeRps };
}

function fmt(n: number, decimals = 0) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(decimals);
}

// ─── Requirements Workshop scenarios ──────────────────────────────────────

const SCENARIOS = [
  {
    name: 'URL Shortener (bit.ly)',
    preset: { dau: 100, reqPerUserDay: 10, avgPayloadKB: 0.5, readWriteRatio: 100,
              replicationFactor: 3, cachingPercent: 99, dataRetentionYears: 5 },
    requirements: [
      'Shorten URLs to 7-character base62 codes',
      'Redirect p99 < 100ms globally',
      '100:1 read-to-write ratio',
      'Custom aliases and expiration dates',
      'Click analytics (unique + total per link)',
      '99.99% availability (< 52 min/year downtime)',
    ],
    bottleneck: 'Read path — serve redirects from CDN/Redis, never Postgres',
  },
  {
    name: 'Chat (WhatsApp)',
    preset: { dau: 500, reqPerUserDay: 200, avgPayloadKB: 2, readWriteRatio: 1,
              replicationFactor: 3, cachingPercent: 30, dataRetentionYears: 3 },
    requirements: [
      'Send/receive messages with at-least-once delivery',
      'Message delivery within 500ms for online users',
      'Offline message queue per user',
      'End-to-end encryption (Signal Protocol)',
      'Presence (online/offline/last seen)',
      '2B+ users, 65B messages/day',
    ],
    bottleneck: 'Fan-out write amplification — shard by chat ID, use async delivery',
  },
  {
    name: 'News Feed (Twitter/X)',
    preset: { dau: 200, reqPerUserDay: 50, avgPayloadKB: 4, readWriteRatio: 1000,
              replicationFactor: 3, cachingPercent: 95, dataRetentionYears: 7 },
    requirements: [
      'Feed loads in < 2s, paginated with cursor',
      'New tweets visible within 5s to followers',
      'Support celebrities with 100M+ followers (fan-out problem)',
      'Trending topics updated every 30s',
      'Search over past 7 days of tweets',
      '500M tweets/day',
    ],
    bottleneck: 'Celebrity fan-out — hybrid push (< 10K followers) / pull (> 10K) model',
  },
  {
    name: 'Ride-Sharing (Uber)',
    preset: { dau: 50, reqPerUserDay: 300, avgPayloadKB: 1, readWriteRatio: 5,
              replicationFactor: 3, cachingPercent: 60, dataRetentionYears: 10 },
    requirements: [
      'Match rider to nearest driver in < 1s',
      'Real-time location updates every 4s per driver',
      'Surge pricing updated every 60s per geo-cell',
      'Trip history query with geospatial filters',
      'Payment processing with exactly-once semantics',
      '14M trips/day, 5M active drivers',
    ],
    bottleneck: 'Real-time geo-index — use S2 cells or H3 for driver location lookup',
  },
];

// ─── Component ────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: Inputs = {
  dau: 10, reqPerUserDay: 20, avgPayloadKB: 5, readWriteRatio: 10,
  replicationFactor: 3, cachingPercent: 80, dataRetentionYears: 3,
};

export default function SystemDesignStudioPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [activeScenario, setActiveScenario] = useState<number | null>(null);

  const estimates = calc(inputs);

  const applyScenario = useCallback((idx: number) => {
    setActiveScenario(idx);
    setInputs(SCENARIOS[idx].preset as Inputs);
  }, []);

  const set = (field: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }));

  const scenario = activeScenario !== null ? SCENARIOS[activeScenario] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🏗️ System Design Studio</h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Two tools in one: a <strong>Capacity Estimator</strong> to work through
          back-of-the-envelope math, and a <strong>Requirements Workshop</strong>
          with 4 real system-design interview case studies.
          Use these before sketching your architecture diagram.
        </p>
      </div>

      {/* Scenario selector */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Case Studies</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => applyScenario(i)}
              className={`rounded-xl border p-3 text-left text-sm font-medium transition-all
                ${activeScenario === i
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-accent/40'}`}
            >
              {s.name}
            </button>
          ))}
          <button
            onClick={() => { setActiveScenario(null); setInputs(DEFAULT_INPUTS); }}
            className="rounded-xl border border-dashed p-3 text-left text-sm text-muted-foreground
              hover:border-primary/50 transition-all"
          >
            Custom ✏️
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Capacity Estimator inputs ── */}
        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">📊 Capacity Estimator</h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {([
              ['dau',               'Daily Active Users (M)', 0.1, 5000, 1],
              ['reqPerUserDay',     'Requests / User / Day',  1,   1000, 1],
              ['avgPayloadKB',      'Avg Payload (KB)',        0.1, 1000, 0.1],
              ['readWriteRatio',    'Read : Write Ratio',      1,   10000,1],
              ['replicationFactor','Replication Factor',       1,   5,    1],
              ['cachingPercent',    'Cache Hit % (reads)',     0,   100,  1],
              ['dataRetentionYears','Data Retention (years)',  1,   20,   1],
            ] as [keyof Inputs, string, number, number, number][]).map(([k, label, min, max, step]) => (
              <div key={k} className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {label}
                </label>
                <input
                  type="number" min={min} max={max} step={step}
                  value={inputs[k]}
                  onChange={set(k)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Estimates output ── */}
        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">⚡ Estimates</h2>

          <div className="space-y-2 text-sm">
            {([
              ['Average RPS',           estimates.rps,            'req/s', ''],
              ['Peak RPS (3×)',          estimates.peakRps,        'req/s', 'Peak = avg × 3 (rule of thumb)'],
              ['Read RPS',              estimates.readRps,         'req/s', ''],
              ['Write RPS',             estimates.writeRps,        'req/s', ''],
              ['Cache-served RPS',      estimates.cacheHitRps,    'req/s', `${inputs.cachingPercent}% of reads from cache`],
              ['DB RPS (after cache)',  estimates.dbRps,          'req/s', 'What your DB actually sees'],
              ['Peak Bandwidth',        estimates.bandwidthMbps,  'Mbps',  ''],
              ['Storage / Year',        estimates.storagePerYearGB,'GB/yr','Write-path only'],
              ['Total Storage',         estimates.totalStorageTB, 'TB',   `Over ${inputs.dataRetentionYears} years × ${inputs.replicationFactor} replicas`],
            ] as [string, number, string, string][]).map(([label, val, unit, note]) => (
              <div key={label} className="flex items-center justify-between gap-2
                border-b border-border/50 pb-1.5 last:border-0">
                <div>
                  <span className="font-medium">{label}</span>
                  {note && <span className="ml-2 text-xs text-muted-foreground">({note})</span>}
                </div>
                <span className="font-mono font-semibold text-primary tabular-nums">
                  {fmt(val, 1)} <span className="text-xs text-muted-foreground font-normal">{unit}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Quick assessment */}
          <div className={`rounded-xl p-3 text-sm mt-2
            ${estimates.dbRps > 50_000
              ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
              : estimates.dbRps > 10_000
              ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 dark:text-yellow-400'
              : 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400'
            }`}>
            <strong>DB load: </strong>
            {estimates.dbRps > 50_000
              ? `⚠️ ${fmt(estimates.dbRps)} DB req/s — you need read replicas + sharding`
              : estimates.dbRps > 10_000
              ? `⚡ ${fmt(estimates.dbRps)} DB req/s — add read replicas + connection pooling`
              : `✅ ${fmt(estimates.dbRps)} DB req/s — a single Postgres instance handles this`}
          </div>
        </section>
      </div>

      {/* Requirements Workshop */}
      {scenario && (
        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            📋 Requirements Workshop — {scenario.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Functional Requirements
              </h3>
              <ul className="space-y-1.5">
                {scenario.requirements.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Key Bottleneck
                </h3>
                <div className="rounded-xl bg-orange-500/10 border border-orange-500/30
                  text-orange-700 dark:text-orange-400 p-3 text-sm">
                  {scenario.bottleneck}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Interview Framework
                </h3>
                <ol className="space-y-1.5 text-sm list-decimal list-inside text-muted-foreground">
                  <li>Clarify scope (scale, consistency, availability)</li>
                  <li>Back-of-envelope estimates (use the tool above)</li>
                  <li>High-level design (boxes + arrows)</li>
                  <li>Deep-dive the bottleneck component</li>
                  <li>Address failure modes and edge cases</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tips */}
      <section className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">💡 Interview tips</p>
        <p>• State your assumptions out loud before computing — interviewers reward clarity.</p>
        <p>• Use round numbers: 1M DAU × 100 req/day ÷ 100K sec/day = 1K req/s.</p>
        <p>• The rule of 10: disk is 10× slower than RAM, network is 10× slower than disk.</p>
        <p>• Always identify the <em>read vs write ratio</em> first — it drives the whole architecture.</p>
      </section>
    </div>
  );
}

