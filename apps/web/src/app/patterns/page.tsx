"use client";

import React, { useEffect, useState } from 'react';
import PatternVisualizer from '@/components/patterns/PatternVisualizer';

const CONTENT_API = process.env.NEXT_PUBLIC_CONTENT_API_URL || 'http://localhost:8082';

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePatternSlug, setActivePatternSlug] = useState<string | null>(null);
  const [activePattern, setActivePattern] = useState<any>(null);

  useEffect(() => {
    async function loadPatterns() {
      try {
        const res = await fetch(`${CONTENT_API}/v1/patterns`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setPatterns(data);
        if (data.length > 0) setActivePatternSlug(data[0].slug);
      } catch (e) {
        console.error("Failed to load patterns", e);
      } finally {
        setLoading(false);
      }
    }
    loadPatterns();
  }, []);

  useEffect(() => {
    if (!activePatternSlug) return;
    async function loadPatternDetails() {
      try {
        const res = await fetch(`${CONTENT_API}/v1/patterns/${activePatternSlug}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setActivePattern(data);
      } catch (e) {
        console.error("Failed to load pattern details", e);
      }
    }
    loadPatternDetails();
  }, [activePatternSlug]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0d1117]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58a6ff]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0d1117] text-white flex">
      {/* Sidebar for patterns list */}
      <div className="w-80 border-r border-[#30363D] h-[calc(100vh-64px)] overflow-y-auto bg-[#161b22]">
        <div className="p-6 border-b border-[#30363D]">
          <h1 className="text-xl font-bold">LeetCode Patterns</h1>
          <p className="text-sm text-[#8b949e] mt-1">Master the 20 essential patterns.</p>
        </div>
        <div className="flex flex-col">
          {patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePatternSlug(p.slug)}
              className={`text-left px-6 py-4 border-b border-[#30363D] transition-colors ${
                activePatternSlug === p.slug 
                  ? 'bg-[#1f2428] border-l-4 border-l-[#58a6ff]' 
                  : 'hover:bg-[#1f2428] border-l-4 border-l-transparent'
              }`}
            >
              <div className="font-medium text-white">{p.name}</div>
              <div className={`text-xs mt-1 font-bold ${
                p.difficultyLevel === 'Easy' ? 'text-green-400' :
                p.difficultyLevel === 'Medium' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {p.difficultyLevel}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 h-[calc(100vh-64px)] overflow-y-auto">
        {activePattern ? (
          <PatternVisualizer pattern={activePattern} />
        ) : (
          <div className="flex items-center justify-center h-full text-[#8b949e]">
            Select a pattern from the sidebar to start learning.
          </div>
        )}
      </div>
    </div>
  );
}
