'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Check, X, ArrowLeft, Play, PenTool, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface TopicSummary {
  id: string;
  slug: string;
  title: string;
  level: number;
  orderIndex: number;
  hasVisualizer: boolean;
  hasCodeLab: boolean;
  isPublished: boolean;
  wordCount: number;
  hasContent: boolean;
  updatedAt: string;
}

export default function AdminTopicList({ params }: { params: Promise<{ pathSlug: string }> }) {
  const { pathSlug } = use(params);
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/admin/topics/paths/${pathSlug}`)
      .then(r => r.json())
      .then(data => { setTopics(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [pathSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={22} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Loading topics for {pathSlug}…
          </span>
        </div>
      </div>
    );
  }

  const published  = topics.filter(t => t.isPublished).length;
  const hasContent = topics.filter(t => t.hasContent).length;

  return (
    <div
      className="min-h-screen p-6 sm:p-8"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-6xl mx-auto">

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[12.5px] mb-5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <ArrowLeft size={13} /> Back to admin
        </Link>

        <div className="flex items-end justify-between mb-6">
          <div>
            <h1
              className="capitalize"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                letterSpacing: '-0.015em',
                color: 'var(--text-primary)',
              }}
            >
              {pathSlug.replace(/-/g, ' ')}
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {topics.length} topics · {published} published · {hasContent} with content
            </p>
          </div>
        </div>

        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-inset)' }}>
                  {['#', 'Title', 'Lvl', 'Visualizer', 'Content', 'Published', 'Words', ''].map(h => (
                    <th
                      key={h}
                      className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider ${h === 'Visualizer' || h === 'Content' || h === 'Published' ? 'text-center' : ''}`}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topics.map(t => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: '1px solid var(--border-default)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                  >
                    <td
                      className="px-4 py-3 text-[12px] tabular-nums"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}
                    >
                      {String(t.orderIndex).padStart(2, '0')}
                    </td>
                    <td
                      className="px-4 py-3 text-[13.5px] font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t.title}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded tabular-nums"
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-secondary)',
                          fontFamily: 'var(--font-code)',
                        }}
                      >
                        L{t.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.hasVisualizer
                        ? <Play size={14} strokeWidth={1.75} style={{ color: 'var(--accent)', display: 'inline' }} />
                        : <span style={{ color: 'var(--text-muted)' }}>–</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.hasContent
                        ? <Check size={14} strokeWidth={2.5} style={{ color: 'var(--success)', display: 'inline' }} />
                        : <X size={13} strokeWidth={2} style={{ color: 'var(--error)', display: 'inline' }} />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.isPublished
                        ? <Check size={14} strokeWidth={2.5} style={{ color: 'var(--success)', display: 'inline' }} />
                        : <X size={13} strokeWidth={2} style={{ color: 'var(--text-muted)', display: 'inline' }} />}
                    </td>
                    <td
                      className="px-4 py-3 text-[12px] tabular-nums"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t.wordCount > 0 ? `${t.wordCount.toLocaleString()}w` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/topics/${t.slug}/edit`}
                        className="inline-flex items-center gap-1 text-[12.5px] font-medium px-2.5 py-1 rounded-md transition-colors"
                        style={{
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          border: '1px solid var(--border-default)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-ring)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                      >
                        <PenTool size={11} /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
