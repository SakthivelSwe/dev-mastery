"use client";

import React, { useEffect, useMemo, useState } from 'react';
import PatternVisualizer from '@/components/patterns/PatternVisualizer';
import { Loader2, Cpu, Search, ChevronRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Pattern {
  id: string;
  slug: string;
  name: string;
  description?: string;
  difficultyLevel?: string;
}

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activePattern, setActivePattern] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/patterns`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const data = (await res.json()) as Pattern[];
        setPatterns(data);
        if (data.length > 0) setActiveSlug(data[0].slug);
      } catch (e) {
        console.error('Failed to load patterns', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/patterns/${activeSlug}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        setActivePattern(await res.json());
      } catch (e) {
        console.error('Failed to load pattern details', e);
      }
    })();
  }, [activeSlug]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patterns;
    return patterns.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q),
    );
  }, [patterns, search]);

  const difficultyColor = (lvl?: string) => {
    const v = (lvl ?? '').toLowerCase();
    if (v.startsWith('easy')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (v.startsWith('hard')) return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[--text-muted]">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-sm">Loading patterns…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ── Patterns list (left rail) ─────────────────────────── */}
      <aside className="w-80 border-r border-[--border-default] bg-[--bg-surface] flex flex-col overflow-hidden shrink-0">
        <div className="p-5 border-b border-[--border-default] shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={18} className="text-indigo-400" />
            <h1 className="text-lg font-bold text-[--text-primary]">LeetCode Patterns</h1>
          </div>
          <p className="text-xs text-[--text-muted]">
            Master {patterns.length} essential coding patterns.
          </p>

          <div className="relative mt-3">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--text-muted]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter patterns…"
              className="w-full bg-[--bg-elevated] border border-[--border-default] rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-[--text-primary] placeholder:text-[--text-muted]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="text-center text-xs text-[--text-muted] py-8 px-4">
              No patterns match &quot;{search}&quot;
            </div>
          )}
          {filtered.map((p, idx) => {
            const isActive = activeSlug === p.slug;
            return (
              <button
                key={p.id ?? p.slug}
                onClick={() => setActiveSlug(p.slug)}
                className={`group w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-l-2 ${
                  isActive
                    ? 'bg-[--bg-elevated] border-l-indigo-500'
                    : 'border-l-transparent hover:bg-[--bg-elevated]/60'
                }`}
              >
                <span className="shrink-0 mt-0.5 w-7 h-7 rounded-md bg-[--bg-elevated] border border-[--border-default] flex items-center justify-center text-[11px] font-mono text-[--text-muted]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${isActive ? 'text-[--text-primary]' : 'text-[--text-secondary] group-hover:text-[--text-primary]'}`}>
                    {p.name}
                  </div>
                  {p.difficultyLevel && (
                    <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border ${difficultyColor(p.difficultyLevel)}`}>
                      {p.difficultyLevel}
                    </span>
                  )}
                </div>
                {isActive && <ChevronRight size={14} className="text-indigo-400 shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main pattern detail ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {activePattern ? (
          <div className="max-w-5xl mx-auto px-6 py-8">
            <PatternVisualizer pattern={activePattern} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[--text-muted] text-sm">
            Select a pattern from the left to start learning.
          </div>
        )}
      </div>
    </div>
  );
}
