'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Loader2, TerminalSquare, AlertCircle, CheckCircle2, Clock, Cpu, ExternalLink } from 'lucide-react';
import { useCodeExecution } from '@/hooks/useCodeExecution';

interface CodeEditorShellProps {
  initialCode: string;
  languageId?: number;
  languageString?: string;
}

const LANGUAGE_IDS: Record<string, number> = {
  java: 62,
  javascript: 63,
  python: 71,
  cpp: 54,
  sql: 82,
  typescript: 74,
  kotlin: 78,
  go: 60,
};

const STATUS_SUCCESS = 3; // Judge0: Accepted
const STATUS_NOT_CONFIGURED = 0;

export function CodeEditorShell({ initialCode, languageId, languageString = 'java' }: CodeEditorShellProps) {
  const [code, setCode] = useState(initialCode);
  const { executeCode, result, isExecuting } = useCodeExecution();

  const lang = languageString.toLowerCase();
  const runsInBrowser = lang === 'javascript' || lang === 'python';

  const handleRun = () => {
    // Prefer the language string; fall back to the legacy numeric ID if that's all we have.
    executeCode(code, lang || languageId || 'java');
  };

  const isSuccess     = result?.statusId === STATUS_SUCCESS;
  const isNotConfig   = result?.statusId === STATUS_NOT_CONFIGURED && result?.statusDescription === 'Not Configured';
  const isUnavailable = result?.statusId === STATUS_NOT_CONFIGURED &&
    (result?.statusDescription === 'Unavailable' || result?.statusDescription === 'Runtime Not Deployed');
  const isConnErr     = result?.statusDescription === 'Connection Error' || result?.statusDescription === 'Timeout' || result?.statusDescription === 'Cold Start';

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        border: '1px solid var(--border-default)',
        borderRadius: '14px',
        background: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Traffic-light dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="w-px h-3.5" style={{ background: 'var(--border-default)' }} />
          <TerminalSquare size={14} style={{ color: 'var(--text-muted)' }} />
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-code)' }}
          >
            {languageString.toUpperCase()} EDITOR
          </span>
          {runsInBrowser && (
            <span
              className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ml-1"
              style={{
                background: 'rgba(98, 201, 122, 0.12)',
                color: '#62C97A',
                border: '1px solid rgba(98, 201, 122, 0.3)',
                fontFamily: 'var(--font-code)',
              }}
              title="Runs securely in your browser — no server round-trip"
            >
              ⚡ Runs in browser
            </span>
          )}
        </div>

        <button
          onClick={handleRun}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-bold rounded-lg transition-all duration-200"
          style={{
            background: isExecuting ? 'var(--bg-inset)' : 'var(--gradient-accent)',
            color: isExecuting ? 'var(--text-muted)' : '#08090F',
            border: isExecuting ? '1px solid var(--border-default)' : 'none',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            boxShadow: isExecuting ? 'none' : '0 2px 8px var(--accent-glow)',
          }}
          onMouseEnter={(e) => {
            if (!isExecuting) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.filter = '';
          }}
        >
          {isExecuting
            ? <><Loader2 size={13} className="animate-spin" /> Running…</>
            : <><Play size={13} fill="currentColor" /> Run Code</>
          }
        </button>
      </div>

      {/* ── Monaco Editor ── */}
      <div className="h-[380px]">
        <Editor
          height="100%"
          language={languageString}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13.5,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', monospace",
            fontLigatures: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            overviewRulerLanes: 0,
            renderLineHighlight: 'all',
            lineNumbersMinChars: 3,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
          }}
          loading={
            <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin mr-2" size={18} />
              <span className="text-[13px]">Loading editor…</span>
            </div>
          }
        />
      </div>

      {/* ── Output Panel ── */}
      {(result || isExecuting) && (
        <div style={{ borderTop: '1px solid var(--border-default)', background: '#0d1117' }}>
          {/* Output header */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[10.5px] font-bold uppercase tracking-widest"
                style={{ color: '#8b949e', fontFamily: 'var(--font-code)' }}
              >
                Execution Output
              </span>
              {result && !isExecuting && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: isSuccess
                      ? 'rgba(98, 201, 122, 0.15)'
                      : 'rgba(224, 112, 112, 0.15)',
                    color: isSuccess ? '#62C97A' : '#E07070',
                    border: `1px solid ${isSuccess ? 'rgba(98,201,122,0.3)' : 'rgba(224,112,112,0.3)'}`,
                  }}
                >
                  {isSuccess
                    ? <><CheckCircle2 size={9} /> Accepted</>
                    : <><AlertCircle size={9} /> {result.statusDescription}</>
                  }
                </span>
              )}
            </div>
            {result?.time != null && (
              <div className="flex items-center gap-3" style={{ color: '#8b949e' }}>
                <span className="flex items-center gap-1 text-[10px]">
                  <Clock size={10} /> {result.time}s
                </span>
                {result.memory != null && (
                  <span className="flex items-center gap-1 text-[10px]">
                    <Cpu size={10} /> {result.memory} KB
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Output content */}
          <div className="p-4 max-h-[220px] overflow-y-auto font-mono text-[13px]">
            {isExecuting ? (
              <div className="flex items-center gap-2" style={{ color: '#8b949e' }}>
                <Loader2 size={14} className="animate-spin" />
                <span>Executing on sandbox…</span>
              </div>
            ) : result ? (
              <>
                {isNotConfig ? (
                  /* Not configured state */
                  <div
                    className="rounded-lg p-4"
                    style={{
                      background: 'rgba(124,143,240,0.07)',
                      border: '1px solid rgba(124,143,240,0.2)',
                    }}
                  >
                    <p className="text-[12.5px] font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                      ⚡ Code execution not configured
                    </p>
                    <p className="text-[12px] mb-3" style={{ color: '#8b949e' }}>
                      To enable code execution, add your free Judge0 API key to the environment:
                    </p>
                    <pre
                      className="text-[11px] rounded p-3 mb-3"
                      style={{ background: 'rgba(0,0,0,0.4)', color: '#62C97A' }}
                    >{`# .env.local  (local)  OR  Cloudflare Pages → Environment Variables  (prod)
# Same 3 vars — identical config for both environments:
JUDGE0_API_URL=https://judge029.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
JUDGE0_API_HOST=judge029.p.rapidapi.com`}</pre>
                    <a
                      href="https://rapidapi.com/dishis-technologies-judge0/api/judge029"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold"
                      style={{ color: 'var(--accent)' }}
                    >
                      <ExternalLink size={11} /> Get free API key on RapidAPI →
                    </a>
                  </div>
                ) : isSuccess ? (
                  <div style={{ color: '#e6edf3', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {result.stdout || (
                      <span style={{ color: '#8b949e', fontStyle: 'italic' }}>
                        Program completed with no output.
                      </span>
                    )}
                  </div>
                ) : isUnavailable ? (
                  /* Piston not deployed yet — point to self-hosting docs */
                  <div
                    className="rounded-lg p-4"
                    style={{
                      background: 'rgba(124, 143, 240, 0.07)',
                      border: '1px solid rgba(124, 143, 240, 0.25)',
                    }}
                  >
                    <p className="text-[12.5px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                      <AlertCircle size={13} /> Server-side runtime not deployed
                    </p>
                    <p className="text-[12px] mb-3" style={{ color: '#c9d1d9', lineHeight: 1.6 }}>
                      {result.message}
                    </p>
                    <p className="text-[11.5px] mb-3" style={{ color: '#8b949e', lineHeight: 1.6 }}>
                      <b style={{ color: '#c9d1d9' }}>Good news:</b> JavaScript and Python already run instantly right here in your browser — zero infrastructure needed. For compiled languages ({lang}), deploy the open-source Piston sandbox once and set the <code style={{ color: '#62C97A' }}>PISTON_URL</code> environment variable. Free forever, no API keys.
                    </p>
                    {result.actionUrl && (
                      <a
                        href={result.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-md transition-all"
                        style={{
                          background: 'rgba(124, 143, 240, 0.15)',
                          border: '1px solid rgba(124, 143, 240, 0.4)',
                          color: 'var(--accent)',
                        }}
                      >
                        <ExternalLink size={12} /> How to deploy Piston (5 min)
                      </a>
                    )}
                  </div>
                ) : (
                  <div>
                    {result.compileOutput && (
                      <div style={{ color: '#ffa657', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#8b949e' }}>
                          Compile Output
                        </span>
                        {result.compileOutput}
                      </div>
                    )}
                    {result.stderr && (
                      <div style={{ color: '#f85149', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#8b949e' }}>
                          Standard Error
                        </span>
                        {result.stderr}
                      </div>
                    )}
                    {result.stdout && (
                      <div style={{ color: '#e6edf3', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                        <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: '#8b949e' }}>
                          Standard Output
                        </span>
                        {result.stdout}
                      </div>
                    )}
                    {result.message && (
                      <div
                        className="flex items-start gap-2 mt-2"
                        style={{ color: isConnErr ? '#f85149' : '#8b949e' }}
                      >
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span style={{ whiteSpace: 'pre-wrap' }}>{result.message}</span>
                      </div>
                    )}
                    {!result.compileOutput && !result.stderr && !result.stdout && !result.message && (
                      <span style={{ color: '#8b949e' }}>
                        {result.statusDescription || 'Unknown error occurred.'}
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
