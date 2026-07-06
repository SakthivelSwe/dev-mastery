'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Brain, CheckCircle2, Loader2, RotateCcw, TrendingUp } from 'lucide-react';
import {
  fetchDueReviews,
  submitReviewRating,
  type ReviewItem,
} from '@/lib/api';

/**
 * Spaced-review queue — presents topics scheduled by the SM-2 algorithm
 * living inside the `progress` module of devmastery-core. The learner opens
 * the linked topic, tries to recall, then self-rates 1–5. Rating is POST'd
 * back and the server schedules the next review.
 */
export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const list = await fetchDueReviews();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (topicId: string, rating: number) => {
    setPendingId(topicId);
    const ok = await submitReviewRating(topicId, rating);
    setPendingId(null);
    if (ok) setDone(prev => new Set(prev).add(topicId));
  };

  const remaining = items.filter(i => !done.has(i.topicId));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest"
               style={{ color: 'var(--text-muted)' }}>
            <Brain size={14} /> Spaced Review
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            marginTop: 6,
          }}>
            Recall queue — today
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            The SM-2 algorithm chose these topics for you. Try to recall the
            core idea before revealing, then rate how easily it came back.
            Ratings 1–2 shorten the interval, 4–5 expand it.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="animate-spin" /> Loading your review queue…
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ProgressBar total={items.length} done={done.size} />
            <ul className="space-y-3 mt-6">
              {remaining.map(item => (
                <ReviewCard
                  key={item.topicId}
                  item={item}
                  pending={pendingId === item.topicId}
                  onRate={(r) => submit(item.topicId, r)}
                />
              ))}
              {done.size > 0 && (
                <li className="pt-4 flex items-center gap-2 text-[13px]"
                    style={{ color: 'var(--accent, #3FB950)' }}>
                  <CheckCircle2 size={16} /> {done.size} review{done.size === 1 ? '' : 's'} completed. Great streak!
                </li>
              )}
              {remaining.length === 0 && done.size > 0 && (
                <li className="pt-6 flex items-center gap-2 text-[14px]"
                    style={{ color: 'var(--text-secondary)' }}>
                  <TrendingUp size={16} /> Queue cleared. Come back tomorrow for the next batch.
                  <button onClick={load}
                          className="ml-3 inline-flex items-center gap-1 px-2 py-1 rounded border text-[12px]"
                          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                    <RotateCcw size={12} /> Refresh
                  </button>
                </li>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border p-8 text-center"
         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <TrendingUp size={28} className="mx-auto mb-3" style={{ color: 'var(--accent)' }} />
      <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        Nothing to review yet
      </h2>
      <p className="mt-1 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
        Complete a topic and it gets added to your review schedule automatically.
      </p>
      <Link href="/dashboard"
            className="inline-block mt-4 text-[13px] underline"
            style={{ color: 'var(--accent)' }}>
        Open your dashboard →
      </Link>
    </div>
  );
}

function ProgressBar({ total, done }: { total: number; done: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] mb-1"
           style={{ color: 'var(--text-muted)' }}>
        <span>{done}/{total} reviewed</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden"
           style={{ background: 'var(--bg-elevated)' }}>
        <div className="h-full transition-all"
             style={{ width: `${pct}%`, background: 'var(--accent, #3FB950)' }} />
      </div>
    </div>
  );
}

function ReviewCard({
  item, pending, onRate,
}: { item: ReviewItem; pending: boolean; onRate: (r: number) => void }) {
  const [revealed, setRevealed] = useState(false);

  const label = item.topicSlug ?? item.topicId.slice(0, 8);
  const overdueDays = Math.floor(
    (Date.now() - new Date(item.dueDate).getTime()) / (24 * 60 * 60 * 1000),
  );

  return (
    <li className="rounded-lg border p-4"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {item.repetitions === 0
              ? 'First review · new topic'
              : `Rep #${item.repetitions} · ease ${item.easeFactor.toFixed(2)}`}
            {overdueDays > 0 && (
              <span style={{ color: '#D29922' }}> · {overdueDays}d overdue</span>
            )}
          </div>
        </div>
        {item.topicSlug && (
          <Link href={`/learn/${item.topicSlug}`}
                className="text-[12px] underline whitespace-nowrap"
                style={{ color: 'var(--accent)' }}>
            Open topic →
          </Link>
        )}
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-3 text-[12px] px-3 py-1.5 rounded border"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
        >
          I&apos;ve recalled it — show rating buttons
        </button>
      ) : (
        <div className="mt-3">
          <div className="text-[11px] uppercase tracking-widest mb-1.5"
               style={{ color: 'var(--text-muted)' }}>
            How easily did it come back?
          </div>
          <div className="flex gap-1.5">
            {RATINGS.map(r => (
              <button
                key={r.value}
                disabled={pending}
                onClick={() => onRate(r.value)}
                title={r.label}
                className="px-3 py-1.5 rounded border text-[12px] transition-colors"
                style={{
                  borderColor: 'var(--border-default)',
                  background: 'var(--bg-elevated)',
                  color: r.color,
                  opacity: pending ? 0.5 : 1,
                }}
              >
                {r.value} · {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

const RATINGS: { value: number; label: string; color: string }[] = [
  { value: 1, label: 'Blank',      color: '#F85149' },
  { value: 2, label: 'Hard',       color: '#E3823E' },
  { value: 3, label: 'OK',         color: '#D29922' },
  { value: 4, label: 'Good',       color: '#58A6FF' },
  { value: 5, label: 'Easy',       color: '#3FB950' },
];

