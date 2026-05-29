'use client';

import React, { useState } from 'react';
import { Bot, Mic, PlaySquare } from 'lucide-react';
import { useTopicStore } from '@/store/useTopicStore';

interface FeynmanCheckPanelProps {
  topicSlug:  string;
  topicTitle: string;
}

export default function FeynmanCheckPanel({ topicSlug, topicTitle }: FeynmanCheckPanelProps) {
  const [explanation, setExplanation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!explanation.trim()) return;
    setIsAnalyzing(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      setFeedback("Great explanation! You clearly understand the core concepts. One thing to add: mention how the JVM's JIT compiler optimizations make it fast for long-running processes.");
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col max-w-3xl pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display mb-3 flex items-center gap-3">
          <Mic className="text-[--accent-java]" size={28} />
          Feynman Check
        </h2>
        <p className="text-[--text-secondary] leading-7">
          The ultimate test of understanding is the ability to explain it simply.
          Explain <strong className="text-[--text-primary]">{topicTitle}</strong> in your own words,
          as if you were teaching a junior developer. The AI will score your understanding from 1–10.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="relative flex-1 min-h-[300px]">
          <textarea
            className="w-full h-full bg-[--bg-elevated] border border-[--border-default] rounded-xl p-6 text-[--text-primary] resize-none focus:outline-none focus:ring-2 focus:ring-[--accent-java] transition-all placeholder:text-[--text-muted]"
            placeholder={`Explain ${topicTitle} as if teaching a junior developer...`}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {explanation.split(/\s+/).filter(w => w.length > 0).length} words
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || !explanation.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">Analyzing...</span>
            ) : (
              <>
                <Bot size={18} />
                Analyze Explanation
              </>
            )}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mt-6 p-6 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mt-1 shrink-0">
            <Bot className="text-indigo-400" size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-300 mb-2 text-sm tracking-wide uppercase">AI Feedback</h3>
            <p className="text-indigo-100/85 leading-relaxed">{feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
