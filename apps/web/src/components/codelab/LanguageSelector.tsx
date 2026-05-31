'use client';

import React from 'react';
import { ThumbsUp } from 'lucide-react';

export type Language = 'java' | 'python' | 'javascript' | 'cpp';

export const LANGUAGE_LABELS: Record<Language, string> = {
  java:       'Java',
  python:     'Python',
  javascript: 'JavaScript',
  cpp:        'C++',
};

interface LanguageSelectorProps {
  selectedLanguage: Language;
  availableLanguages: Language[];
  onLanguageChange: (lang: Language) => void;
}

export function LanguageSelector({
  selectedLanguage,
  availableLanguages,
  onLanguageChange,
}: LanguageSelectorProps) {

  const handleRequest = (e: React.MouseEvent, l: Language) => {
    e.stopPropagation();
    // In a real app, this would send an API request to track interest
    alert(`Thank you! Your interest in ${LANGUAGE_LABELS[l]} for this topic has been recorded.`);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[--border-default] bg-[--bg-elevated] overflow-x-auto">
      <span className="text-xs text-[--text-muted] mr-2 shrink-0">Language:</span>
      {(Object.keys(LANGUAGE_LABELS) as Language[]).map(l => {
        const isAvailable = availableLanguages.includes(l);
        const isSelected = selectedLanguage === l;

        return (
          <div key={l} className="relative group">
            <button
              onClick={() => isAvailable && onLanguageChange(l)}
              disabled={!isAvailable}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5 shrink-0 ${
                isSelected && isAvailable
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                  : isAvailable
                  ? 'border-[--border-default] text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-surface]'
                  : 'border-[--border-muted] text-[--text-muted] opacity-40 cursor-not-allowed'
              }`}
            >
              {LANGUAGE_LABELS[l]}
              {!isAvailable && (
                <span className="text-[9px] uppercase tracking-wider opacity-60">
                  soon
                </span>
              )}
            </button>

            {/* Request Tooltip/CTA for unavailable languages */}
            {!isAvailable && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-[#2d2d2d] border border-[#444] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="text-[10px] text-gray-300 mb-2 leading-relaxed">
                  {LANGUAGE_LABELS[l]} implementation is not yet available for this tier.
                </p>
                <button
                  onClick={(e) => handleRequest(e, l)}
                  className="w-full flex items-center justify-center gap-1.5 py-1 px-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded text-[10px] font-medium transition-colors"
                >
                  <ThumbsUp size={10} />
                  Request this language
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
