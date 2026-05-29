'use client';

import { useState, useEffect, useRef } from 'react';
import { useTopicStore, TabState } from '@/store/useTopicStore';
import { useAuthStore } from '@/store/useAuthStore';
import LessonNav from './LessonNav';
import { Bot, ChevronRight, Check, ChevronLeft, Loader2, Zap } from 'lucide-react';
import VisualizerShell from '../visualizer/VisualizerShell';
import CodeEditorShell from '@/components/code/CodeEditorShell';
import FeynmanCheckPanel from './FeynmanCheckPanel';
import BuildChallengePanel from './BuildChallengePanel';
import SpacedReviewWidget from './SpacedReviewWidget';
import { useAiChat } from '@/hooks/useAiChat';
import type { Topic } from '@/lib/api';
import { markLayerComplete } from '@/lib/api';

interface TopicPageProps {
  topicSlug:  string;
  topic:       Topic | null;
  MdxRenderer: React.ComponentType<{ source: string; className?: string }>;
}

export default function TopicPage({ topicSlug, topic, MdxRenderer }: TopicPageProps) {
  const { activeTab, isAiDrawerOpen, toggleAiDrawer, markTabCompleted } = useTopicStore();
  const { user } = useAuthStore();
  const { messages, sendMessage, isLoading: aiLoading } = useAiChat();
  const [chatInput, setChatInput]   = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [xpFlash, setXpFlash]       = useState(false);
  const startTime = useRef(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll AI chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset start timer when changing tabs
  useEffect(() => {
    startTime.current = Date.now();
  }, [activeTab]);

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      if (user) {
        await markLayerComplete(user.id, topicSlug, activeTab, timeSpent);
      }
      markTabCompleted(activeTab);
      setXpFlash(true);
      setTimeout(() => setXpFlash(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompleting(false);
    }
  };

  const renderContent = () => {
    if (!topic) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[--text-muted]">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm">Loading topic content...</span>
        </div>
      );
    }

    switch (activeTab as TabState) {
      case 'why':
        return <MdxRenderer source={topic.layers.why} />;
      case 'theory':
        return <MdxRenderer source={topic.layers.theory} />;
      case 'visualizer':
        return <VisualizerShell topicSlug={topicSlug} />;
      case 'code':
        return (
          <div className="h-full -m-6">
            <CodeEditorShell />
          </div>
        );
      case 'real-world':
        return <MdxRenderer source={topic.layers.realWorld} />;
      case 'interview':
        return <MdxRenderer source={topic.layers.interview} />;
      case 'feynman':
        return <FeynmanCheckPanel topicSlug={topicSlug} topicTitle={topic.title} />;
      case 'build':
        return <BuildChallengePanel buildContent={topic.layers.build} />;
      case 'spaced-review':
        return <SpacedReviewWidget topicSlug={topicSlug} spacedReviewContent={topic.layers.spacedReview} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-[--text-muted]">
            Content for {activeTab} is coming soon.
          </div>
        );
    }
  };

  const pathTitle = topic?.pathTitle || topicSlug;
  const topicTitle = topic?.title || topicSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* ── Left Sidebar: Topic Navigation ─────────────────── */}
      <LessonNav />

      {/* ── Main Content Area ──────────────────────────────── */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[--bg-primary]">

        {/* Topic Header Bar */}
        <div className="h-14 border-b border-[--border-default] flex items-center px-6 justify-between bg-[--bg-surface]/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center text-sm text-[--text-muted]">
            <span className="text-[--text-secondary]">{pathTitle}</span>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-[--text-primary] font-medium">{topicTitle}</span>
            {topic && (
              <span className="ml-3 text-xs bg-[--bg-elevated] border border-[--border-default] text-[--text-muted] px-2 py-0.5 rounded-full">
                Level {topic.level} · {topic.estimatedMins}min · {topic.xpReward}XP
              </span>
            )}
          </div>

          <button
            onClick={toggleAiDrawer}
            className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border border-indigo-500/20 hover:border-indigo-500/40"
          >
            <Bot size={15} />
            Ask AI
          </button>
        </div>

        {/* Dynamic Content Pane */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {renderContent()}
        </div>

        {/* Footer Navigation Bar */}
        <div className="h-16 border-t border-[--border-default] flex items-center justify-between px-6 bg-[--bg-surface]/50 backdrop-blur-sm shrink-0">
          <button className="flex items-center gap-2 text-sm text-[--text-muted] hover:text-[--text-primary] px-4 py-2 rounded-lg hover:bg-[--bg-elevated] transition-all">
            <ChevronLeft size={16} />
            Previous
          </button>

          {/* XP flash animation */}
          {xpFlash && (
            <div className="absolute bottom-20 right-32 flex items-center gap-1 text-[--accent-java] font-bold text-sm animate-bounce">
              <Zap size={16} />+{topic?.xpReward ?? 10} XP
            </div>
          )}

          <button
            onClick={handleMarkComplete}
            disabled={isCompleting}
            className="flex items-center gap-2 bg-[--accent-java] hover:brightness-110 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-lg shadow-[--accent-java]/20"
          >
            {isCompleting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isCompleting ? 'Saving...' : 'Mark Complete'}
          </button>
        </div>
      </div>

      {/* ── AI Bot Drawer ────────────────────────────────────── */}
      {isAiDrawerOpen && (
        <div className="w-80 border-l border-[--border-default] bg-[--bg-surface] flex flex-col shadow-2xl">
          <div className="h-14 border-b border-[--border-default] flex items-center px-4 justify-between bg-indigo-500/5 shrink-0">
            <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
              <Bot size={17} />
              Gemini AI Assistant
            </div>
            <button onClick={toggleAiDrawer} className="text-[--text-muted] hover:text-[--text-primary] transition-colors text-lg leading-none">
              ×
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-sm">
            {messages.length === 0 && (
              <div className="text-center text-[--text-muted] text-xs mt-8 px-4">
                <Bot size={28} className="mx-auto mb-2 opacity-40" />
                Ask any question about <strong className="text-[--text-secondary]">{topicTitle}</strong>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'ai'
                    ? 'bg-[--bg-elevated] text-[--text-secondary] border border-[--border-muted]'
                    : 'bg-indigo-500/15 text-indigo-100 border border-indigo-500/25 self-end ml-4'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-center gap-2 text-[--text-muted] text-xs p-3 bg-[--bg-elevated] rounded-xl w-fit">
                <Loader2 size={12} className="animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[--border-default] shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    sendMessage(chatInput);
                    setChatInput('');
                  }
                }}
                className="flex-1 bg-[--bg-elevated] border border-[--border-default] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-[--text-primary] placeholder:text-[--text-muted]"
              />
              <button
                onClick={() => { if (chatInput.trim()) { sendMessage(chatInput); setChatInput(''); } }}
                disabled={!chatInput.trim() || aiLoading}
                className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
