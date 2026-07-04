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


  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={22} style={{ color: 'var(--accent)' }} />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Loading patterns…</span>
        </div>
      </div>
    );
  }

  const difficultyStyle = (lvl?: string): React.CSSProperties => {
    const v = (lvl ?? '').toLowerCase();
    if (v.startsWith('easy')) return { color: 'var(--success)', background: 'color-mix(in oklab, var(--success) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--success) 25%, transparent)' };
    if (v.startsWith('hard')) return { color: 'var(--error)', background: 'color-mix(in oklab, var(--error) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--error) 25%, transparent)' };
    return { color: 'var(--warning)', background: 'color-mix(in oklab, var(--warning) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--warning) 25%, transparent)' };
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ── Patterns list (left rail) ─────────────────────────── */}
      <aside
        className="w-72 flex flex-col overflow-hidden shrink-0 border-r"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      >
        <div className="p-4 border-b shrink-0" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-0.5">
            <Cpu size={15} strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
            <h1 className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
              LeetCode Patterns
            </h1>
          </div>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {patterns.length} patterns
          </p>

          <div className="relative mt-3">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter…"
              className="w-full pl-8 pr-3 py-1.5 rounded-md text-[13px] outline-none"
              style={{
                background: 'var(--bg-inset)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1.5">
          {filtered.length === 0 && (
            <div className="text-center text-[12px] py-8 px-4" style={{ color: 'var(--text-muted)' }}>
              No patterns match &quot;{search}&quot;
            </div>
          )}
          {filtered.map((p, idx) => {
            const isActive = activeSlug === p.slug;
            return (
              <button
                key={p.id ?? p.slug}
                onClick={() => setActiveSlug(p.slug)}
                className="w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors group"
                style={{
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  paddingLeft: isActive ? '14px' : '16px',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span
                  className="shrink-0 mt-0.5 w-7 h-7 rounded-md flex items-center justify-center text-[10px] tabular-nums"
                  style={{
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-code)',
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-medium truncate"
                    style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {p.name}
                  </div>
                  {p.difficultyLevel && (
                    <span
                      className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded"
                      style={difficultyStyle(p.difficultyLevel)}
                    >
                      {p.difficultyLevel}
                    </span>
                  )}
                </div>
                {isActive && <ChevronRight size={13} style={{ color: 'var(--accent)' }} className="shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main pattern detail ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
        {activePattern ? (
          <div className="max-w-5xl mx-auto px-6 py-8">
            <PatternVisualizer pattern={activePattern} />
          </div>
        ) : (
          <div
            className="h-full flex items-center justify-center text-[13px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Select a pattern from the list.
          </div>
        )}
      </div>
    </div>
  );
}
