'use client';

import React, { useState, useEffect } from 'react';
import { Bot, X, Loader2, Play } from 'lucide-react';

interface CodeReviewPanelProps {
  topicSlug: string;
  language: string;
  code: string;
  onClose: () => void;
}

export function CodeReviewPanel({ topicSlug, language, code, onClose }: CodeReviewPanelProps) {
  const [review, setReview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const startReview = async () => {
    setIsGenerating(true);
    setReview('');

    try {
      const response = await fetch('/api/v1/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug, language, code }),
      });

      if (!response.ok) throw new Error('Failed to start review');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            setReview((prev) => prev + decoder.decode(value, { stream: true }));
          }
        }
      }
    } catch (err) {
      setReview('An error occurred while generating the code review.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute inset-y-0 right-0 w-[400px] bg-[--bg-elevated] border-l border-[--border-default] shadow-2xl flex flex-col z-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[--border-default]">
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <Bot size={18} />
          AI Code Review
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[--bg-surface] rounded text-[--text-muted]">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 text-sm text-[--text-primary] whitespace-pre-wrap font-mono">
        {!review && !isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[--text-muted] gap-4">
            <Bot size={48} className="opacity-20" />
            <p>Ready to review your {language} code.</p>
            <button
              onClick={startReview}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 font-semibold"
            >
              <Play size={14} /> Start Review
            </button>
          </div>
        ) : (
          <div>
            {review}
            {isGenerating && (
              <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
