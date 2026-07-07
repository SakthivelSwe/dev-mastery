'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle2, Database, FileText, RefreshCcw } from 'lucide-react';

interface PerPath {
  path: string;
  mdx: number;
  linked: number;
  orphanMdx: number;
  orphanMdxSlugs: string[];
  orphanDb: number;
  orphanDbSlugs: string[];
  titleDrift: number;
  driftSlugs: string[];
}

interface ContentVsDbReport {
  generatedAt: string;
  totals: {
    paths: number;
    orphanMdx: number;
    orphanDb: number;
    titleDrift: number;
    mdxFiles: number;
    junctionRows: number;
  };
  perPath: PerPath[];
}

export default function ContentVsDbPage() {
  const [report, setReport] = useState<ContentVsDbReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch('/_audit/content-vs-db.json', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setReport)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: 'var(--bg-canvas)' }}>
      <div className="max-w-6xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium mb-4 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={13} />
          Admin
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              MDX ↔ Database Alignment
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Reads <code>/_audit/content-vs-db.json</code>. Regenerate with{' '}
              <code>npm run content:reconcile:audit</code>.
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <RefreshCcw size={12} />
            Reload
          </button>
        </div>

        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-md border"
            style={{ borderColor: '#F85149', background: '#2b0f12', color: '#F85149' }}>
            <AlertCircle size={16} />
            Failed to load report: {error}. Run <code>npm run content:reconcile:audit</code> first.
          </div>
        )}

        {report && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Kpi label="Learning Paths" value={report.totals.paths} icon={<Database size={14} />} />
              <Kpi label="MDX Files"      value={report.totals.mdxFiles} icon={<FileText size={14} />} />
              <Kpi label="Junction Links" value={report.totals.junctionRows} icon={<Database size={14} />} />
              <Kpi
                label="Total Issues"
                value={report.totals.orphanMdx + report.totals.orphanDb + report.totals.titleDrift}
                icon={report.totals.orphanMdx + report.totals.orphanDb + report.totals.titleDrift === 0
                  ? <CheckCircle2 size={14} color="#3FB950" />
                  : <AlertCircle size={14} color="#D29922" />}
              />
            </div>

            <p className="text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
              Generated at {new Date(report.generatedAt).toLocaleString()}
            </p>

            <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-default)' }}>
              <table className="w-full text-[12.5px]">
                <thead style={{ background: 'var(--bg-elevated)' }}>
                  <tr>
                    <Th>Path</Th>
                    <Th right>MDX</Th>
                    <Th right>Linked</Th>
                    <Th right>Orphan MDX</Th>
                    <Th right>Orphan DB</Th>
                    <Th right>Title Drift</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {report.perPath.map((p) => {
                    const issues = p.orphanMdx + p.orphanDb + p.titleDrift;
                    return (
                      <tr key={p.path} style={{ borderTop: '1px solid var(--border-default)' }}>
                        <Td><code>{p.path}</code></Td>
                        <Td right>{p.mdx}</Td>
                        <Td right>{p.linked}</Td>
                        <Td right style={p.orphanMdx > 0 ? { color: '#F85149' } : undefined}>{p.orphanMdx}</Td>
                        <Td right style={p.orphanDb > 0 ? { color: '#F85149' } : undefined}>{p.orphanDb}</Td>
                        <Td right style={p.titleDrift > 0 ? { color: '#D29922' } : undefined}>{p.titleDrift}</Td>
                        <Td>{issues === 0
                          ? <span style={{ color: '#3FB950' }}>✓ Clean</span>
                          : <span style={{ color: '#D29922' }}>{issues} issue{issues === 1 ? '' : 's'}</span>}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase font-bold tracking-wider mb-1"
        style={{ color: 'var(--text-muted)' }}>
        {icon}
        {label}
      </div>
      <div className="text-[22px] font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${right ? 'text-right' : 'text-left'}`}
      style={{ color: 'var(--text-muted)' }}>
      {children}
    </th>
  );
}

function Td({ children, right, style }: { children: React.ReactNode; right?: boolean; style?: React.CSSProperties }) {
  return (
    <td className={`px-3 py-2 ${right ? 'text-right tabular-nums' : ''}`}
      style={{ color: 'var(--text-primary)', ...style }}>
      {children}
    </td>
  );
}

