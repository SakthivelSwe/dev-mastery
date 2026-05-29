"use client";

import React, { useEffect, useState } from 'react';
import SystemDesignViewer from '@/components/system-design/SystemDesignViewer';
// Uses direct fetch since system-design uses a different path than standard content API

export default function SystemDesignPage() {
  const [architectures, setArchitectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeArchitecture, setActiveArchitecture] = useState<any>(null);

  useEffect(() => {
    async function loadArchitectures() {
      try {
        const res = await fetch('http://localhost:8082/v1/system-design');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setArchitectures(data);
        if (data.length > 0) setActiveSlug(data[0].slug);
      } catch (e) {
        console.error("Failed to load architectures", e);
      } finally {
        setLoading(false);
      }
    }
    loadArchitectures();
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    async function loadDetails() {
      try {
        const res = await fetch(`http://localhost:8082/v1/system-design/${activeSlug}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setActiveArchitecture(data);
      } catch (e) {
        console.error("Failed to load architecture details", e);
      }
    }
    loadDetails();
  }, [activeSlug]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0d1117]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58a6ff]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0d1117] text-white flex">
      {/* Sidebar for architectures list */}
      <div className="w-80 border-r border-[#30363D] h-[calc(100vh-64px)] overflow-y-auto bg-[#161b22]">
        <div className="p-6 border-b border-[#30363D]">
          <h1 className="text-xl font-bold">System Design</h1>
          <p className="text-sm text-[#8b949e] mt-1">Master large scale architectures.</p>
        </div>
        <div className="flex flex-col">
          {architectures.map((arch) => (
            <button
              key={arch.id}
              onClick={() => setActiveSlug(arch.slug)}
              className={`text-left px-6 py-4 border-b border-[#30363D] transition-colors ${
                activeSlug === arch.slug 
                  ? 'bg-[#1f2428] border-l-4 border-l-[#58a6ff]' 
                  : 'hover:bg-[#1f2428] border-l-4 border-l-transparent'
              }`}
            >
              <div className="font-medium text-white">{arch.title}</div>
              <div className={`text-xs mt-1 font-bold ${
                arch.difficulty === 'Medium' ? 'text-yellow-400' :
                arch.difficulty === 'Hard' ? 'text-red-400' :
                'text-green-400'
              }`}>
                {arch.difficulty}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 h-[calc(100vh-64px)] overflow-y-auto">
        {activeArchitecture ? (
          <SystemDesignViewer architecture={activeArchitecture} />
        ) : (
          <div className="flex items-center justify-center h-full text-[#8b949e]">
            Select an architecture from the sidebar to view.
          </div>
        )}
      </div>
    </div>
  );
}
