import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, RefreshCcw, TriangleAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface TopicReport {
  pathSlug: string;
  topicSlug: string;
  title: string;
  level: number | null;
  score: number;
  status: 'green' | 'yellow' | 'red';
  missing: string[];
  shallow: { key: string; words: number; min: number }[];
  ruleFailures: { id: string; label: string }[];
  wordCounts: Record<string, number>;
}

interface PathReport {
  pathSlug: string;
  total: number;
  green: number;
  yellow: number;
  red: number;
  avgScore: number;
}

interface HealthReport {
  overall: {
    generatedAt: string;
    totalTopics: number;
    green: number;
    yellow: number;
    red: number;
    avgScore: number;
  };
  paths: PathReport[];
  topics: TopicReport[];
}

async function loadReport(): Promise<HealthReport | null> {
  const reportPath = path.join(process.cwd(), 'content', '_audit', 'health.json');
  try {
    const raw = await fs.readFile(reportPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function StatusPill({ status }: { status: 'green' | 'yellow' | 'red' }) {
  const map = {
    green:  { bg: '#0f2b1a', fg: '#3FB950', label: 'Healthy' },
    yellow: { bg: '#2b230f', fg: '#D29922', label: 'Shallow' },
    red:    { bg: '#2b0f12', fg: '#F85149', label: 'Broken' },
  } as const;
  const t = map[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
          style={{ background: t.bg, color: t.fg }}>
      {t.label}
    </span>
  );
}

export default async function ContentHealthPage({
  searchParams,
}: { searchParams: Promise<{ path?: string; status?: string }> }) {
  const report = await loadReport();
  const params = await searchParams;

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto p-8 font-sans">
        <h1 className="text-2xl font-semibold text-[#E6EDF3] mb-2">Content Health</h1>
        <p className="text-[#8B949E] mb-6">
          No audit report found. Run the auditor from the repo root:
        </p>
        <pre className="bg-[#161B22] border border-[#30363D] rounded p-4 text-[13px] text-[#E6EDF3]">
          npm run content:audit
        </pre>
      </div>
    );
  }

  const pathFilter   = params.path ?? '';
  const statusFilter = params.status ?? '';

  const topics = report.topics
    .filter(t => !pathFilter   || t.pathSlug === pathFilter)
    .filter(t => !statusFilter || t.status === statusFilter)
    .sort((a, b) => a.score - b.score);

  return (
    <div className="max-w-7xl mx-auto p-8 font-sans">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#E6EDF3]">Content Health</h1>
          <p className="text-[13px] text-[#8B949E]">
            Generated {new Date(report.overall.generatedAt).toLocaleString()} — {report.overall.totalTopics} topics scanned
          </p>
        </div>
        <Link href="/admin" className="text-[13px] text-[#58A6FF] hover:underline">← Admin</Link>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat icon={<RefreshCcw size={22} />} value={`${report.overall.avgScore}/100`} label="Average score" color="#58A6FF" />
        <Stat icon={<CheckCircle2 size={22} />} value={report.overall.green}  label="Healthy"  color="#3FB950" />
        <Stat icon={<TriangleAlert size={22} />} value={report.overall.yellow} label="Shallow" color="#D29922" />
        <Stat icon={<AlertCircle size={22} />}  value={report.overall.red}    label="Broken"  color="#F85149" />
      </div>

      {/* Path scoreboard */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-[#30363D] bg-[#0D1117] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#E6EDF3]">Path scoreboard</h2>
          {pathFilter && (
            <Link href="/admin/content-health" className="text-[12px] text-[#58A6FF] hover:underline">
              Clear filter
            </Link>
          )}
        </div>
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#30363D] text-[11px] uppercase tracking-wider text-[#8B949E]">
              <th className="px-5 py-2 font-semibold">Path</th>
              <th className="px-5 py-2 font-semibold text-right">Avg</th>
              <th className="px-5 py-2 font-semibold text-right">🟢</th>
              <th className="px-5 py-2 font-semibold text-right">🟡</th>
              <th className="px-5 py-2 font-semibold text-right">🔴</th>
              <th className="px-5 py-2 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {report.paths.map(p => (
              <tr key={p.pathSlug} className="border-b border-[#30363D] hover:bg-[#21262D] transition-colors">
                <td className="px-5 py-2">
                  <Link href={`/admin/content-health?path=${p.pathSlug}`}
                        className="text-[#58A6FF] hover:underline">{p.pathSlug}</Link>
                </td>
                <td className="px-5 py-2 text-right font-mono text-[#E6EDF3]">{p.avgScore}</td>
                <td className="px-5 py-2 text-right text-[#3FB950]">{p.green}</td>
                <td className="px-5 py-2 text-right text-[#D29922]">{p.yellow}</td>
                <td className="px-5 py-2 text-right text-[#F85149]">{p.red}</td>
                <td className="px-5 py-2 text-right text-[#8B949E]">{p.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-3 text-[12px]">
        <span className="text-[#8B949E]">Filter:</span>
        {(['', 'red', 'yellow', 'green'] as const).map(s => (
          <Link
            key={s || 'all'}
            href={`/admin/content-health?${new URLSearchParams({ ...(pathFilter && { path: pathFilter }), ...(s && { status: s }) })}`}
            className="px-2 py-0.5 rounded border"
            style={{
              borderColor: statusFilter === s ? '#58A6FF' : '#30363D',
              color: statusFilter === s ? '#58A6FF' : '#8B949E',
            }}
          >
            {s || 'All'}
          </Link>
        ))}
        <span className="text-[#8B949E] ml-auto">{topics.length} topics</span>
      </div>

      {/* Topic list */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#30363D] text-[11px] uppercase tracking-wider text-[#8B949E] sticky top-0 bg-[#0D1117]">
              <th className="px-5 py-2 font-semibold">Topic</th>
              <th className="px-5 py-2 font-semibold text-right">Score</th>
              <th className="px-5 py-2 font-semibold">Status</th>
              <th className="px-5 py-2 font-semibold">Missing</th>
              <th className="px-5 py-2 font-semibold">Rule failures</th>
            </tr>
          </thead>
          <tbody>
            {topics.slice(0, 500).map(t => (
              <tr key={`${t.pathSlug}/${t.topicSlug}`} className="border-b border-[#30363D] hover:bg-[#21262D] transition-colors align-top">
                <td className="px-5 py-2">
                  <Link href={`/learn/${t.pathSlug}/${t.topicSlug}`} className="text-[#E6EDF3] hover:text-[#58A6FF]">
                    {t.title}
                  </Link>
                  <div className="text-[11px] text-[#8B949E] mt-0.5">{t.pathSlug} · L{t.level ?? '?'}</div>
                </td>
                <td className="px-5 py-2 text-right font-mono text-[#E6EDF3]">{t.score}</td>
                <td className="px-5 py-2"><StatusPill status={t.status} /></td>
                <td className="px-5 py-2 text-[#F85149] text-[12px]">
                  {t.missing.length ? t.missing.join(', ') : '—'}
                </td>
                <td className="px-5 py-2 text-[#D29922] text-[12px]">
                  {t.ruleFailures.length ? t.ruleFailures.map(r => r.id).join(', ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {topics.length > 500 && (
          <div className="px-5 py-3 text-[12px] text-[#8B949E] border-t border-[#30363D]">
            Showing 500 of {topics.length}. Narrow by path or status to see more.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, value, label, color }: { icon: React.ReactNode; value: React.ReactNode; label: string; color: string }) {
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 flex items-center gap-3">
      <div style={{ color }}>{icon}</div>
      <div>
        <div className="text-xl font-semibold text-[#E6EDF3] leading-tight">{value}</div>
        <div className="text-[12px] text-[#8B949E]">{label}</div>
      </div>
    </div>
  );
}

