'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, ArrowLeft, Settings, PenTool } from 'lucide-react';

const CONTENT_API = process.env.NEXT_PUBLIC_CONTENT_API_URL || 'http://localhost:8082';

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

export default function AdminTopicList({ params }: { params: { pathSlug: string } }) {
  const { pathSlug } = params;
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${CONTENT_API}/admin/topics/paths/${pathSlug}`)
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch topics:', err);
        setLoading(false);
      });
  }, [pathSlug]);

  if (loading) {
    return <div className="p-8 text-[#8B949E]">Loading Topics for {pathSlug}...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-[#58A6FF] hover:underline flex items-center gap-2 mb-4 text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#E6EDF3] mb-2">Topics for {pathSlug}</h1>
        </div>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#30363D] bg-[#0D1117]">
              <th className="px-4 py-3 text-sm font-semibold text-[#8B949E]">#</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#8B949E]">Title</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#8B949E]">Lvl</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#8B949E] text-center">Visualizer</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#8B949E] text-center">Content</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#8B949E] text-center">Published</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#8B949E]">Words</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#8B949E]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic, i) => (
              <tr key={topic.id} className="border-b border-[#30363D] hover:bg-[#21262D] transition-colors">
                <td className="px-4 py-3 text-[#8B949E]">{topic.orderIndex}</td>
                <td className="px-4 py-3 font-medium text-[#E6EDF3]">{topic.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full bg-[#30363D] text-[#E6EDF3]`}>
                    L{topic.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {topic.hasVisualizer ? (
                    <Settings className="inline text-[#58A6FF]" size={16} />
                  ) : (
                    <span className="text-[#8B949E]">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {topic.hasContent ? (
                    <Check className="inline text-[#3FB950]" size={16} />
                  ) : (
                    <X className="inline text-[#F85149]" size={16} />
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {topic.isPublished ? (
                    <Check className="inline text-[#3FB950]" size={16} />
                  ) : (
                    <X className="inline text-[#8B949E]" size={16} />
                  )}
                </td>
                <td className="px-4 py-3 text-[#8B949E] text-sm">
                  {topic.wordCount > 0 ? `${topic.wordCount}w` : '0'}
                </td>
                <td className="px-4 py-3">
                  <Link 
                    href={`/admin/topics/${topic.slug}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#238636] hover:bg-[#2EA043] text-white text-sm rounded-md transition-colors"
                  >
                    <PenTool size={14} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
