'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, CheckCircle2, FileEdit, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface PathStats {
  pathSlug: string;
  pathTitle: string;
  totalTopics: number;
  publishedTopics: number;
  draftTopics: number;
  needingContentTopics: number;
}

interface StatsResponse {
  totalTopics: number;
  totalPublished: number;
  totalDrafts: number;
  totalNeedingContent: number;
  pathStats: PathStats[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/admin/topics/stats`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={22} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Loading admin data…</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-[14px]" style={{ color: 'var(--error)' }}>
          Failed to load dashboard stats. Is the backend running?
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 sm:p-8"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.9rem',
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
            }}
          >
            Content admin
          </h1>
          <p className="text-[13.5px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {stats.totalTopics} topics across all learning paths
          </p>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {([
            { Icon: Layers,       label: 'Total topics',   value: stats.totalTopics,           color: 'var(--accent)' },
            { Icon: CheckCircle2, label: 'Published',      value: stats.totalPublished,         color: 'var(--success)' },
            { Icon: FileEdit,     label: 'Drafts',         value: stats.totalDrafts,            color: 'var(--warning)' },
            { Icon: AlertCircle,  label: 'Needs content',  value: stats.totalNeedingContent,    color: 'var(--error)' },
          ]).map(({ Icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-[10px] border p-4 flex flex-col items-center justify-center text-center"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <Icon size={18} strokeWidth={1.75} style={{ color, marginBottom: '8px' }} />
              <div
                className="text-[28px] font-medium tabular-nums"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
              >
                {value}
              </div>
              <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Paths table */}
        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <div
            className="px-5 py-3.5 border-b"
            style={{ background: 'var(--bg-inset)', borderColor: 'var(--border-default)' }}
          >
            <h2 className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
              Learning paths
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  {['Path', 'Total', 'Published', 'Drafts', 'Needs content', 'Progress'].map(h => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.pathStats.map(p => {
                  const pct = p.totalTopics > 0
                    ? Math.round((p.publishedTopics / p.totalTopics) * 100)
                    : 0;
                  return (
                    <tr
                      key={p.pathSlug}
                      style={{ borderBottom: '1px solid var(--border-default)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-elevated)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/paths/${p.pathSlug}/topics`}
                          className="text-[13.5px] font-medium transition-colors"
                          style={{ color: 'var(--accent)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-hover)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                        >
                          {p.pathTitle}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {p.totalTopics}
                      </td>
                      <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: 'var(--success)' }}>
                        {p.publishedTopics}
                      </td>
                      <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: 'var(--warning)' }}>
                        {p.draftTopics}
                      </td>
                      <td className="px-5 py-3 text-[13px] tabular-nums" style={{ color: 'var(--error)' }}>
                        {p.needingContentTopics}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 h-1 rounded-full overflow-hidden"
                            style={{ background: 'var(--bg-inset)' }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: pct === 100 ? 'var(--success)' : 'var(--accent)',
                              }}
                            />
                          </div>
                          <span
                            className="text-[11px] tabular-nums w-8 text-right"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
