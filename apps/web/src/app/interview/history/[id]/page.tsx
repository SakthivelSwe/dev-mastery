'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, Loader2, Mic, User } from 'lucide-react';
import {
  fetchInterviewSession,
  type InterviewSessionDetail,
  type InterviewTranscriptTurn,
} from '@/lib/api';
import { ScoreCardPanel, verdictColor, verdictLabel } from '@/components/interview/ScoreCardPanel';

/**
 * Detail view for a single mock-interview session. Renders:
 *  1. Header (topic + level + verdict pill + duration)
 *  2. Structured scorecard (if graded)
 *  3. Full transcript with role bubbles
 *  4. Raw scorecard markdown fallback (from the last AI message)
 */
export default function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [detail, setDetail]   = useState<InterviewSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchInterviewSession(id).then(d => {
      if (!d) setNotFound(true);
      setDetail(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-[13px]"
             style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={16} className="animate-spin" /> Loading interview…
        </div>
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
          Interview not found or you don&apos;t have access to it.
        </p>
        <Link href="/interview/history"
              className="mt-4 inline-flex items-center gap-1 text-[13px] underline"
              style={{ color: 'var(--accent)' }}>
          <ArrowLeft size={13} /> Back to history
        </Link>
      </div>
    );
  }

  const { summary, transcript, scoreCard } = detail;
  const started  = new Date(summary.startedAt);
  const ended    = summary.endedAt ? new Date(summary.endedAt) : null;
  const duration = ended ? Math.max(1, Math.round((ended.getTime() - started.getTime()) / 60000)) : null;
  const color    = verdictColor(summary.verdict);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/interview/history"
              className="inline-flex items-center gap-1 text-[12px] mb-3 underline"
              style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={12} /> Interview history
        </Link>

        <header className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest"
                 style={{ color: 'var(--text-muted)' }}>
              <Mic size={13} /> Mock interview
            </div>
            <h1 className="mt-1 truncate" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 2.6vw, 1.8rem)',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
            }}>
              {summary.topicSlug}
            </h1>
            <p className="mt-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              {started.toLocaleString()} · {summary.targetLevel.toUpperCase()}
              {duration != null && <> · {duration} min</>}
              {' · '}{transcript.length} messages
            </p>
          </div>
          <span className="text-[12px] px-2 py-1 rounded-full font-medium whitespace-nowrap"
                style={{
                  background: `color-mix(in oklab, ${color} 18%, transparent)`,
                  color,
                }}>
            {verdictLabel(summary.verdict)}
          </span>
        </header>

        {scoreCard
          ? <ScoreCardPanel card={scoreCard} sessionId={summary.id} className="mb-6" />
          : <NoScorecard />
        }

        <section>
          <h2 className="text-[11px] uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-muted)' }}>Transcript</h2>
          <div className="rounded-lg border p-4 space-y-4"
               style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            {transcript
              .filter(t => !t.content.startsWith('[SYSTEM PRIMER'))
              .map((t, i) => <TranscriptBubble key={i} turn={t} />)}
            {transcript.length === 0 && (
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                Transcript is empty — this session was recorded without any messages.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TranscriptBubble({ turn }: { turn: InterviewTranscriptTurn }) {
  const isUser = turn.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
             style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}>
          <Bot size={13} />
        </div>
      )}
      <div className="max-w-[80%] rounded-lg px-3 py-2 text-[13.5px] whitespace-pre-wrap"
           style={{
             background: isUser ? 'var(--accent, #3FB950)' : 'var(--bg-elevated)',
             color:      isUser ? '#0D1117' : 'var(--text-primary)',
           }}>
        {turn.content || (isUser ? '' : '…')}
      </div>
      {isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
             style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
          <User size={13} />
        </div>
      )}
    </div>
  );
}

function NoScorecard() {
  return (
    <div className="mb-6 rounded-lg border p-4 text-[13px]"
         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
      No structured scorecard was generated for this session. Look at the last
      AI message in the transcript for the interviewer&apos;s raw feedback.
    </div>
  );
}

