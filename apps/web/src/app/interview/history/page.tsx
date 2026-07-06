'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, History, Loader2, Mic } from 'lucide-react';
import { fetchInterviewHistory, type InterviewSessionSummary } from '@/lib/api';
import { verdictColor, verdictLabel } from '@/components/interview/ScoreCardPanel';

export default function InterviewHistoryPage() {
  const [sessions, setSessions] = useState<InterviewSessionSummary[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchInterviewHistory().then(list => { setSessions(list); setLoading(false); });
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest"
                 style={{ color: 'var(--text-muted)' }}>
              <History size={14} /> Interview history
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginTop: 4,
            }}>
              Your past mock interviews
            </h1>
          </div>
          <Link href="/interview"
                className="inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded border transition-colors"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={13} /> New interview
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-[13px]"
               style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="animate-spin" /> Loading your history…
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {sessions.map(s => <SessionRow key={s.id} s={s} />)}
          </ul>
        )}
      </div>
    </div>
  );
}

function SessionRow({ s }: { s: InterviewSessionSummary }) {
  const started = new Date(s.startedAt);
  const durationMin = s.endedAt
    ? Math.max(1, Math.round((new Date(s.endedAt).getTime() - started.getTime()) / 60000))
    : null;
  const color = verdictColor(s.verdict);

  return (
    <li>
      <Link href={`/interview/history/${s.id}`}
            className="block rounded-lg border p-4 hover:border-[--accent] transition-colors"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[14px] font-medium truncate"
                 style={{ color: 'var(--text-primary)' }}>
              <Mic size={13} style={{ color: 'var(--accent)' }} />
              {s.topicSlug}
              <span className="text-[11px] px-1.5 py-0.5 rounded uppercase tracking-widest"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                {s.targetLevel}
              </span>
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {started.toLocaleString()} {durationMin != null && <>· {durationMin} min</>}
            </div>
          </div>
          <span className="text-[12px] px-2 py-1 rounded-full font-medium"
                style={{
                  background: `color-mix(in oklab, ${color} 15%, transparent)`,
                  color,
                }}>
            {verdictLabel(s.verdict)}
          </span>
        </div>
      </Link>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border p-8 text-center"
         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <Mic size={28} className="mx-auto mb-3" style={{ color: 'var(--accent)' }} />
      <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        No interviews yet
      </h2>
      <p className="mt-1 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        Complete a mock interview to see your history and track scorecards over time.
      </p>
      <Link href="/interview"
            className="inline-block mt-4 text-[13px] underline"
            style={{ color: 'var(--accent)' }}>
        Start your first interview →
      </Link>
    </div>
  );
}

