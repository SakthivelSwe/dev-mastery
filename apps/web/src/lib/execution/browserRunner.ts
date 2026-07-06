/**
 * Client-side code execution — runs in the user's browser with zero backend cost.
 *
 *  • JavaScript → sandboxed Web Worker, captures console.log / errors
 *  • Python     → Pyodide (CPython compiled to WebAssembly), loaded on-demand from CDN
 *
 * No API keys, no rate limits, no subscriptions.
 */

import type { ExecutionResult } from './types';

// ─── Pyodide loader (memoised) ──────────────────────────────────────────────
// Pyodide is loaded exactly once per browser session and cached.
declare global {
  interface Window { loadPyodide?: (opts?: any) => Promise<any>; }
}

let pyodidePromise: Promise<any> | null = null;
const PYODIDE_VERSION = 'v0.26.2';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

function loadPyodideOnce(): Promise<any> {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Pyodide can only be loaded in the browser'));
    }
    if (window.loadPyodide) {
      window.loadPyodide({ indexURL: PYODIDE_INDEX_URL }).then(resolve).catch(reject);
      return;
    }
    const script = document.createElement('script');
    script.src = `${PYODIDE_INDEX_URL}pyodide.js`;
    script.async = true;
    script.onload = () => {
      if (!window.loadPyodide) return reject(new Error('Pyodide script loaded but loadPyodide is undefined'));
      window.loadPyodide({ indexURL: PYODIDE_INDEX_URL }).then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error('Failed to download Pyodide from CDN'));
    document.head.appendChild(script);
  });

  // If it fails, allow a retry next time.
  pyodidePromise.catch(() => { pyodidePromise = null; });
  return pyodidePromise;
}

// ─── Python runner ───────────────────────────────────────────────────────────

async function runPython(source: string): Promise<ExecutionResult> {
  const t0 = performance.now();
  try {
    const pyodide = await loadPyodideOnce();

    // Capture stdout / stderr via Pyodide's own hooks.
    const stdoutBuf: string[] = [];
    const stderrBuf: string[] = [];
    pyodide.setStdout({ batched: (s: string) => stdoutBuf.push(s) });
    pyodide.setStderr({ batched: (s: string) => stderrBuf.push(s) });

    let errorText: string | null = null;
    try {
      await pyodide.runPythonAsync(source);
    } catch (e: any) {
      errorText = e?.message ?? String(e);
    }

    const time = (performance.now() - t0) / 1000;
    const stdout = stdoutBuf.join('\n');
    const stderr = [stderrBuf.join('\n'), errorText].filter(Boolean).join('\n') || null;

    return {
      stdout: stdout || null,
      stderr,
      compileOutput: null,
      message: null,
      statusId: errorText ? 6 : 3, // 6 = runtime error, 3 = accepted
      statusDescription: errorText ? 'Runtime Error' : 'Accepted',
      time: Number(time.toFixed(3)),
      memory: null,
      runtime: 'browser',
    };
  } catch (e: any) {
    return {
      stdout: null,
      stderr: null,
      compileOutput: null,
      message: `Failed to initialise the Python runtime: ${e?.message ?? String(e)}. Check your network — Pyodide is downloaded from a public CDN on first use (~10 MB, cached after).`,
      statusId: 0,
      statusDescription: 'Runtime Load Failed',
      time: null,
      memory: null,
      runtime: 'unavailable',
    };
  }
}

// ─── JavaScript runner (sandboxed Web Worker) ────────────────────────────────

const JS_WORKER_SOURCE = `
  const _out = [];
  const _err = [];
  const format = (v) => {
    if (v instanceof Error) return v.stack || v.message;
    if (typeof v === 'string') return v;
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
  };
  const push = (buf) => (...args) => buf.push(args.map(format).join(' '));
  self.console = {
    log:   push(_out),
    info:  push(_out),
    debug: push(_out),
    warn:  push(_err),
    error: push(_err),
  };
  self.onmessage = async (ev) => {
    const src = ev.data;
    const t0 = performance.now();
    try {
      // Use indirect eval so the code runs in the global scope of this worker.
      // The worker has no DOM, no fetch to same-origin, and dies on postMessage back.
      const fn = new Function('"use strict";' + src);
      const result = fn();
      if (result && typeof result.then === 'function') await result;
      self.postMessage({ ok: true, stdout: _out.join('\\n'), stderr: _err.join('\\n'), time: (performance.now() - t0) / 1000 });
    } catch (e) {
      _err.push(e && e.stack ? e.stack : String(e));
      self.postMessage({ ok: false, stdout: _out.join('\\n'), stderr: _err.join('\\n'), time: (performance.now() - t0) / 1000 });
    }
  };
`;

function runJavaScript(source: string, timeoutMs = 5000): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let worker: Worker | null = null;
    let settled = false;

    const finish = (r: ExecutionResult) => {
      if (settled) return;
      settled = true;
      if (worker) { try { worker.terminate(); } catch {} }
      resolve(r);
    };

    try {
      const blob = new Blob([JS_WORKER_SOURCE], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      worker = new Worker(url);
      URL.revokeObjectURL(url);

      const timer = setTimeout(() => finish({
        stdout: null,
        stderr: `Execution timed out after ${timeoutMs / 1000}s (possible infinite loop).`,
        compileOutput: null,
        message: null,
        statusId: 5,
        statusDescription: 'Time Limit Exceeded',
        time: timeoutMs / 1000,
        memory: null,
        runtime: 'browser',
      }), timeoutMs);

      worker.onmessage = (ev: MessageEvent) => {
        clearTimeout(timer);
        const { ok, stdout, stderr, time } = ev.data ?? {};
        finish({
          stdout: stdout || null,
          stderr: stderr || null,
          compileOutput: null,
          message: null,
          statusId: ok ? 3 : 6,
          statusDescription: ok ? 'Accepted' : 'Runtime Error',
          time: typeof time === 'number' ? Number(time.toFixed(3)) : null,
          memory: null,
          runtime: 'browser',
        });
      };
      worker.onerror = (err) => {
        clearTimeout(timer);
        finish({
          stdout: null,
          stderr: err.message || 'Worker error',
          compileOutput: null,
          message: null,
          statusId: 6,
          statusDescription: 'Runtime Error',
          time: null,
          memory: null,
          runtime: 'browser',
        });
      };
      worker.postMessage(source);
    } catch (e: any) {
      finish({
        stdout: null,
        stderr: null,
        compileOutput: null,
        message: `Could not start browser sandbox: ${e?.message ?? String(e)}`,
        statusId: 0,
        statusDescription: 'Runtime Unavailable',
        time: null,
        memory: null,
        runtime: 'unavailable',
      });
    }
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function runInBrowser(language: string, source: string): Promise<ExecutionResult> {
  const lang = language.toLowerCase();
  if (lang === 'python') return runPython(source);
  if (lang === 'javascript' || lang === 'js') return runJavaScript(source);
  throw new Error(`Language '${language}' is not supported by the browser runner`);
}

