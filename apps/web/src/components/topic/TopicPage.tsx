'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTopicStore, TabState } from '@/store/useTopicStore';
import { useAuthStore } from '@/store/useAuthStore';
import LessonNav from './LessonNav';
import {
  Bot, ChevronRight, Check, ChevronLeft, Loader2, RefreshCw, AlertCircle,
  X, Send, Sparkles,
} from 'lucide-react';
import VisualizerShell from '../visualizer/VisualizerShell';
import { CodeEditorShell } from '@/components/code/CodeEditorShell';
import { CodeLayerView } from '@/components/code/CodeLayerView';
import FeynmanCheckPanel from './FeynmanCheckPanel';
import BuildChallengePanel from './BuildChallengePanel';
import SpacedReviewWidget from './SpacedReviewWidget';
import { MarkdownView } from './MarkdownView';
import { useAiChat } from '@/hooks/useAiChat';
import type { Topic } from '@/lib/api';
import { fetchTopic, markLayerComplete } from '@/lib/api';

const COLD_START_TIMEOUT_MS = 15_000;

interface TopicPageProps {
  topicSlug: string;
  pathSlug?: string;
  topic:     Topic | null;
}

export default function TopicPage({ topicSlug, pathSlug, topic: initialTopic }: TopicPageProps) {
  const { activeTab, isAiDrawerOpen, toggleAiDrawer, markTabCompleted, setCurrentTopic, completedTabs } = useTopicStore();
  const { user, token } = useAuthStore();
  const { messages, sendMessage, isLoading: aiLoading } = useAiChat({
    topicSlug,
    sectionType: activeTab,
  });
  const [chatInput, setChatInput] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [xpFlash, setXpFlash] = useState(false);
  const startTime = useRef(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Client-side fallback if SSR returned null (cold backend)
  const [topic, setTopic] = useState<Topic | null>(initialTopic);
  const [fetchError, setFetchError] = useState(false);
  const [waitingTooLong, setWaitingTooLong] = useState(false);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTopic = useCallback(async () => {
    setFetchError(false);
    setWaitingTooLong(false);
    try {
      const data = await fetchTopic(topicSlug);
      if (data) setTopic(data);
      else setFetchError(true);
    } catch {
      setFetchError(true);
    }
  }, [topicSlug]);

  useEffect(() => {
    // Tell the store which topic is active so completions are persisted per-topic.
    setCurrentTopic(topicSlug);
    if (initialTopic) { setTopic(initialTopic); return; }
    loadTopic();
    retryRef.current = setTimeout(() => setWaitingTooLong(true), COLD_START_TIMEOUT_MS);
    return () => { if (retryRef.current) clearTimeout(retryRef.current); };
  }, [topicSlug, initialTopic, loadTopic, setCurrentTopic]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { startTime.current = Date.now(); }, [activeTab]);

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      if (user) await markLayerComplete(user.id, topicSlug, activeTab, timeSpent, token);
      markTabCompleted(activeTab);
      setXpFlash(true);
      setTimeout(() => setXpFlash(false), 2000);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('devmastery:progress-update'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompleting(false);
    }
  };

  const renderContent = () => {
    if (!topic) {
      if (fetchError) {
        return (
          <div
            className="flex flex-col items-center justify-center h-full gap-4"
            style={{ color: 'var(--text-muted)' }}
          >
            <AlertCircle size={26} style={{ color: 'var(--error)' }} />
            <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Could not load topic content.
            </span>
            <button onClick={loadTopic} className="btn-ghost text-[13px] px-4 py-2">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        );
      }
      return (
        <div
          className="flex flex-col items-center justify-center h-full gap-3"
          style={{ color: 'var(--text-muted)' }}
        >
          <Loader2 className="animate-spin" size={26} style={{ color: 'var(--accent)' }} />
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Loading topic content…
          </span>
          {waitingTooLong && (
            <div className="mt-2 max-w-sm text-center space-y-1">
              <p className="text-[12px]" style={{ color: 'var(--warning)' }}>
                The backend is waking up from sleep.
              </p>
              <p className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
                This can take up to a minute on first visit. Subsequent loads will be instant.
              </p>
            </div>
          )}
        </div>
      );
    }

    switch (activeTab as TabState) {
      case 'why':          return <MarkdownView source={topic.layers.why} />;
      case 'theory':       return <MarkdownView source={topic.layers.theory} />;
      case 'visualizer':   return <VisualizerShell topicSlug={topicSlug} visualLayer={topic.layers.visual} />;
      case 'code':
        return (
          <div className="h-full">
            {topic.layers.code
              ? <CodeLayerView codeContent={topic.layers.code} language="java" />
              : (
                <div className="h-full -m-6">
                  <CodeEditorShell initialCode="// Write your code here…" languageString="java" />
                </div>
              )
            }
          </div>
        );
      case 'real-world':   return <MarkdownView source={topic.layers.realWorld} />;
      case 'interview':    return <MarkdownView source={topic.layers.interview} />;
      case 'feynman':      return <FeynmanCheckPanel topicSlug={topicSlug} topicTitle={topic.title} />;
      case 'build':        return <BuildChallengePanel buildContent={topic.layers.build} />;
      case 'spaced-review':return <SpacedReviewWidget topicSlug={topicSlug} spacedReviewContent={topic.layers.spacedReview} />;
      default:
        return (
          <div
            className="flex items-center justify-center h-full text-[13px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Content for {activeTab} is coming soon.
          </div>
        );
    }
  };

  const pathTitle  = topic?.pathTitle  || (pathSlug ? pathSlug.replace(/-/g, ' ') : '');
  const topicTitle = topic?.title      || topicSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    // Parent (LearnLayout) already reserves Topbar's h-14 (3.5rem).
    <div className="flex h-full w-full overflow-hidden">
      {/* ── Lesson layers nav ─────────────────────────────────────── */}
      <LessonNav />

      {/* ── Main pane ────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* Topic header */}
        <header
          className="h-12 flex items-center px-5 sm:px-6 justify-between shrink-0 border-b backdrop-blur-sm"
          style={{
            background: 'color-mix(in oklab, var(--bg-surface) 82%, transparent)',
            borderColor: 'var(--border-default)',
          }}
        >
          <nav
            className="flex items-center text-[12.5px] min-w-0"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Breadcrumb"
          >
            {pathSlug && (
              <Link
                href={`/learn/${pathSlug}/roadmap`}
                className="truncate capitalize transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {pathTitle}
              </Link>
            )}
            <ChevronRight size={12} className="mx-1.5 shrink-0" />
            <span className="truncate font-medium" style={{ color: 'var(--text-primary)' }}>
              {topicTitle}
            </span>
            {topic && (
              <span
                className="ml-3 hidden md:inline-flex items-center gap-2 text-[11px] px-2 py-0.5 rounded-full tabular-nums"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-muted)',
                }}
              >
                <span>L{topic.level}</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{topic.estimatedMins}m</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{topic.xpReward} XP</span>
              </span>
            )}
          </nav>

          <button
            onClick={toggleAiDrawer}
            className="flex items-center gap-1.5 text-[12.5px] font-medium px-2.5 py-1 rounded-md transition-colors"
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-ring)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <Sparkles size={13} />
            Ask AI
          </button>
        </header>

        {/* Content with futuristic shell */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 relative">
          <div className="absolute inset-0 bg-gradient-radial from-accent/5 to-transparent pointer-events-none opacity-50" />
          <div className="h-full relative z-10 animate-fade-up border border-transparent shadow-[0_0_15px_rgba(124,143,240,0.05)] rounded-2xl bg-surface/30 backdrop-blur-sm p-1">
             {renderContent()}
          </div>
        </div>

        {/* Footer nav */}
        <footer
          className="relative h-14 flex items-center justify-between px-5 sm:px-6 shrink-0 border-t"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <button
            className="btn-quiet text-[13px]"
            disabled
            title="Previous topic navigation coming soon"
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          {xpFlash && (
            <div className="absolute inset-x-0 bottom-full mb-4 flex justify-center animate-fade-up pointer-events-none z-50">
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-glow overflow-hidden relative"
                style={{
                  background: 'rgba(8, 10, 16, 0.95)',
                  border: '1px solid var(--accent)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 animate-shimmer" />
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <div className="relative z-10 flex flex-col">
                  <span className="text-[14px] font-bold text-white tracking-wide uppercase font-code drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                    Objective Complete
                  </span>
                  <span className="text-[12px] font-medium text-accent">
                    + {topic?.xpReward || 10} XP Rewarded
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleMarkComplete}
            disabled={isCompleting}
            className="btn-primary text-[13px] px-4 py-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCompleting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {isCompleting ? 'Saving…' : 'Mark complete'}
          </button>
        </footer>
      </div>

      {/* ── AI drawer ─────────────────────────────────────────────── */}
      {isAiDrawerOpen && (
        <aside
          className="w-[340px] shrink-0 flex flex-col border-l"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div
            className="h-12 flex items-center px-4 justify-between shrink-0 border-b"
            style={{ borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: 'var(--accent)' }}>
              <Bot size={14} strokeWidth={1.75} />
              AI mentor
            </div>
            <button
              onClick={toggleAiDrawer}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              aria-label="Close AI drawer"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5 text-[13px]">
            {messages.length === 0 && (
              <div className="text-center mt-8 px-4" style={{ color: 'var(--text-muted)' }}>
                <Bot size={22} className="mx-auto mb-2 opacity-50" />
                <p className="text-[12.5px]">
                  Ask anything about{' '}
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {topicTitle}
                  </span>.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded-md text-[13px] leading-relaxed"
                style={
                  msg.role === 'ai'
                    ? {
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-secondary)',
                      }
                    : {
                        background: 'var(--accent-soft)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        alignSelf: 'flex-end',
                        marginLeft: '2rem',
                      }
                }
              >
                {msg.content}
              </div>
            ))}
            {aiLoading && (
              <div
                className="flex items-center gap-2 text-[12px] px-3 py-2 rounded-md w-fit"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <Loader2 size={11} className="animate-spin" />
                Thinking…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            className="p-3 border-t shrink-0"
            style={{ borderColor: 'var(--border-default)' }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    sendMessage(chatInput);
                    setChatInput('');
                  }
                }}
                className="flex-1 rounded-md px-3 py-2 text-[13px] outline-none transition-all"
                style={{
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-ring)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={() => { if (chatInput.trim()) { sendMessage(chatInput); setChatInput(''); } }}
                disabled={!chatInput.trim() || aiLoading}
                className="btn-primary text-[13px] px-2.5 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
