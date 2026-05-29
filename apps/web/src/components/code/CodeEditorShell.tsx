'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Loader2, TerminalSquare, AlertCircle } from 'lucide-react';
import { useCodeExecution } from '@/hooks/useCodeExecution';

interface CodeEditorShellProps {
  initialCode: string;
  languageId?: number; // Default to Java (62 in Judge0)
  languageString?: string; // e.g. "java", "javascript"
}

// Map common languages to Judge0 IDs
const LANGUAGE_IDS: Record<string, number> = {
  'java': 62,
  'javascript': 63,
  'python': 71,
  'cpp': 54,
  'sql': 82,
};

export function CodeEditorShell({ initialCode, languageId, languageString = 'java' }: CodeEditorShellProps) {
  const [code, setCode] = useState(initialCode);
  const { executeCode, result, isExecuting } = useCodeExecution();

  const handleRun = () => {
    const id = languageId ?? LANGUAGE_IDS[languageString.toLowerCase()] ?? 62;
    executeCode(code, id);
  };

  return (
    <div className="flex flex-col border border-[--border-default] rounded-xl overflow-hidden bg-[--bg-surface]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[--bg-elevated] border-b border-[--border-default]">
        <div className="flex items-center gap-2">
          <TerminalSquare size={16} className="text-[--text-muted]" />
          <span className="text-xs font-semibold text-[--text-secondary] uppercase tracking-wider">{languageString} Editor</span>
        </div>
        <button
          onClick={handleRun}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[--accent-java] hover:bg-orange-500 text-white text-xs font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          Run Code
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="h-[400px]">
        <Editor
          height="100%"
          language={languageString}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
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
          loading={
            <div className="flex items-center justify-center h-full text-[--text-muted]">
              <Loader2 className="animate-spin mr-2" size={20} /> Loading editor...
            </div>
          }
        />
      </div>

      {/* Results Panel (Only shows if execution was triggered) */}
      {(result || isExecuting) && (
        <div className="border-t border-[--border-default] bg-[#1e1e1e]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333333]">
            <span className="text-xs font-semibold text-gray-300">Execution Output</span>
            {result?.time != null && (
              <span className="text-[10px] text-gray-500">{result.time}s • {result.memory}KB</span>
            )}
          </div>
          <div className="p-4 max-h-[250px] overflow-y-auto font-mono text-sm">
            {isExecuting ? (
              <div className="flex items-center text-gray-400">
                <Loader2 size={14} className="animate-spin mr-2" /> Executing on remote sandbox...
              </div>
            ) : result ? (
              <>
                {result.statusId === 3 ? ( // 3 = Accepted
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {result.stdout || 'Program exited cleanly with no output.'}
                  </div>
                ) : (
                  <div className="text-red-400 whitespace-pre-wrap">
                    <div className="flex items-center gap-2 mb-2 text-red-500 font-bold">
                      <AlertCircle size={16} /> {result.statusDescription || 'Error'}
                    </div>
                    {result.compileOutput || result.stderr || result.message || 'Unknown error occurred.'}
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
