'use client';

import { useState } from 'react';
import { Bot, Mic, Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useFeynmanScore, type FeynmanScore } from '@/hooks/useAiChat';

interface FeynmanCheckPanelProps {
  topicSlug:  string;
  topicTitle: string;
}

// ─── Score Meter ──────────────────────────────────────────────

function ScoreMeter({ score, passed }: { score: number; passed: boolean }) {
  const pct = (score / 10) * 100;
  const color = score >= 8 ? '#3FB950' : score >= 6 ? '#D29922' : '#F85149';

  return (
    <div className="flex flex-col items-center py-6">
      {/* Circular gauge */}
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
          {/* Background track */}
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
          {/* Score arc */}
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${pct * 3.14} 314`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs text-[--text-muted]">/ 10</span>
        </div>
      </div>

      {/* Pass/Fail badge */}
      <div className={`mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${
        passed
          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
          : 'bg-red-500/15 text-red-400 border border-red-500/30'
      }`}>
        {passed
          ? <><CheckCircle2 size={16} /> Concept Understood!</>
          : <><XCircle size={16} /> Keep Studying</>
        }
      </div>
    </div>
  );
}

// ─── Results Panel ────────────────────────────────────────────

function ResultsPanel({ result, onRetry }: { result: FeynmanScore; onRetry: () => void }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ScoreMeter score={result.score} passed={result.passed} />

      {/* Feedback */}
      <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={18} className="text-indigo-400" />
          <h4 className="font-semibold text-indigo-300 text-sm">AI Mentor Feedback</h4>
        </div>
        <p className="text-[--text-secondary] leading-relaxed text-sm">{result.feedback}</p>
      </div>

      {/* Gaps */}
      {result.gaps.length > 0 && !result.passed && (
        <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-400" />
            <h4 className="font-semibold text-amber-300 text-sm">Knowledge Gaps to Address</h4>
          </div>
          <ul className="space-y-2">
            {result.gaps.map((gap, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[--text-secondary]">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[--border-default] text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-elevated] text-sm transition-all"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
        {result.passed && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 text-sm font-semibold">
            <CheckCircle2 size={14} />
            Layer 7 Complete! +{50} XP
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function FeynmanCheckPanel({ topicSlug, topicTitle }: FeynmanCheckPanelProps) {
  const [explanation, setExplanation] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { score: submitScore, result, isLoading } = useFeynmanScore();

  const wordCount = explanation.trim().split(/\s+/).filter(w => w.length > 0).length;
  const minWords = 30;
  const canSubmit = wordCount >= minWords && !isLoading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await submitScore(topicSlug, topicTitle, explanation);
    setShowResults(true);
  };

  const handleRetry = () => {
    setShowResults(false);
    setExplanation('');
  };

  return (
    <div className="max-w-2xl pb-20">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold font-display mb-3 flex items-center gap-3">
          <Mic className="text-[--accent-java]" size={28} />
          Feynman Check
        </h2>
        <p className="text-[--text-secondary] leading-7">
          The ultimate test of understanding is the ability to explain it simply.
          Explain <strong className="text-[--text-primary]">{topicTitle}</strong> in your own words —
          as if you're teaching a junior developer. Gemini will score your understanding from <strong className="text-[--text-primary]">1–10</strong>.
        </p>
      </div>

      {!showResults ? (
        <div className="space-y-4">
          {/* Instruction card */}
          <div className="p-4 bg-[--bg-elevated] border border-[--border-default] rounded-xl">
            <p className="text-xs text-[--text-muted] font-medium uppercase tracking-wider mb-2">💡 Tips for a great explanation</p>
            <ul className="text-sm text-[--text-secondary] space-y-1">
              <li>• Start with &ldquo;What is it?&rdquo; — define the concept in one sentence</li>
              <li>• Explain &ldquo;Why does it exist?&rdquo; — the problem it solves</li>
              <li>• Give a concrete example or analogy</li>
              <li>• Mention any trade-offs or common mistakes</li>
            </ul>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              className="w-full min-h-[280px] bg-[--bg-elevated] border border-[--border-default] rounded-xl p-5 text-[--text-primary] resize-none focus:outline-none focus:ring-2 focus:ring-[--accent-java] transition-all placeholder:text-[--text-muted] text-sm leading-relaxed"
              placeholder={`Explain ${topicTitle} as if teaching a junior developer who has never seen it before...`}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-sm ${wordCount >= minWords ? 'text-green-400' : 'text-[--text-muted]'}`}>
                {wordCount} words
              </span>
              {wordCount < minWords && (
                <span className="text-xs text-[--text-muted]">
                  ({minWords - wordCount} more to unlock)
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:text-indigo-700 text-white text-sm font-semibold transition-all duration-200 active:scale-95"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Gemini is scoring...</>
              ) : (
                <><Bot size={16} /> Score My Explanation</>
              )}
            </button>
          </div>
        </div>
      ) : (
        result && <ResultsPanel result={result} onRetry={handleRetry} />
      )}
    </div>
  );
}
