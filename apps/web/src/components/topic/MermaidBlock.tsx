'use client';

import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

let initialized = false;
function init() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      darkMode: true,
      background: '#0d1117',
      primaryColor: '#1f2937',
      primaryTextColor: '#e6edf3',
      primaryBorderColor: '#30363d',
      lineColor: '#8b949e',
      secondaryColor: '#161b22',
      tertiaryColor: '#21262d',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: '13px',
    },
  });
  initialized = true;
}

/**
 * Renders a Mermaid diagram inline inside a topic's markdown content.
 * Used by <MarkdownView/> whenever it encounters ```mermaid``` fences.
 */
export function MermaidBlock({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    init();
    let cancelled = false;
    const id = 'm-' + Math.random().toString(36).slice(2, 10);
    mermaid
      .render(id, chart.trim())
      .then(({ svg }) => { if (!cancelled) setSvg(svg); })
      .catch(e => { if (!cancelled) setErr(String(e?.message ?? e)); });
    return () => { cancelled = true; };
  }, [chart]);

  if (err) {
    return (
      <pre className="my-4 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-red-300 text-xs overflow-x-auto">
        Mermaid render error: {err}
      </pre>
    );
  }
  if (!svg) {
    return (
      <div className="my-6 flex justify-center text-[--text-muted] text-xs italic">
        Rendering diagram…
      </div>
    );
  }
  return (
    <div
      className="mermaid-diagram my-6 flex justify-center p-4 rounded-xl border border-[--border-default] bg-[#0d1117] overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

