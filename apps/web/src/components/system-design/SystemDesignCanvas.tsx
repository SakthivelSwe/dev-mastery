'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Zap } from 'lucide-react';
// Excalidraw relies heavily on window, so we must disable SSR
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0d1117] text-[#c9d1d9] rounded-lg border border-[#30363d]">
        <Loader2 className="animate-spin h-12 w-12 border-b-2 border-[#58a6ff] mb-4" />
        <p className="text-lg font-mono">Loading System Design Canvas...</p>
      </div>
    ),
  }
);

interface SystemDesignCanvasProps {
  topicSlug: string;
}

export default function SystemDesignCanvas({ topicSlug }: SystemDesignCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [elements, setElements] = useState<readonly any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Initialize with some starter elements if needed
  const initialData = {
    elements: [],
    appState: { viewBackgroundColor: '#0d1117', theme: 'dark' as const },
    scrollToContent: true,
  };

  const handleAiReview = async () => {
    if (!excalidrawAPI) return;
    setIsAnalyzing(true);
    setFeedback(null);
    
    try {
      // In a real production scenario, we'd export to SVG/PNG and send to Gemini Pro Vision,
      // or we send the JSON structure of the elements for text-based analysis.
      // For now, we simulate an AI analyzing the Excalidraw elements.
      
      const elts = excalidrawAPI.getSceneElements();
      
      if (elts.length === 0) {
        setFeedback("The canvas is empty. Draw your system architecture first!");
        setIsAnalyzing(false);
        return;
      }
      
      // Simulate API call to ai-bot-service
      await new Promise(r => setTimeout(r, 2000));
      
      const componentCount = elts.filter((e: any) => e.type === 'rectangle' || e.type === 'ellipse' || e.type === 'diamond').length;
      const connectionCount = elts.filter((e: any) => e.type === 'arrow' || e.type === 'line').length;
      
      setFeedback(`Great start on your ${topicSlug} design!\nI see ${componentCount} components and ${connectionCount} connections.\n\nMake sure you've accounted for:\n- Load balancers for high availability\n- Database sharding strategies\n- Caching layers (e.g. Redis/Memcached)`);

    } catch (e) {
      console.error(e);
      setFeedback("Failed to analyze design. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full h-[700px] flex flex-col bg-[#0d1117] rounded-lg border border-[#30363d] overflow-hidden relative">
      <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22] z-10 shrink-0">
        <h2 className="text-lg font-semibold text-white font-mono">System Design Canvas: {topicSlug}</h2>
        <button 
          onClick={handleAiReview}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          Get AI Feedback
        </button>
      </div>

      <div className="flex-1 relative w-full h-full">
        {/* We need a specific wrapper for Excalidraw with fixed dimensions */}
        <div className="absolute inset-0">
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={initialData}
            theme="dark"
            onChange={(elements, state) => setElements(elements)}
          />
        </div>
      </div>

      {feedback && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#161b22]/95 backdrop-blur-md border border-[#30363d] p-4 rounded-lg shadow-2xl">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-purple-400 font-semibold flex items-center gap-2">
              <Zap size={16} /> AI Architect Feedback
            </h3>
            <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-line">{feedback}</p>
        </div>
      )}
    </div>
  );
}
