/** Shared execution result contract — used by both browser and server runners. */
export interface ExecutionResult {
  stdout:            string | null;
  stderr:            string | null;
  compileOutput:     string | null;
  message:           string | null;
  statusId:          number | null;   // 3 = success, 0 = unavailable/error
  statusDescription: string | null;
  time:              number | null;   // seconds
  memory:            number | null;   // KB
  /** Where did this run — for UI badging. */
  runtime?:          'browser' | 'piston' | 'unavailable';
  /** Optional CTA link (e.g. self-host docs). */
  actionUrl?:        string | null;
}

/** Canonical language identifiers used across the app. */
export type LanguageKey =
  | 'javascript' | 'typescript'
  | 'python'
  | 'java' | 'kotlin'
  | 'cpp' | 'c'
  | 'go' | 'rust'
  | 'sql';

/** Languages that run 100% in the browser — no backend needed. */
export const BROWSER_LANGUAGES: readonly LanguageKey[] = ['javascript', 'python'] as const;

export function isBrowserLanguage(lang: string): boolean {
  return (BROWSER_LANGUAGES as readonly string[]).includes(lang.toLowerCase());
}

