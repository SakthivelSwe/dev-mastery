'use client';

import { Trophy } from 'lucide-react';
import type { InterviewScoreCard } from '@/lib/api';

const VERDICT_LABELS: Record<string, string> = {
  strong_hire: 'Strong Hire',
  lean_yes:    'Lean Yes',
  lean_no:     'Lean No',
  reject:      'Reject',
  pending:     'Pending',
};

const VERDICT_COLORS: Record<string, string> = {
  strong_hire: '#3FB950',
  lean_yes:    '#58A6FF',
  lean_no:     '#D29922',
  reject:      '#F85149',
  pending:     'var(--text-muted)',
};

export function verdictColor(verdict: string | null | undefined): string {
  return VERDICT_COLORS[verdict ?? 'pending'] ?? VERDICT_COLORS.pending;
}

export function verdictLabel(verdict: string | null | undefined): string {
  return VERDICT_LABELS[verdict ?? 'pending'] ?? String(verdict ?? 'Pending');
}

/**
 * Shared visual for the AI interviewer's structured scorecard. Reused by
 * `/interview` (immediate) and `/interview/history/[id]` (revisit).
 */
export function ScoreCardPanel({
  card,
  sessionId,
  className = '',
}: {
  card: InterviewScoreCard;
  sessionId?: string | null;
  className?: string;
}) {
  const dims = [
    { label: 'Technical depth',   value: card.technical },
    { label: 'Communication',     value: card.communication },
    { label: 'Problem solving',   value: card.problemSolving },
    { label: 'Seniority signals', value: card.seniority },
  ];
  const color = verdictColor(card.verdict);
  return (
    <div className={`rounded-lg border p-4 ${className}`}
         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Trophy size={14} style={{ color }} />
        <span className="text-[11px] uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}>Scorecard</span>
        <span className="ml-auto text-[12px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>
          {verdictLabel(card.verdict)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {dims.map(d => (
          <div key={d.label}
               className="rounded-md border px-2.5 py-2"
               style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <div className="text-[10.5px] uppercase tracking-widest"
                 style={{ color: 'var(--text-muted)' }}>{d.label}</div>
            <div className="mt-1 text-[16px] tabular-nums font-medium"
                 style={{ color: 'var(--text-primary)' }}>
              {d.value}<span className="text-[11px] ml-0.5"
                             style={{ color: 'var(--text-muted)' }}>/10</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-[12.5px]">
        <div>
          <div className="text-[11px] uppercase tracking-widest mb-1"
               style={{ color: 'var(--text-muted)' }}>Strengths</div>
          <ul className="list-disc pl-4 space-y-1" style={{ color: 'var(--text-secondary)' }}>
            {(card.strengths ?? []).length === 0
              ? <li style={{ color: 'var(--text-muted)' }}>—</li>
              : card.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest mb-1"
               style={{ color: 'var(--text-muted)' }}>Improvements</div>
          <ul className="list-disc pl-4 space-y-1" style={{ color: 'var(--text-secondary)' }}>
            {(card.improvements ?? []).length === 0
              ? <li style={{ color: 'var(--text-muted)' }}>—</li>
              : card.improvements.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      </div>

      {sessionId && (
        <div className="mt-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Session id: <span className="font-mono">{sessionId.slice(0, 8)}…</span>
        </div>
      )}
    </div>
  );
}

