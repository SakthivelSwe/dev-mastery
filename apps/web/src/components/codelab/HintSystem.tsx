'use client';

import React, { useState } from 'react';
import { Lightbulb, ChevronRight, Check } from 'lucide-react';

interface HintSystemProps {
  topicSlug: string;
  code: string;
}

export function HintSystem({ topicSlug, code }: HintSystemProps) {
  const [hintLevel, setHintLevel] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const requestHint = async (level: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug, hintLevel: level, currentCode: code }),
      });
      if (response.ok) {
        const data = await response.json();
        setHints(prev => [...prev, data.hintText]);
        setHintLevel(level);
      }
    } catch (err) {
      console.error('Failed to get hint', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      {hints.map((hint, i) => (
        <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-100 flex gap-2">
          <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p>{hint}</p>
        </div>
      ))}

      {hintLevel < 3 && (
        <div className="flex flex-col gap-2 p-3 bg-[--bg-surface] border border-[--border-default] rounded-lg">
          <h4 className="text-xs font-semibold text-[--text-secondary] flex items-center gap-1 mb-1">
            Need a hint?
          </h4>
          <div className="flex flex-col gap-1.5">
            {hintLevel < 1 && (
              <HintButton 
                level={1} 
                cost={5} 
                label="Subtle Hint (Point me in the right direction)" 
                onClick={() => requestHint(1)} 
                isLoading={isLoading} 
              />
            )}
            {hintLevel < 2 && (
              <HintButton 
                level={2} 
                cost={15} 
                label="Moderate Hint (Specific logic help)" 
                onClick={() => requestHint(2)} 
                isLoading={isLoading} 
                disabled={hintLevel < 1}
              />
            )}
            {hintLevel < 3 && (
              <HintButton 
                level={3} 
                cost={30} 
                label="Explicit Hint (Show me what to do)" 
                onClick={() => requestHint(3)} 
                isLoading={isLoading} 
                disabled={hintLevel < 2}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HintButton({ level, cost, label, onClick, isLoading, disabled = false }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-between p-2 rounded border text-xs text-left transition-colors ${
        disabled 
          ? 'border-[--border-muted] text-[--text-muted] opacity-50 cursor-not-allowed' 
          : 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300'
      }`}
    >
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${disabled ? 'bg-[--border-default]' : 'bg-blue-500/20 text-blue-400'}`}>
          -{cost} XP
        </span>
        <ChevronRight size={14} className={disabled ? 'opacity-50' : ''} />
      </div>
    </button>
  );
}
