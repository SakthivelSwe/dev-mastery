import { useState, useCallback } from 'react';
import { isBrowserLanguage } from '@/lib/execution/types';
import type { ExecutionResult } from '@/lib/execution/types';

/** @deprecated use ExecutionResult from lib/execution/types */
export type CodeExecutionResult = ExecutionResult;

export function useCodeExecution() {
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  /**
   * Execute code. `language` is a canonical string (e.g. "java", "python", "javascript").
   * JS / Python run in the browser; everything else is proxied to the server (Piston).
   *
   * The legacy `(source, numericLanguageId)` signature is still accepted for backwards
   * compatibility — the second arg is ignored when it isn't a string.
   */
  const executeCode = useCallback(async (
    sourceCode: string,
    language: string | number,
    stdin?: string,
  ) => {
    setIsExecuting(true);
    setResult(null);

    const lang = typeof language === 'string' ? language : legacyIdToLanguage(language);

    try {
      // 1) Browser-native languages — zero backend.
      if (isBrowserLanguage(lang)) {
        const { runInBrowser } = await import('@/lib/execution/browserRunner');
        const r = await runInBrowser(lang, sourceCode);
        setResult(r);
        return;
      }

      // 2) Everything else → Piston proxy.
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode, language: lang, stdin: stdin ?? '' }),
      });
      const data: ExecutionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        stdout: null,
        stderr: null,
        compileOutput: null,
        message: err?.message ?? 'Failed to execute code. Check your connection.',
        statusId: 0,
        statusDescription: 'Connection Error',
        time: null,
        memory: null,
        runtime: 'unavailable',
      });
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return { executeCode, result, isExecuting };
}

/** Convert legacy Judge0 numeric IDs to language strings — kept for old call sites. */
function legacyIdToLanguage(id: number): string {
  switch (id) {
    case 62: return 'java';
    case 63: return 'javascript';
    case 71: return 'python';
    case 54: return 'cpp';
    case 74: return 'typescript';
    case 78: return 'kotlin';
    case 60: return 'go';
    case 82: return 'sql';
    default: return 'java';
  }
}
