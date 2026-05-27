'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, CheckCircle, FileEdit, AlertCircle } from 'lucide-react';

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
    fetch('http://localhost:8082/admin/topics/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch admin stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-[#8B949E]">Loading Admin Dashboard...</div>;
  }

  if (!stats) {
    return <div className="p-8 text-red-500">Failed to load dashboard stats. Is content-service running?</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E6EDF3] mb-2">DevMastery Content Admin</h1>
        <p className="text-[#8B949E]">Manage all 989 topics across 18 learning paths</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex flex-col items-center justify-center">
          <Layers className="text-[#58A6FF] mb-2" size={32} />
          <div className="text-3xl font-bold text-[#E6EDF3]">{stats.totalTopics}</div>
          <div className="text-sm text-[#8B949E]">Total Topics</div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex flex-col items-center justify-center">
          <CheckCircle className="text-[#3FB950] mb-2" size={32} />
          <div className="text-3xl font-bold text-[#E6EDF3]">{stats.totalPublished}</div>
          <div className="text-sm text-[#8B949E]">Published</div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex flex-col items-center justify-center">
          <FileEdit className="text-[#D29922] mb-2" size={32} />
          <div className="text-3xl font-bold text-[#E6EDF3]">{stats.totalDrafts}</div>
          <div className="text-sm text-[#8B949E]">Drafts</div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6 flex flex-col items-center justify-center">
          <AlertCircle className="text-[#F85149] mb-2" size={32} />
          <div className="text-3xl font-bold text-[#E6EDF3]">{stats.totalNeedingContent}</div>
          <div className="text-sm text-[#8B949E]">Needs Content</div>
        </div>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#30363D] bg-[#0D1117]">
          <h2 className="text-xl font-semibold text-[#E6EDF3]">Learning Paths</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#30363D]">
              <th className="px-6 py-3 text-sm font-semibold text-[#8B949E]">Path Name</th>
              <th className="px-6 py-3 text-sm font-semibold text-[#8B949E]">Total</th>
              <th className="px-6 py-3 text-sm font-semibold text-[#8B949E]">Published</th>
              <th className="px-6 py-3 text-sm font-semibold text-[#8B949E]">Drafts</th>
              <th className="px-6 py-3 text-sm font-semibold text-[#8B949E]">Needs Content</th>
              <th className="px-6 py-3 text-sm font-semibold text-[#8B949E]">Progress</th>
            </tr>
          </thead>
          <tbody>
            {stats.pathStats.map((path) => {
              const progressPct = path.totalTopics > 0 
                ? Math.round((path.publishedTopics / path.totalTopics) * 100) 
                : 0;
                
              return (
                <tr key={path.pathSlug} className="border-b border-[#30363D] hover:bg-[#21262D] transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/paths/${path.pathSlug}/topics`} className="text-[#58A6FF] hover:underline font-medium">
                      {path.pathTitle}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#E6EDF3]">{path.totalTopics}</td>
                  <td className="px-6 py-4 text-[#3FB950]">{path.publishedTopics}</td>
                  <td className="px-6 py-4 text-[#D29922]">{path.draftTopics}</td>
                  <td className="px-6 py-4 text-[#F85149]">{path.needingContentTopics}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-[#0D1117] rounded-full h-2">
                        <div className="bg-[#3FB950] h-2 rounded-full" style={{ width: `${progressPct}%` }}></div>
                      </div>
                      <span className="text-xs text-[#8B949E] w-8">{progressPct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
