'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import type { TopicSummary } from '@/lib/api';
import { searchTopics } from '@/lib/api';

export function CommandPalette() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef  = useRef<HTMLInputElement>(null);
  const router    = useRouter();

  // ── Open on ⌘K / Ctrl+K ──────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      const data = await searchTopics(query);
      setResults(data.slice(0, 8));
      setSelected(0);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const navigate = useCallback((topic: TopicSummary) => {
    router.push(`/learn/${topic.slug}`);
    setOpen(false);
  }, [router]);

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selected]) {
      navigate(results[selected]);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 mx-4">
        <div className="bg-[--bg-surface] border border-[--border-default] rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[--border-default]">
            <Search size={18} className="text-[--text-muted] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search topics… (e.g. 'HashMap internals', 'SQL joins')"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-[--text-primary] placeholder:text-[--text-muted] outline-none text-sm"
            />
            {loading
              ? <Loader2 size={16} className="animate-spin text-[--text-muted] shrink-0" />
              : query && <button onClick={() => setQuery('')}><X size={16} className="text-[--text-muted] hover:text-[--text-primary]" /></button>
            }
            <kbd className="text-[10px] text-[--text-muted] bg-[--bg-elevated] border border-[--border-default] px-1.5 py-0.5 rounded ml-1 shrink-0">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {results.length > 0 ? (
              <ul className="py-2">
                {results.map((topic, i) => (
                  <li key={topic.id}>
                    <button
                      onClick={() => navigate(topic)}
                      onMouseEnter={() => setSelected(i)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors ${
                        i === selected
                          ? 'bg-[--bg-elevated] text-[--text-primary]'
                          : 'text-[--text-secondary] hover:bg-[--bg-elevated]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[--text-muted] text-xs font-medium shrink-0">L{topic.level}</span>
                        <span className="truncate">{topic.title}</span>
                      </div>
                      {i === selected && <ArrowRight size={14} className="text-[--text-muted] shrink-0" />}
                    </button>
                  </li>
                ))}
              </ul>
            ) : query && !loading ? (
              <div className="py-10 text-center text-[--text-muted] text-sm">
                No topics found for &ldquo;{query}&rdquo;
              </div>
            ) : !query ? (
              <div className="py-8 text-center text-[--text-muted] text-xs">
                Start typing to search all 648 topics across 18 roadmaps
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[--border-muted] flex items-center gap-4 text-[--text-muted] text-[11px]">
            <span><kbd className="bg-[--bg-elevated] border border-[--border-default] px-1 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="bg-[--bg-elevated] border border-[--border-default] px-1 rounded">↵</kbd> open</span>
            <span><kbd className="bg-[--bg-elevated] border border-[--border-default] px-1 rounded">ESC</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}
