'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, Send, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { MDXRemote } from 'next-mdx-remote';

const SECTIONS = ['why', 'theory', 'visual', 'code', 'realworld', 'interview'];

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
  lessons: {
    sectionType: string;
    contentMdx: string;
  }[];
}

export default function AdminTopicEditor({ params }: { params: Promise<{ topicSlug: string }> }) {
  const { topicSlug } = use(params);
  
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [activeSection, setActiveSection] = useState<string>('why');
  const [content, setContent] = useState<Record<string, string>>({});
  const [serializedMdx, setSerializedMdx] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch topic data
  useEffect(() => {
    fetch(`http://localhost:8082/v1/topics/${topicSlug}`)
      .then((res) => res.json())
      .then((data: TopicData) => {
        setTopic(data);
        const contentMap: Record<string, string> = {};
        SECTIONS.forEach(sec => {
          const lesson = data.lessons?.find(l => l.sectionType === sec);
          contentMap[sec] = lesson ? lesson.contentMdx : '';
        });
        setContent(contentMap);
      })
      .catch((err) => console.error('Failed to fetch topic:', err));
  }, [topicSlug]);

  // Handle MDX Serialization for Preview
  useEffect(() => {
    const currentText = content[activeSection] || '';
    if (!currentText.trim()) {
      setSerializedMdx(null);
      return;
    }
    const timer = setTimeout(() => {
      fetch('/api/admin/mdx-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mdxSource: currentText })
      })
        .then(res => res.json())
        .then(data => {
          if (data.serialized) setSerializedMdx(data.serialized);
        })
        .catch(err => console.error('MDX serialization failed', err));
    }, 500); // debounce preview
    return () => clearTimeout(timer);
  }, [content, activeSection]);

  // Handle Auto-save
  useEffect(() => {
    if (!topic) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 10000); // auto-save every 10s if changed
    return () => clearTimeout(timer);
  }, [content]);

  const handleSave = async () => {
    if (!topic) return;
    setIsSaving(true);
    try {
      await fetch(`http://localhost:8082/admin/topics/${topic.slug}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topic.title,
          slug: topic.slug,
          level: topic.level,
          estimatedMins: topic.estimatedMins,
          hasVisualizer: topic.hasVisualizer,
          hasCodeLab: topic.hasCodeLab,
          tags: topic.tags || [],
          sections: Object.keys(content).map(key => ({
            sectionType: key,
            contentMdx: content[key]
          }))
        })
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save', error);
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
          sectionType: activeSection
        })
      });
      const data = await res.json();
      if (data.content) {
        setContent(prev => ({
          ...prev,
          [activeSection]: data.content
        }));
      }
    } catch (error) {
      console.error('AI generation failed', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!topic) {
    return <div className="p-8 text-[#8B949E]">Loading Editor...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0D1117] font-sans">
      {/* TOP BAR */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#30363D] bg-[#161B22]">
        <div className="flex items-center gap-4">
          <Link href={`/admin/paths/${topic.pathSlug}/topics`} className="text-[#8B949E] hover:text-[#58A6FF]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#E6EDF3]">{topic.title}</h1>
            <div className="text-sm text-[#8B949E] mt-1 flex gap-4">
              <span>Slug: {topic.slug}</span>
              <span>Level: {topic.level}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-[#8B949E] flex items-center gap-1">
            {isSaving ? 'Saving...' : lastSaved ? <><Check size={14}/> Saved at {lastSaved.toLocaleTimeString()}</> : ''}
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-md text-[#E6EDF3] text-sm"
          >
            <Save size={16} /> Save Now
          </button>
        </div>
      </div>

      {/* SECTION TABS */}
      <div className="flex-shrink-0 flex items-center px-6 border-b border-[#30363D] bg-[#0D1117]">
        {SECTIONS.map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeSection === sec 
                ? 'border-[#58A6FF] text-[#E6EDF3]' 
                : 'border-transparent text-[#8B949E] hover:text-[#E6EDF3]'
            }`}
          >
            {sec}
          </button>
        ))}
        <div className="ml-auto">
          <button 
            onClick={generateAIAssist}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white text-sm rounded-md font-medium shadow-sm disabled:opacity-50"
          >
            <Sparkles size={16} />
            {isGenerating ? 'Generating...' : 'AI Assist'}
          </button>
        </div>
      </div>

      {/* TWO PANEL LAYOUT */}
      <div className="flex-1 flex min-h-0">
        {/* EDITOR (60%) */}
        <div className="w-[60%] border-r border-[#30363D] flex flex-col">
          <div className="bg-[#161B22] border-b border-[#30363D] px-4 py-2 text-xs font-mono text-[#8B949E] flex justify-between">
            <span>{activeSection.toUpperCase()}.mdx</span>
            <span>Words: {(content[activeSection] || '').split(/\s+/).filter(Boolean).length}</span>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language="markdown"
              value={content[activeSection] || ''}
              onChange={(val) => setContent(prev => ({ ...prev, [activeSection]: val || '' }))}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'off',
                padding: { top: 16 },
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            />
          </div>
        </div>

        {/* PREVIEW (40%) */}
        <div className="w-[40%] flex flex-col bg-[#0D1117]">
          <div className="bg-[#161B22] border-b border-[#30363D] px-4 py-2 text-xs font-mono text-[#8B949E]">
            LIVE PREVIEW
          </div>
          <div className="flex-1 overflow-y-auto p-8 prose prose-invert prose-blue max-w-none">
            {serializedMdx ? (
              <MDXRemote {...serializedMdx} />
            ) : (
              <div className="text-center text-[#8B949E] mt-20">
                <p>Start typing in the editor to see preview...</p>
                <p className="text-sm mt-2">Or click "AI Assist" to generate draft content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
