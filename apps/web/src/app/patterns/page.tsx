"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, Filter, CheckCircle2, Circle, ExternalLink, ChevronRight,
  Trophy, Zap, Code2, Target, RefreshCw, User, X, Loader2, Cpu,
  ChevronDown, SortAsc, BarChart3, Lock, Unlock
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ── Types ────────────────────────────────────────────────────────────────────
interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcodeUrl: string;
  starterCode?: string;
  sortOrder?: number;
}

interface Pattern {
  id: string;
  slug: string;
  name: string;
  description: string;
  difficultyLevel: string;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  problems: Problem[];
}

interface PatternSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  difficultyLevel: string;
  problemCount: number;
}

interface LeetCodeStatus {
  leetcodeUsername: string;
  totalSynced: number;
  totalXpFromLeetCode: number;
}

type DiffFilter = 'All' | 'Easy' | 'Medium' | 'Hard';
type SortMode = 'default' | 'difficulty' | 'title';

// ── Helpers ──────────────────────────────────────────────────────────────────
const diffColor = (d: string) => {
  switch (d?.toLowerCase()) {
    case 'easy':   return { text: '#2cbb5d', bg: 'rgba(44,187,93,0.12)',   border: 'rgba(44,187,93,0.25)' };
    case 'medium': return { text: '#ffa116', bg: 'rgba(255,161,22,0.12)',  border: 'rgba(255,161,22,0.25)' };
    case 'hard':   return { text: '#ef4743', bg: 'rgba(239,71,67,0.12)',   border: 'rgba(239,71,67,0.25)' };
    default:       return { text: 'var(--text-muted)', bg: 'transparent',   border: 'transparent' };
  }
};

const diffOrder = (d: string) => ({ easy: 0, medium: 1, hard: 2 }[d?.toLowerCase()] ?? 3);

// ── Mini radial progress ──────────────────────────────────────────────────────
function RadialProgress({ value, max, size = 36, color }: { value: number; max: number; size?: number; color: string }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const dash = pct * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={3} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.4s ease' }}
      />
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PatternsPage() {
  const [patterns, setPatterns]           = useState<PatternSummary[]>([]);
  const [loadingList, setLoadingList]     = useState(true);
  const [activeSlug, setActiveSlug]       = useState<string | null>(null);
  const [activePattern, setActivePattern] = useState<Pattern | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch]               = useState('');
  const [probSearch, setProbSearch]       = useState('');
  const [diffFilter, setDiffFilter]       = useState<DiffFilter>('All');
  const [sort, setSort]                   = useState<SortMode>('default');
  const [solvedIds, setSolvedIds]         = useState<Set<string>>(new Set());
  const [lcStatus, setLcStatus]           = useState<LeetCodeStatus | null>(null);
  const [lcUsername, setLcUsername]       = useState('');
  const [showLcPanel, setShowLcPanel]     = useState(false);
  const [syncing, setSyncing]             = useState(false);
  const [syncResult, setSyncResult]       = useState<string | null>(null);

  // Load pattern list
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/patterns`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setPatterns(data);
        if (data.length > 0) setActiveSlug(data[0].slug);
      } catch (e) {
        console.error('Failed to load patterns', e);
      } finally { setLoadingList(false); }
    })();
  }, []);

  // Load LeetCode status
  useEffect(() => {
    (async () => {
      try {
        const tok = localStorage.getItem('auth_token');
        if (!tok) return;
        const res = await fetch(`${API_BASE}/v1/leetcode/status`, {
          headers: { Authorization: `Bearer ${tok}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLcStatus(data);
          setLcUsername(data.leetcodeUsername || '');
        }
      } catch { /* not logged in, silently skip */ }
    })();
  }, []);

  // Load pattern detail
  useEffect(() => {
    if (!activeSlug) return;
    setLoadingDetail(true);
    setActivePattern(null);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/patterns/${activeSlug}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        setActivePattern(await res.json());
      } catch (e) {
        console.error('Failed to load pattern details', e);
      } finally { setLoadingDetail(false); }
    })();
  }, [activeSlug]);

  const filteredPatterns = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patterns;
    return patterns.filter(p =>
      p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
    );
  }, [patterns, search]);

  const filteredProblems = useMemo(() => {
    if (!activePattern) return [];
    let probs = [...activePattern.problems];
    if (diffFilter !== 'All') probs = probs.filter(p => p.difficulty === diffFilter);
    const q = probSearch.trim().toLowerCase();
    if (q) probs = probs.filter(p => p.title.toLowerCase().includes(q));
    if (sort === 'difficulty') probs.sort((a, b) => diffOrder(a.difficulty) - diffOrder(b.difficulty));
    if (sort === 'title') probs.sort((a, b) => a.title.localeCompare(b.title));
    return probs;
  }, [activePattern, diffFilter, probSearch, sort]);

  const toggleSolved = useCallback((id: string) => {
    setSolvedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleLcSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const tok = localStorage.getItem('auth_token');
      // First save username
      await fetch(`${API_BASE}/v1/leetcode/username`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ leetcodeUsername: lcUsername })
      });
      // Then sync
      const res = await fetch(`${API_BASE}/v1/leetcode/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSyncResult(`✅ Synced ${data.newlySynced} new solves · +${data.xpAwarded} XP`);
        setLcStatus(prev => prev ? { ...prev, totalSynced: prev.totalSynced + data.newlySynced, totalXpFromLeetCode: prev.totalXpFromLeetCode + data.xpAwarded } : prev);
      } else {
        setSyncResult('❌ Sync failed. Make sure your LeetCode profile is public.');
      }
    } catch {
      setSyncResult('❌ Network error during sync.');
    } finally { setSyncing(false); }
  };

  if (loadingList) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={22} style={{ color: 'var(--accent)' }} />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Loading patterns…</span>
        </div>
      </div>
    );
  }

  // ── per-pattern progress (local solved state) ────────────────────────────
  const getPatternProgress = (slug: string) => {
    const pattern = patterns.find(p => p.slug === slug);
    const total = pattern?.problemCount ?? 0;
    const solved = solvedIds.size; // simplified — real impl would track per-pattern
    return { solved: Math.min(solved, total), total };
  };

  return (
    <div className="flex h-full w-full overflow-hidden">

      {/* ── Left rail: Pattern list ─────────────────────────────────── */}
      <aside
        className="w-64 flex flex-col overflow-hidden shrink-0 border-r"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      >
        {/* Header */}
        <div className="p-3 border-b shrink-0" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Cpu size={13} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
              <h1 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Patterns
              </h1>
            </div>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full tabular-nums font-medium"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {patterns.length}
            </span>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patterns…"
              className="w-full pl-6 pr-2.5 py-1.5 rounded text-[11.5px] outline-none"
              style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredPatterns.map((p, idx) => {
            const isActive = activeSlug === p.slug;
            const dc = diffColor(p.difficultyLevel);
            return (
              <button
                key={p.id ?? p.slug}
                onClick={() => setActiveSlug(p.slug)}
                className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-all group"
                style={{
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span
                  className="shrink-0 w-5 h-5 flex items-center justify-center text-[9px] tabular-nums rounded font-bold"
                  style={{ background: isActive ? 'var(--accent)' : 'var(--bg-inset)', color: isActive ? '#111' : 'var(--text-muted)' }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[12px] font-medium truncate"
                    style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {p.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9.5px] px-1 py-0.5 rounded" style={{ color: dc.text, background: dc.bg }}>
                      {p.difficultyLevel}
                    </span>
                    <span className="text-[9px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {p.problemCount} problems
                    </span>
                  </div>
                </div>
                {isActive && <ChevronRight size={11} style={{ color: 'var(--accent)' }} className="shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* LeetCode Sync panel toggle */}
        <div className="shrink-0 border-t" style={{ borderColor: 'var(--border-default)' }}>
          <button
            onClick={() => setShowLcPanel(v => !v)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-[11.5px] font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Zap size={13} style={{ color: '#ffa116' }} />
            LeetCode Auto-Sync
            {lcStatus?.totalSynced ? (
              <span className="ml-auto text-[9.5px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,161,22,0.15)', color: '#ffa116' }}>
                {lcStatus.totalSynced} synced
              </span>
            ) : null}
            <ChevronDown size={11} className={`transition-transform ${showLcPanel ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* ── Main panel ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

        {/* LeetCode sync panel (slides open) */}
        {showLcPanel && (
          <div
            className="shrink-0 border-b px-5 py-3 flex items-center gap-3 flex-wrap"
            style={{ background: 'rgba(255,161,22,0.06)', borderColor: 'rgba(255,161,22,0.2)' }}
          >
            <Zap size={14} style={{ color: '#ffa116' }} />
            <span className="text-[12.5px] font-medium" style={{ color: 'var(--text-primary)' }}>
              LeetCode Auto-Sync
            </span>
            <span className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
              Enter your public LeetCode username to auto-award XP for solved problems.
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="text"
                placeholder="your-lc-username"
                value={lcUsername}
                onChange={e => setLcUsername(e.target.value)}
                className="px-2.5 py-1.5 rounded text-[12px] outline-none w-44"
                style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#ffa116'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              />
              <button
                onClick={handleLcSync}
                disabled={!lcUsername.trim() || syncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-all disabled:opacity-40"
                style={{ background: '#ffa116', color: '#111' }}
              >
                {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
              {lcStatus?.totalXpFromLeetCode ? (
                <div className="flex items-center gap-1 text-[11px]" style={{ color: '#ffa116' }}>
                  <Trophy size={11} />
                  {lcStatus.totalXpFromLeetCode} XP earned
                </div>
              ) : null}
              {syncResult && (
                <span className="text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>{syncResult}</span>
              )}
            </div>
          </div>
        )}

        {/* Pattern detail header */}
        {activePattern && (
          <div
            className="shrink-0 px-6 pt-5 pb-4 border-b"
            style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    {activePattern.name}
                  </h2>
                  {(() => {
                    const dc = diffColor(activePattern.difficultyLevel);
                    return (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ color: dc.text, background: dc.bg, border: `1px solid ${dc.border}` }}>
                        {activePattern.difficultyLevel}
                      </span>
                    );
                  })()}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {activePattern.description}
                </p>
              </div>
              {/* Stats */}
              <div className="shrink-0 flex items-center gap-3">
                {[
                  { label: 'Easy',   count: activePattern.easyCount,   dc: diffColor('Easy') },
                  { label: 'Medium', count: activePattern.mediumCount, dc: diffColor('Medium') },
                  { label: 'Hard',   count: activePattern.hardCount,   dc: diffColor('Hard') },
                ].map(({ label, count, dc }) => (
                  <div key={label} className="flex flex-col items-center px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                    <span className="text-[16px] font-bold tabular-nums" style={{ color: dc.text }}>{count}</span>
                    <span className="text-[9.5px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                  <span className="text-[16px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {activePattern.easyCount + activePattern.mediumCount + activePattern.hardCount}
                  </span>
                  <span className="text-[9.5px] font-medium" style={{ color: 'var(--text-muted)' }}>Total</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${activePattern.problems.length > 0 ? (solvedIds.size / activePattern.problems.length) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, var(--accent), #7c3aed)',
                  }}
                />
              </div>
              <span className="text-[11px] tabular-nums shrink-0" style={{ color: 'var(--text-muted)' }}>
                {solvedIds.size} / {activePattern.easyCount + activePattern.mediumCount + activePattern.hardCount} solved
              </span>
            </div>
          </div>
        )}

        {/* Toolbar: filters + search */}
        {activePattern && (
          <div
            className="shrink-0 flex items-center gap-2 px-5 py-2 border-b flex-wrap"
            style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
          >
            {/* Difficulty filter */}
            <div className="flex items-center gap-1 p-0.5 rounded-md" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-default)' }}>
              {(['All', 'Easy', 'Medium', 'Hard'] as DiffFilter[]).map(f => {
                const active = diffFilter === f;
                const dc = f !== 'All' ? diffColor(f) : null;
                return (
                  <button
                    key={f}
                    onClick={() => setDiffFilter(f)}
                    className="px-2.5 py-1 rounded text-[11.5px] font-medium transition-all"
                    style={{
                      background: active ? (dc ? dc.bg : 'var(--bg-elevated)') : 'transparent',
                      color: active ? (dc ? dc.text : 'var(--text-primary)') : 'var(--text-muted)',
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            {/* Problem search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text" value={probSearch} onChange={e => setProbSearch(e.target.value)}
                placeholder="Search problems…"
                className="w-full pl-6 pr-2.5 py-1.5 rounded text-[11.5px] outline-none"
                style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 ml-auto">
              <SortAsc size={12} style={{ color: 'var(--text-muted)' }} />
              <select
                value={sort} onChange={e => setSort(e.target.value as SortMode)}
                className="text-[11.5px] rounded px-2 py-1 outline-none"
                style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                <option value="default">Default</option>
                <option value="difficulty">Difficulty</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>

            <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {filteredProblems.length} problems
            </span>
          </div>
        )}

        {/* Problem table */}
        <div className="flex-1 overflow-y-auto">
          {loadingDetail && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin" size={20} style={{ color: 'var(--accent)' }} />
            </div>
          )}

          {!loadingDetail && activePattern && (
            <table className="w-full text-[13px] border-collapse">
              <thead className="sticky top-0 z-10" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
                <tr>
                  <th className="w-10 text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>#</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Problem</th>
                  <th className="w-24 text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Difficulty</th>
                  <th className="w-28 text-center px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="w-28 text-center px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>LeetCode</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((prob, i) => {
                  const solved = solvedIds.has(prob.id);
                  const dc = diffColor(prob.difficulty);
                  return (
                    <tr
                      key={prob.id}
                      className="group border-b transition-colors"
                      style={{
                        borderColor: 'var(--border-default)',
                        background: solved
                          ? 'rgba(44,187,93,0.04)'
                          : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
                      }}
                      onMouseEnter={e => { if (!solved) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = solved ? 'rgba(44,187,93,0.04)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)'; }}
                    >
                      <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {i + 1}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {solved ? (
                            <CheckCircle2 size={13} style={{ color: '#2cbb5d', flexShrink: 0 }} />
                          ) : (
                            <Circle size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          )}
                          <span
                            className="font-medium cursor-pointer hover:underline"
                            style={{ color: solved ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: solved ? 'line-through' : 'none' }}
                            onClick={() => toggleSolved(prob.id)}
                          >
                            {prob.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ color: dc.text, background: dc.bg, border: `1px solid ${dc.border}` }}
                        >
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => toggleSolved(prob.id)}
                          className="text-[11px] px-3 py-1 rounded-full font-medium transition-all"
                          style={solved ? {
                            background: 'rgba(44,187,93,0.15)',
                            color: '#2cbb5d',
                            border: '1px solid rgba(44,187,93,0.3)',
                          } : {
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          {solved ? '✓ Solved' : 'Mark Done'}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {prob.leetcodeUrl ? (
                          <a
                            href={prob.leetcodeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded transition-all"
                            style={{ color: '#ffa116', background: 'rgba(255,161,22,0.1)', border: '1px solid rgba(255,161,22,0.2)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,161,22,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,161,22,0.1)'; }}
                          >
                            <ExternalLink size={10} />
                            Open
                          </a>
                        ) : (
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loadingDetail && !activePattern && (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Target size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Select a pattern from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
