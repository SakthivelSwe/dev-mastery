'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/shell/Topbar';
import { Save, Bot, Loader2, LayoutTemplate } from 'lucide-react';
import Editor from '@monaco-editor/react';
import MdxRenderer from '@/components/topic/MdxRenderer';

export default function AdminEditorPage() {
  const [topicSlug, setTopicSlug] = useState('');
  const [pathSlug, setPathSlug] = useState('java-mastery');
  const [activeLayer, setActiveLayer] = useState('theory');
  const [mdxContent, setMdxContent] = useState('# New Topic\nStart writing here...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAiDraft = async () => {
    if (!topicSlug) {
      alert('Please enter a topic slug first (e.g., hashmap-internals)');
      return;
    }
    
    setIsGenerating(true);
    // Simulate AI generation via Gemini
    await new Promise(r => setTimeout(r, 2000));
    setMdxContent(`# ${topicSlug.replace(/-/g, ' ').toUpperCase()}\n\nHere is a generated draft for the ${activeLayer} layer.\n\n\`\`\`java\npublic class Example {\n  // AI generated code\n}\n\`\`\`\n`);
    setIsGenerating(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving to content-service
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    alert('Topic saved successfully!');
  };

  return (
    <div className="flex flex-col h-screen bg-[--bg-primary]">
      <Topbar />
      
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[--text-primary] flex items-center gap-2">
            <LayoutTemplate className="text-indigo-500" /> Content Studio
          </h1>
          <div className="flex gap-3">
            <button 
              onClick={handleAiDraft}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 border border-purple-500/20"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
              AI Assist Draft
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Publish Topic
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          
          {/* Editor Side */}
          <div className="bg-[--bg-surface] border border-[--border-default] rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[--border-default] bg-[#161b22] flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-[--text-muted] block mb-1">Path Slug</label>
                <select 
                  value={pathSlug}
                  onChange={(e) => setPathSlug(e.target.value)}
                  className="w-full bg-[--bg-elevated] border border-[--border-muted] rounded text-sm px-2 py-1 text-[--text-primary] focus:outline-none focus:border-indigo-500"
                >
                  <option value="java-mastery">Java Mastery</option>
                  <option value="spring-boot">Spring Boot</option>
                  <option value="dsa">Data Structures</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-[--text-muted] block mb-1">Topic Slug</label>
                <input 
                  type="text" 
                  value={topicSlug}
                  onChange={(e) => setTopicSlug(e.target.value)}
                  placeholder="e.g., hashmap-internals"
                  className="w-full bg-[--bg-elevated] border border-[--border-muted] rounded text-sm px-2 py-1 text-[--text-primary] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[--text-muted] block mb-1">Layer</label>
                <select 
                  value={activeLayer}
                  onChange={(e) => setActiveLayer(e.target.value)}
                  className="w-full bg-[--bg-elevated] border border-[--border-muted] rounded text-sm px-2 py-1 text-[--text-primary] focus:outline-none focus:border-indigo-500"
                >
                  <option value="why">Why it matters</option>
                  <option value="theory">Theory & Concepts</option>
                  <option value="real-world">Real World</option>
                  <option value="interview">Interview Prep</option>
                </select>
              </div>
            </div>
            <div className="flex-1 relative">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                theme="vs-dark"
                value={mdxContent}
                onChange={(value) => setMdxContent(value || '')}
                options={{ minimap: { enabled: false }, wordWrap: 'on', fontSize: 14 }}
              />
            </div>
          </div>

          {/* Preview Side */}
          <div className="bg-[--bg-primary] border border-[--border-default] rounded-xl overflow-y-auto p-8 prose prose-invert max-w-none">
            <MdxRenderer source={mdxContent} />
          </div>

        </div>
      </div>
    </div>
  );
}
