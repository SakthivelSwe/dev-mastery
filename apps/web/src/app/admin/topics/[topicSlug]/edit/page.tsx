'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, Check, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { MarkdownView } from '@/components/topic/MarkdownView';

const SECTIONS = ['why', 'theory', 'visual', 'code', 'realworld', 'interview'];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface TopicData {
  id: string;
  title: string;
  slug: string;
  level: number;
  estimatedMins: number;
  hasVisualizer: boolean;
  hasCodeLab: boolean;
  isPublished: boolean;
  pathSlug: string;
  tags: string[];
  lessons: { sectionType: string; contentMdx: string }[];
}

export default function AdminTopicEditor({ params }: { params: Promise<{ topicSlug: string }> }) {
  const { topicSlug } = use(params);

  const [topic, setTopic] = useState<TopicData | null>(null);
  const [activeSection, setActiveSection] = useState<string>('why');
  const [content, setContent] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch topic
  useEffect(() => {
    fetch(`${API_BASE}/v1/topics/${topicSlug}`)
      .then(r => r.json())
      .then((data: TopicData) => {
        setTopic(data);
        const map: Record<string, string> = {};
        SECTIONS.forEach(sec => {
          const lesson = data.lessons?.find(l => l.sectionType === sec);
          map[sec] = lesson?.contentMdx ?? '';
        });
        setContent(map);
      })
      .catch(err => console.error('Failed to fetch topic:', err));
  }, [topicSlug]);

  // Auto-save every 10 s on change
  useEffect(() => {
    if (!topic) return;
    const t = setTimeout(handleSave, 10_000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleSave = async () => {
    if (!topic) return;
    setIsSaving(true);
    try {
      await fetch(`${API_BASE}/admin/topics/${topic.slug}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topic.title,
          slug: topic.slug,
          level: topic.level,
          estimatedMins: topic.estimatedMins,
          hasVisualizer: topic.hasVisualizer,
          hasCodeLab: topic.hasCodeLab,
          tags: topic.tags ?? [],
          sections: Object.keys(content).map(k => ({ sectionType: k, contentMdx: content[k] })),
        }),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save', err);
    } finally {
      setIsSaving(false);
    }
  };

  const generateAIAssist = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicSlug: topic.slug,
          topicTitle: topic.title,
          pathSlug: topic.pathSlug,
          level: topic.level,
          sectionType: activeSection,
        }),
      });
      const data = await res.json();
      if (data.content) setContent(prev => ({ ...prev, [activeSection]: data.content }));
    } catch (err) {
      console.error('AI generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!topic) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading editor…</span>
        </div>
      </div>
    );
  }

  const wordCount = (content[activeSection] ?? '').split(/\s+/).filter(Boolean).length;

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/paths/${topic.pathSlug}/topics`}
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[15px] font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
              {topic.title}
            </h1>
            <div className="flex gap-3 mt-0.5 text-[11.5px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
              <span>{topic.slug}</span>
              <span>L{topic.level}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
            {isSaving ? 'Saving…' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ''}
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-ring)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'; }}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </header>

      {/* ── SECTION TABS ────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center px-5 gap-1 border-b overflow-x-auto"
        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
      >
        {SECTIONS.map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className="px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap"
            style={{
              borderColor: activeSection === sec ? 'var(--accent)' : 'transparent',
              color: activeSection === sec ? 'var(--text-primary)' : 'var(--text-muted)',
              background: 'transparent',
            }}
            onMouseEnter={e => { if (activeSection !== sec) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { if (activeSection !== sec) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            {sec}
          </button>
        ))}
        <div className="ml-auto pl-4">
          <button
            onClick={generateAIAssist}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {isGenerating ? 'Generating…' : 'AI Assist'}
          </button>
        </div>
      </div>

      {/* ── EDITOR + PREVIEW ─────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">

        {/* Editor — 60% */}
        <div className="w-[60%] flex flex-col border-r" style={{ borderColor: 'var(--border-default)' }}>
          <div
            className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 border-b text-[11px]"
            style={{
              background: 'var(--bg-inset)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-code)',
            }}
          >
            <span>{activeSection}.mdx</span>
            <span>{wordCount} words</span>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language="markdown"
              value={content[activeSection] ?? ''}
              onChange={val => setContent(prev => ({ ...prev, [activeSection]: val ?? '' }))}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'off',
                padding: { top: 16 },
                fontSize: 13.5,
                fontFamily: 'var(--font-code)',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Preview — 40% */}
        <div className="w-[40%] flex flex-col" style={{ background: 'var(--bg-primary)' }}>
          <div
            className="flex-shrink-0 px-4 py-1.5 border-b text-[11px]"
            style={{
              background: 'var(--bg-inset)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-code)',
            }}
          >
            LIVE PREVIEW
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {(content[activeSection] ?? '').trim() ? (
              <MarkdownView source={content[activeSection]} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  Start typing or click AI Assist to generate content…
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
