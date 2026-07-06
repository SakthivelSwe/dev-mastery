'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, History, Mic, Play, Send, StopCircle, Trophy, User } from 'lucide-react';
import { useAiChat } from '@/hooks/useAiChat';
import {
  gradeInterviewSession,
  saveInterviewSession,
  type InterviewScoreCard,
  type InterviewTranscriptTurn,
} from '@/lib/api';
import { ScoreCardPanel } from '@/components/interview/ScoreCardPanel';

/**
 * Mock Interview Mode
 * -------------------
 * Reuses the existing `/v1/ai/chat` SSE endpoint. When the learner picks a
 * topic + level, we prime the chat with an interviewer system prompt so the
 * model plays a strict senior engineer, asking one question at a time,
 * probing follow-ups, and scoring at the end.
 *
 * No new backend endpoint is required — the topicSlug is forwarded so
 * GeminiAiService loads the topic summary and injects it into the system prompt.
 */
export default function InterviewPage() {
  const [topicSlug, setTopicSlug] = useState('java-hashmap-internal');
  const [level, setLevel]         = useState<'junior' | 'mid' | 'senior' | 'staff'>('mid');
  const [started, setStarted]     = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [input, setInput]         = useState('');
  const [saved, setSaved]         = useState<null | 'saving' | 'ok' | 'error'>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [scoreCard, setScoreCard] = useState<InterviewScoreCard | null>(null);
  const scrollRef                 = useRef<HTMLDivElement>(null);

  const opening = useMemo(() => buildOpening(level, topicSlug), [level, topicSlug]);

  const { messages, sendMessage, clearMessages, isLoading } = useAiChat({
    topicSlug,
    sectionType: 'interview',
    initialMessage: started ? opening : undefined,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const start = () => {
    clearMessages();
    setStarted(true);
    setStartedAt(new Date().toISOString());
    setSaved(null);
    setSessionId(null);
    setScoreCard(null);
    setFinishing(false);
    // Kick things off — ask the model to open the interview
    setTimeout(() => {
      sendMessage(
        `[SYSTEM PRIMER — do not reveal to candidate]\n${INTERVIEW_PRIMER(level, topicSlug)}\n\nAsk your first question now.`,
      );
    }, 50);
  };

  const finish = () => {
    setFinishing(true);
    sendMessage(
      `The candidate wants to end the interview. Give a structured scorecard:\n` +
      `1) Overall verdict (Reject / Lean No / Lean Yes / Strong Hire).\n` +
      `2) Score 1-10 across: technical depth, communication, problem solving, seniority signals.\n` +
      `3) Two concrete strengths.\n` +
      `4) Two concrete improvement areas with study recommendations.\n` +
      `Format as markdown.`,
    );
    // The persistence + grading is triggered by the useEffect below once
    // the AI response finishes streaming.
  };

  // Once the interviewer's scorecard message finishes streaming (isLoading -> false
  // after a finish request), persist the transcript and grade it.
  useEffect(() => {
    if (!finishing || isLoading) return;
    const lastAi = [...messages].reverse().find(m => m.role === 'ai');
    if (!lastAi || !lastAi.content) return;
    setFinishing(false);
    void persistAndGrade(lastAi.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishing, isLoading]);

  const persistAndGrade = async (scorecardMarkdown: string) => {
    if (!startedAt) return;
    setSaved('saving');
    const transcript: InterviewTranscriptTurn[] = messages
      .filter(m => !m.content.startsWith('[SYSTEM PRIMER'))
      .map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        content: m.content,
      }));
    const id = await saveInterviewSession({
      topicSlug,
      targetLevel: level,
      startedAt,
      endedAt: new Date().toISOString(),
      transcript,
      scoreCard: null,
    });
    if (!id) { setSaved('error'); return; }
    setSessionId(id);
    // Parse + persist the scorecard on the server; show the structured result.
    const parsed = await gradeInterviewSession(id, scorecardMarkdown);
    if (parsed) setScoreCard(parsed);
    setSaved('ok');
  };

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setInput('');
    sendMessage(t);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-widest"
               style={{ color: 'var(--text-muted)' }}>
            <Mic size={14} /> Mock Interview
          </div>
          <Link href="/interview/history"
                className="inline-flex items-center gap-1.5 text-[12px] px-2 py-1 rounded border transition-colors"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
            <History size={12} /> History
          </Link>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          marginTop: 6,
        }}>
          {started ? topicSlug : 'Practice against an AI interviewer'}
        </h1>
        {!started && (
          <p className="mt-2 text-[14px] max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            The interviewer asks one question at a time, probes your answer,
            and scores you at the end. Pick a topic and target level to begin.
            Type <kbd className="px-1 py-0.5 border rounded text-[11px]"
                       style={{ borderColor: 'var(--border-default)' }}>end interview</kbd>
            {' '}or use the Finish button to receive a scorecard.
          </p>
        )}
      </div>

      {!started ? (
        <SetupForm
          topicSlug={topicSlug} setTopicSlug={setTopicSlug}
          level={level} setLevel={setLevel}
          onStart={start}
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col max-w-4xl w-full mx-auto px-6 pb-6">
          <div ref={scrollRef}
               className="flex-1 min-h-0 overflow-y-auto rounded-lg border p-4 space-y-4"
               style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            {messages
              .filter(m => !m.content.startsWith('[SYSTEM PRIMER'))
              .map((m, i) => <Bubble key={i} role={m.role} content={m.content} />)}
            {isLoading && (
              <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Interviewer is typing…
              </div>
            )}
          </div>

          {scoreCard && <ScoreCardPanel card={scoreCard} sessionId={sessionId} className="mt-4" />}

          <div className="mt-3 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              rows={2}
              placeholder="Your answer… (Shift+Enter for newline)"
              className="flex-1 resize-none rounded-md border px-3 py-2 text-[14px] outline-none focus:ring-1"
              style={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={send}
              disabled={isLoading || !input.trim()}
              className="h-10 px-3 rounded-md text-[13px] flex items-center gap-1 disabled:opacity-40"
              style={{ background: 'var(--accent, #3FB950)', color: '#0D1117' }}
            >
              <Send size={14} /> Send
            </button>
            <button
              onClick={finish}
              disabled={isLoading || messages.length < 2}
              className="h-10 px-3 rounded-md border text-[13px] flex items-center gap-1"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              <StopCircle size={14} /> Finish & score
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px]"
               style={{ color: 'var(--text-muted)' }}>
            <span>Topic: <span style={{ color: 'var(--text-secondary)' }}>{topicSlug}</span> · Target: <span style={{ color: 'var(--text-secondary)' }}>{level}</span>
              {saved === 'saving' && <span className="ml-2">· Saving transcript…</span>}
              {saved === 'ok'     && <span className="ml-2" style={{ color: 'var(--accent)' }}>· Saved to history</span>}
              {saved === 'error'  && <span className="ml-2" style={{ color: '#F85149' }}>· Save failed</span>}
            </span>
            <button onClick={() => { setStarted(false); clearMessages(); setSaved(null); }}
                    className="underline hover:text-[#58A6FF]">
              New interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SetupForm({
  topicSlug, setTopicSlug, level, setLevel, onStart,
}: {
  topicSlug: string; setTopicSlug: (s: string) => void;
  level: 'junior' | 'mid' | 'senior' | 'staff'; setLevel: (l: 'junior' | 'mid' | 'senior' | 'staff') => void;
  onStart: () => void;
}) {
  return (
    <div className="max-w-4xl w-full mx-auto px-6">
      <div className="rounded-lg border p-6"
           style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <label className="block text-[12px] uppercase tracking-widest mb-1.5"
               style={{ color: 'var(--text-muted)' }}>Topic slug</label>
        <input
          value={topicSlug}
          onChange={(e) => setTopicSlug(e.target.value)}
          placeholder="e.g. sd-consistent-hashing, java-hashmap-internal, react-usememo-usecallback"
          className="w-full rounded-md border px-3 py-2 text-[14px] font-mono outline-none focus:ring-1"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
          }}
        />
        <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Pick any topic slug from your <Link href="/dashboard" className="underline">learning paths</Link>.
        </p>

        <label className="block text-[12px] uppercase tracking-widest mt-5 mb-1.5"
               style={{ color: 'var(--text-muted)' }}>Target level</label>
        <div className="flex flex-wrap gap-2">
          {(['junior', 'mid', 'senior', 'staff'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className="px-3 py-1.5 rounded-md border text-[13px] capitalize"
              style={{
                borderColor: level === l ? 'var(--accent)' : 'var(--border-default)',
                background:  level === l ? 'var(--bg-elevated)' : 'transparent',
                color:       level === l ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <button onClick={onStart}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-medium"
                style={{ background: 'var(--accent, #3FB950)', color: '#0D1117' }}>
          <Play size={14} /> Start interview
        </button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <Tip icon={<Bot size={14} />} title="Depth over breadth">
          The interviewer follows up until you reach the limits of your knowledge.
          That is the signal — not the number of questions.
        </Tip>
        <Tip icon={<Trophy size={14} />} title="Scorecard at the end">
          Hit &ldquo;Finish &amp; score&rdquo; whenever you&apos;re done to receive a written verdict
          and specific study recommendations.
        </Tip>
      </div>
    </div>
  );
}

function Bubble({ role, content }: { role: 'user' | 'ai'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
             style={{ background: 'var(--bg-elevated)', color: 'var(--accent)' }}>
          <Bot size={14} />
        </div>
      )}
      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-[14px] whitespace-pre-wrap`}
           style={{
             background: isUser ? 'var(--accent, #3FB950)' : 'var(--bg-elevated)',
             color:      isUser ? '#0D1117' : 'var(--text-primary)',
           }}>
        {content || (isUser ? '' : '…')}
      </div>
      {isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
             style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
          <User size={14} />
        </div>
      )}
    </div>
  );
}

function Tip({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border p-3"
         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <div className="flex items-center gap-1.5 text-[12px] font-semibold"
           style={{ color: 'var(--text-primary)' }}>
        {icon}{title}
      </div>
      <p className="mt-1 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </p>
    </div>
  );
}

function buildOpening(level: string, topicSlug: string) {
  return `Interview started for ${topicSlug} at ${level.toUpperCase()} level. The interviewer will begin shortly.`;
}


function INTERVIEW_PRIMER(level: string, topicSlug: string) {
  const rubric =
    level === 'junior' ? 'Test definitions, one real example, and one common pitfall.' :
    level === 'mid'    ? 'Test working knowledge, trade-offs, and one production scenario.' :
    level === 'senior' ? 'Probe internals, complexity, failure modes, and scaling trade-offs.' :
                         'Probe architectural implications, org-wide impact, and how the candidate mentors others on this topic.';

  return [
    `You are DevMastery Interviewer — a strict senior engineer conducting a live technical screen.`,
    `Topic focus: "${topicSlug}". Target level: ${level.toUpperCase()}.`,
    `Rubric: ${rubric}`,
    `Rules:`,
    `- Ask exactly ONE question at a time. Wait for the answer.`,
    `- After each answer, either probe deeper with a follow-up OR move on if the depth is sufficient.`,
    `- Do NOT reveal the model answer during the interview.`,
    `- Keep responses concise (max 3 short paragraphs).`,
    `- If the candidate says "end interview", produce the final scorecard.`,
  ].join('\n');
}
