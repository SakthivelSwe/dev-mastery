'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, Loader2, TerminalSquare, AlertCircle, CheckCircle,
  ChevronRight, Lightbulb, Clock, Database, ChevronDown, ChevronUp,
  AlertTriangle, Info
} from 'lucide-react';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { LanguageSelector } from '../codelab/LanguageSelector';

// ─── Types ───────────────────────────────────────────────────────────────────
type Tier      = 'easy' | 'intermediate' | 'expert' | 'advanced';
type Language  = 'java' | 'python' | 'javascript' | 'cpp';
type OutputTab = 'output' | 'error' | 'info';

interface TierConfig {
  label:   string;
  xp:      number;
  color:   string;
  bg:      string;
  border:  string;
  ring:    string;
}

interface CodeExampleResponse {
  id:             string;
  topicSlug:      string;
  tier:           string;
  language:       string;
  title:          string;
  code:           string;
  explanation:    string;
  timeComplexity: string;
  spaceComplexity: string;
  tricks:         string[];
  patternName:    string;
}

interface CodeLabShellProps {
  topicSlug:    string;
  initialCode?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<Tier, TierConfig> = {
  easy:         { label: 'Easy',         xp: 10, color: 'text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20', ring: 'ring-emerald-500' },
  intermediate: { label: 'Intermediate', xp: 15, color: 'text-amber-400',   bg: 'bg-amber-500/10',    border: 'border-amber-500/20',   ring: 'ring-amber-500' },
  expert:       { label: 'Expert',       xp: 20, color: 'text-red-400',     bg: 'bg-red-500/10',      border: 'border-red-500/20',     ring: 'ring-red-500' },
  advanced:     { label: 'Advanced',     xp: 25, color: 'text-purple-400',  bg: 'bg-purple-500/10',   border: 'border-purple-500/20',  ring: 'ring-purple-500' },
};

const LANGUAGE_LABELS: Record<Language, string> = {
  java:       'Java',
  python:     'Python',
  javascript: 'JavaScript',
  cpp:        'C++',
};

const LANGUAGE_IDS: Record<Language, number> = {
  java:       62,
  python:     71,
  javascript: 63,
  cpp:        54,
};

const MONACO_LANG: Record<Language, string> = {
  java:       'java',
  python:     'python',
  javascript: 'javascript',
  cpp:        'cpp',
};

const API_BASE = process.env.NEXT_PUBLIC_CONTENT_API_URL ?? 'http://localhost:8082';

// ─── Loading skeleton for Monaco ─────────────────────────────────────────────
function EditorSkeleton() {
  return (
    <div className="h-full flex flex-col gap-3 p-4 animate-pulse bg-[#1e1e1e]">
      {[80, 60, 95, 50, 70, 45, 88].map((w, i) => (
        <div key={i} className="flex gap-3 items-center">
          <span className="text-xs text-gray-600 w-5 text-right shrink-0">{i + 1}</span>
          <div className="h-3 rounded bg-gray-700 opacity-40" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CodeLabShell({ topicSlug, initialCode }: CodeLabShellProps) {
  const [tier, setTier]                 = useState<Tier>('easy');
  const [language, setLanguage]         = useState<Language>('java');
  const [code, setCode]                 = useState(initialCode ?? '// Loading...');
  const [loading, setLoading]           = useState(false);
  const [example, setExample]           = useState<CodeExampleResponse | null>(null);
  const [availableLangs, setAvailLangs] = useState<Language[]>(['java']);
  const [outputTab, setOutputTab]       = useState<OutputTab>('output');
  const [judge0Warning, setJudge0Warn]  = useState(false);
  const [completedTiers, setCompleted]  = useState<Set<Tier>>(new Set());

  const { executeCode, result, isExecuting } = useCodeExecution();

  // ─── Fetch code from content-service ─────────────────────────────────────
  const fetchCode = useCallback(async (t: Tier, l: Language) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/topics/${topicSlug}/code?tier=${t}&lang=${l}`);

      if (res.status === 404) {
        // Language not yet available for this tier
        setCode(
          `// ${LANGUAGE_LABELS[l]} implementation for ${topicSlug} coming soon.\n` +
          `// Currently available: Java\n` +
          `// Click 'Request this language' below to upvote it.`
        );
        setExample(null);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: CodeExampleResponse = await res.json();
      setCode(data.code ?? '// No code available');
      setExample(data);
    } catch (err) {
      setCode(`// Failed to load code example.\n// Error: ${err instanceof Error ? err.message : 'Unknown'}`);
      setExample(null);
    } finally {
      setLoading(false);
    }
  }, [topicSlug]);

  // ─── Fetch available languages for current tier ───────────────────────────
  const fetchAvailLangs = useCallback(async (t: Tier) => {
    try {
      const res = await fetch(`${API_BASE}/v1/topics/${topicSlug}/code/languages?tier=${t}`);
      if (res.ok) {
        const langs: Language[] = await res.json();
        setAvailLangs(langs.length > 0 ? langs : ['java']);
      }
    } catch (_) {
      setAvailLangs(['java']);
    }
  }, [topicSlug]);

  // Fetch on mount (default: easy + java)
  useEffect(() => {
    fetchCode('easy', 'java');
    fetchAvailLangs('easy');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicSlug]);

  const handleTierChange = (t: Tier) => {
    setTier(t);
    fetchAvailLangs(t);
    fetchCode(t, language);
  };

  const handleLanguageChange = (l: Language) => {
    setLanguage(l);
    fetchCode(tier, l);
  };

  const handleRun = async () => {
    const langId = LANGUAGE_IDS[language];
    setJudge0Warn(false);
    setOutputTab('output');
    await executeCode(code, langId);
  };

  const tc = TIER_CONFIG[tier];

  return (
    <div className="flex flex-col h-full gap-0 border border-[--border-default] rounded-xl overflow-hidden bg-[--bg-surface]">

      {/* Judge0 warming up banner */}
      {judge0Warning && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs">
          <AlertTriangle size={14} />
          Code execution is warming up. Please wait a few seconds and try again.
        </div>
      )}

      {/* Tier Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-[--border-default] bg-[--bg-elevated]">
        {(Object.entries(TIER_CONFIG) as [Tier, TierConfig][]).map(([t, cfg]) => (
          <button
            key={t}
            onClick={() => handleTierChange(t)}
            className={`relative flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all ${
              tier === t
                ? `${cfg.color} border-current ${cfg.bg}`
                : 'text-[--text-muted] border-transparent hover:text-[--text-secondary]'
            }`}
          >
            {cfg.label}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cfg.bg} ${cfg.border} border`}>
              {cfg.xp} XP
            </span>
            {completedTiers.has(t) && (
              <CheckCircle size={12} className="text-emerald-400" />
            )}
          </button>
        ))}
      </div>

      {/* Language Selector */}
      <LanguageSelector
        selectedLanguage={language}
        availableLanguages={availableLangs}
        onLanguageChange={handleLanguageChange}
      />

      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
        <div className="flex items-center gap-2">
          <TerminalSquare size={14} className="text-gray-500" />
          <span className="text-xs text-gray-400 font-medium">
            {example?.title ?? `Solution.${language === 'java' ? 'java' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'js'}`}
          </span>
          {example?.patternName && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
              {example.patternName}
            </span>
          )}
        </div>
        <button
          onClick={handleRun}
          disabled={isExecuting || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors"
        >
          {isExecuting ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
          Run Code
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0" style={{ height: 360 }}>
        {loading ? (
          <EditorSkeleton />
        ) : (
          <Editor
            height="100%"
            language={MONACO_LANG[language]}
            theme="vs-dark"
            value={code}
            onChange={v => setCode(v ?? '')}
            onMount={(editor, monaco) => {
              editor.addAction({
                id: 'ask-ai',
                label: 'Ask AI about this line',
                contextMenuGroupId: 'navigation',
                contextMenuOrder: 1.5,
                run: (ed) => {
                  const position = ed.getPosition();
                  const lineContent = ed.getModel()?.getLineContent(position?.lineNumber || 1);
                  // Conceptually opens AiChatDrawer with this context
                  console.log(`Asking AI about line ${position?.lineNumber}: ${lineContent}`);
                  alert(`Asking AI about line ${position?.lineNumber}:\n\n${lineContent?.trim()}`);
                }
              });
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, monospace',
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              padding: { top: 16, bottom: 16 },
              overviewRulerLanes: 0,
              renderLineHighlight: 'all',
            }}
            loading={<EditorSkeleton />}
          />
        )}
      </div>

      {/* Output Panel */}
      {(result || isExecuting) && (
        <div className="border-t border-[--border-default] bg-[#1a1a1a] flex flex-col" style={{ maxHeight: 220 }}>
          {/* Output Tabs */}
          <div className="flex items-center gap-0 px-4 border-b border-[#333] bg-[#252526]">
            {(['output', 'error', 'info'] as OutputTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setOutputTab(tab)}
                className={`px-3 py-2 text-xs capitalize border-b-2 transition-all ${
                  outputTab === tab
                    ? 'border-blue-400 text-blue-300'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
                {tab === 'output' && result?.statusId === 3 && (
                  <span className="ml-1.5 px-1 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 rounded">Accepted</span>
                )}
                {tab === 'error' && result?.statusId !== 3 && result && (
                  <span className="ml-1.5 px-1 py-0.5 text-[9px] bg-red-500/20 text-red-400 rounded">Error</span>
                )}
              </button>
            ))}
            {result?.time && (
              <span className="ml-auto text-[10px] text-gray-600 pr-2">{result.time}s · {result.memory}KB</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {isExecuting ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 size={13} className="animate-spin" /> Running...
              </div>
            ) : result ? (
              outputTab === 'output' ? (
                <div className="text-gray-300 whitespace-pre-wrap">
                  {result.stdout || 'Program exited cleanly with no output.'}
                </div>
              ) : outputTab === 'error' ? (
                <div className="text-red-400 whitespace-pre-wrap">
                  {result.compileOutput || result.stderr || result.message || 'No errors.'}
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-xs">
                  <InfoRow icon={<Clock size={12} />} label="Execution time" value={`${result.time ?? '–'}s`} />
                  <InfoRow icon={<Database size={12} />} label="Memory used"  value={`${result.memory ?? '–'}KB`} />
                  <InfoRow icon={<Info size={12} />}  label="Language"      value={LANGUAGE_LABELS[language]} />
                  <InfoRow icon={<Info size={12} />}  label="Status"        value={result.statusDescription ?? '–'} />
                </div>
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <span className="text-gray-600">{icon}</span>
      <span className="w-28 text-gray-500">{label}:</span>
      <span className="text-gray-300 font-medium">{value}</span>
    </div>
  );
}
