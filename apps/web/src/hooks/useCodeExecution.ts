import { useState, useCallback } from 'react';

export interface CodeExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  message: string | null;
  statusId: number | null;
  statusDescription: string | null;
  time: number | null;
  memory: number | null;
  /** URL the user should visit to fix the error (e.g. RapidAPI subscription page). */
  actionUrl?: string | null;
}

export function useCodeExecution() {
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = useCallback(async (
    sourceCode: string,
    languageId: number,
    stdin?: string
  ) => {
    setIsExecuting(true);
    setResult(null);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode, languageId, stdin: stdin ?? '' }),
      });

      const data: CodeExecutionResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        stdout: null,
        stderr: null,
        compileOutput: null,
        message: err?.message ?? 'Failed to reach execution service. Check your connection.',
        statusId: 0,
        statusDescription: 'Connection Error',
        time: null,
        memory: null,
      });
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return { executeCode, result, isExecuting };
}
