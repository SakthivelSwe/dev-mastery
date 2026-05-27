"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Mermaid is loaded dynamically to prevent SSR issues
const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#0d1117] text-[#8b949e]">
      Loading Diagram...
    </div>
  )
});

interface Architecture {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  mermaidDiagram: string;
}

export default function SystemDesignViewer({ architecture }: { architecture: Architecture }) {
  const [activeTab, setActiveTab] = useState<'diagram' | 'details'>('diagram');

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-[#161b22] border border-[#30363D] rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-3xl font-bold text-white">{architecture.title}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                architecture.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                architecture.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {architecture.difficulty}
              </span>
            </div>
            <p className="text-[#8b949e] text-lg max-w-3xl">{architecture.description}</p>
          </div>
          
          <div className="flex bg-[#0d1117] border border-[#30363D] rounded-md overflow-hidden">
            <button 
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'diagram' ? 'bg-[#238636] text-white' : 'text-[#8b949e] hover:bg-[#1f2428] hover:text-white'}`}
              onClick={() => setActiveTab('diagram')}
            >
              Diagram
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'details' ? 'bg-[#238636] text-white' : 'text-[#8b949e] hover:bg-[#1f2428] hover:text-white'}`}
              onClick={() => setActiveTab('details')}
            >
              Deep Dive
            </button>
          </div>
        </div>
        
        {activeTab === 'diagram' && (
          <div className="w-full bg-[#0d1117] rounded-lg border border-[#30363D] mt-6 overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-[#1f2428] border-b border-[#30363D] flex justify-between items-center text-xs font-mono text-[#8b949e]">
              <span>MERMAID ARCHITECTURE</span>
            </div>
            <div className="flex-1 p-4 min-h-[500px]">
              <MermaidDiagram chart={architecture.mermaidDiagram} />
            </div>
          </div>
        )}
        
        {activeTab === 'details' && (
          <div className="w-full bg-[#0d1117] rounded-lg border border-[#30363D] mt-6 p-6 overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-4">Architecture Deep Dive</h3>
            <p className="text-[#8b949e] mb-4">
              Here you can add a detailed breakdown of the {architecture.title} architecture, explaining components like the API Gateway, Cache clusters, Database Sharding, and Event Queues.
            </p>
            <p className="text-[#8b949e]">
              In a full production implementation, this tab would load rich markdown content specific to the architecture from the backend.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
