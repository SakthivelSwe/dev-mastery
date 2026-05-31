'use client';

import React, { useState } from 'react';
import { Brain, Star, ChevronRight, Loader2 } from 'lucide-react';

interface FeynmanCheckTabProps {
  topicSlug: string;
}

export function FeynmanCheckTab({ topicSlug }: FeynmanCheckTabProps) {
  const [explanation, setExplanation] = useState('');
  const [round, setRound] = useState(1);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; text: string; nextQuestion?: string } | null>(null);

  const submitExplanation = async () => {
    if (!explanation.trim()) return;
    
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/v1/ai/feynman/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug, explanation, round }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setFeedback({
          score: data.score,
          text: data.feedback,
          nextQuestion: data.followupQuestion,
        });
        if (data.passed) {
          // In real app, trigger XP / badge animation
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Brain className="text-purple-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[--text-primary]">Feynman Check</h2>
          <p className="text-sm text-[--text-muted]">Explain this concept simply to test your deep understanding.</p>
        </div>
      </div>

      <div className="bg-[--bg-surface] border border-[--border-default] rounded-xl p-5 mb-6">
        <h3 className="font-medium text-[--text-primary] mb-2">Round {round}: Explain it to a beginner</h3>
        <p className="text-sm text-[--text-secondary] mb-4">
          {feedback?.nextQuestion || 'How does this data structure/algorithm work? Why is it useful?'}
        </p>
        
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Start typing your explanation..."
          className="w-full h-32 bg-[--bg-elevated] border border-[--border-muted] rounded-lg p-3 text-sm text-[--text-primary] placeholder-[--text-muted] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none resize-none transition-all"
        />
        
        <div className="flex justify-end mt-3">
          <button
            onClick={submitExplanation}
            disabled={isEvaluating || !explanation.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            {isEvaluating ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            Submit Explanation
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`border rounded-xl p-5 ${feedback.score >= 4 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold ${feedback.score >= 4 ? 'text-emerald-400' : 'text-amber-400'}`}>
              AI Feedback
            </h4>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className={s <= feedback.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
              ))}
            </div>
          </div>
          <p className="text-sm text-[--text-secondary] leading-relaxed">
            {feedback.text}
          </p>
          {feedback.score < 4 && (
            <button
              onClick={() => { setExplanation(''); setRound(r => r + 1); setFeedback(null); }}
              className="mt-4 px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded hover:bg-amber-500/30 transition-colors"
            >
              Try Again (Round {round + 1})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
