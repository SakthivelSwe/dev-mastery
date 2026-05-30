'use client';

import React, { useState } from 'react';
import { Repeat, Eye, ThumbsDown, ThumbsUp, CheckCircle, Brain } from 'lucide-react';

interface SpacedReviewWidgetProps {
  topicSlug:           string;
  spacedReviewContent: string;
}

export default function SpacedReviewWidget({ topicSlug, spacedReviewContent }: SpacedReviewWidgetProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted]   = useState(false);

  const handleRating = (_rating: 'hard' | 'good' | 'easy') => {
    // TODO: send rating to progress-service for SM-2 scheduling
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="h-full flex flex-col max-w-2xl mx-auto items-center justify-center pb-20">
        <CheckCircle size={64} className="text-emerald-500 mb-6" />
        <h2 className="text-2xl font-semibold text-[--text-primary] mb-2">Review Complete!</h2>
        <p className="text-[--text-secondary] text-center max-w-sm">
          Great job. Based on your rating, we'll schedule the next review at the optimal time to maximize long-term retention.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display mb-3 flex items-center gap-3">
          <Repeat className="text-[--accent-java]" size={28} />
          Spaced Review
        </h2>
        <p className="text-[--text-secondary] leading-7">
          Combat the forgetting curve with Active Recall — the most effective retention technique proven by cognitive science.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-[--bg-surface] border border-[--border-default] rounded-2xl shadow-xl overflow-hidden min-h-[380px] flex flex-col">

          {/* Question Side */}
          <div className="flex-1 p-10 flex flex-col items-center justify-center text-center">
            <Brain size={32} className="mb-6 opacity-20" style={{ color: 'var(--text-muted)' }} />
            {spacedReviewContent && spacedReviewContent.trim() ? (
              <p className="text-xl font-medium text-[--text-primary] leading-relaxed">{spacedReviewContent}</p>
            ) : (
              <h3 className="text-xl font-medium text-[--text-primary] leading-relaxed">
                Can you explain the core concept of <strong>{topicSlug.replace(/-/g, ' ')}</strong> in your own words?
              </h3>
            )}
            <p className="text-xs text-[--text-muted] mt-4">Think carefully before revealing the answer.</p>
          </div>

          {/* Answer Side */}
          {showAnswer ? (
            <div className="p-8 bg-indigo-500/5 border-t border-[--border-default] flex flex-col justify-center">
              <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Review Complete</h4>
              <p className="text-[--text-secondary] leading-relaxed text-sm mb-8">
                Compare your answer with the reference material. Be honest with yourself — that's how you learn fastest.
              </p>

              <p className="text-center text-sm text-[--text-muted] mb-4">How well did you recall this?</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => handleRating('hard')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all text-sm font-medium"
                >
                  <ThumbsDown size={16} /> Hard (1d)
                </button>
                <button
                  onClick={() => handleRating('good')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all text-sm font-medium"
                >
                  <CheckCircle size={16} /> Good (3d)
                </button>
                <button
                  onClick={() => handleRating('easy')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-sm font-medium"
                >
                  <ThumbsUp size={16} /> Easy (7d)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-[--bg-elevated]/30 border-t border-[--border-default] flex justify-center">
              <button
                onClick={() => setShowAnswer(true)}
                className="flex items-center gap-2 bg-[--text-primary] text-[--bg-primary] px-8 py-3 rounded-full font-semibold text-sm hover:brightness-90 transition-all active:scale-95"
              >
                <Eye size={16} /> Show Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
