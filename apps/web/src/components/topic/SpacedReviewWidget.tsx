'use client';

import React, { useState } from 'react';
import { Repeat, Eye, ThumbsDown, ThumbsUp, CheckCircle, Brain } from 'lucide-react';

interface SpacedReviewWidgetProps {
  topicSlug:           string;
  spacedReviewContent: string;
}

export default function SpacedReviewWidget({ topicSlug, spacedReviewContent }: SpacedReviewWidgetProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleRating = (rating: 'hard' | 'good' | 'easy') => {
    // In a real app, this sends the rating to the progress-service to calculate the next SM-2 interval
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="h-full flex flex-col max-w-2xl mx-auto items-center justify-center pb-20">
        <CheckCircle size={64} className="text-emerald-500 mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Review Complete!</h2>
        <p className="text-muted-foreground text-center">
          Great job. Based on your rating, we'll schedule the next review for this topic at the optimal time to maximize retention.
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
          Combat the forgetting curve. Review this core concept using Active Recall — the most
          effective learning technique proven by cognitive science.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden transition-all duration-500 min-h-[400px] flex flex-col">
          
          {/* Question Side */}
          <div className="flex-1 p-10 flex flex-col items-center justify-center text-center">
            <Brain size={32} className="text-muted-foreground/30 mb-6" />
            <h3 className="text-2xl font-medium leading-relaxed">
              Why does `String.class.getClassLoader()` return `null` in Java?
            </h3>
          </div>

          {/* Answer Side (Hidden by default) */}
          {showAnswer ? (
            <div className="flex-1 p-10 bg-indigo-500/5 border-t border-border flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4">Answer</h4>
              <p className="text-lg text-foreground/90 leading-relaxed">
                Because <code>java.lang.String</code> is a core Java class, it is loaded by the Bootstrap ClassLoader. 
                In HotSpot, the Bootstrap ClassLoader is written in native C++ code, not Java. Therefore, there is no Java 
                <code>ClassLoader</code> object to return, so the API specification dictates it returns <code>null</code>.
              </p>
              
              <div className="mt-10">
                <p className="text-center text-sm text-muted-foreground mb-4">How well did you recall this?</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => handleRating('hard')} className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                    <ThumbsDown size={18} /> Hard (1d)
                  </button>
                  <button onClick={() => handleRating('good')} className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors">
                    <CheckCircle size={18} /> Good (3d)
                  </button>
                  <button onClick={() => handleRating('easy')} className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                    <ThumbsUp size={18} /> Easy (7d)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-card/50 border-t border-border flex justify-center">
              <button 
                onClick={() => setShowAnswer(true)}
                className="flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-colors"
              >
                <Eye size={18} /> Show Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
