'use client';

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MermaidBlock } from './MermaidBlock';
import { Copy, Check } from 'lucide-react';

// ─── Copy-button code block ──────────────────────────────────────────────────
function CodeBlock({ language, children }: { language?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = typeof children === 'string' ? children
      : React.Children.toArray(children).map(c => (typeof c === 'string' ? c : '')).join('');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  // Language badge colour map
  const langColors: Record<string, string> = {
    java: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    javascript: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    typescript: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    python: 'text-green-400 bg-green-500/10 border-green-500/30',
    bash: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    shell: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    sql: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    dockerfile: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    json: 'text-lime-400 bg-lime-500/10 border-lime-500/30',
    kotlin: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  };
  const langKey = (language ?? '').toLowerCase();
  const badgeCls = langColors[langKey] ?? 'text-[--text-muted] bg-[--bg-elevated] border-[--border-muted]';

  return (
    <div className="relative my-6 group rounded-xl border border-[--border-default] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[--bg-elevated] border-b border-[--border-default]">
        {language ? (
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${badgeCls}`}>
            {language}
          </span>
        ) : (
          <span className="text-xs text-[--text-muted]">code</span>
        )}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all ${
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-surface] border border-transparent'
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[#0d1117] p-4 text-sm leading-relaxed font-mono text-[--text-secondary] m-0 rounded-none">
        <code>{children}</code>
      </pre>
    </div>
  );
}

interface MarkdownViewProps {
  source: string | null | undefined;
  className?: string;
}

/**
 * Client-side markdown renderer used for topic layer content.
 *
 * We deliberately render on the client (rather than via `next-mdx-remote/rsc`
 * on the server) because pre-rendered server elements cannot be safely passed
 * across the RSC → client component boundary without React version mismatches.
 */
export function MarkdownView({ source, className = '' }: MarkdownViewProps) {
  if (!source || source.trim() === '') {
    return (
      <div className="flex items-center justify-center h-40 text-[--text-muted] italic text-sm">
        Content for this layer is being prepared…
      </div>
    );
  }
  return (
    <div className={`mdx-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="text-3xl font-bold font-display mt-8 mb-4 text-[--text-primary] scroll-mt-20" {...props} />,
          h2: (props) => <h2 className="text-2xl font-bold font-display mt-8 mb-3 text-[--text-primary] border-b border-[--border-default] pb-2 scroll-mt-20" {...props} />,
          h3: (props) => <h3 className="text-xl font-semibold font-display mt-6 mb-2 text-[--text-primary] scroll-mt-20" {...props} />,
          h4: (props) => <h4 className="text-base font-semibold text-[--text-primary] mt-4 mb-1" {...props} />,
          p:  (props) => <p  className="text-[--text-secondary] leading-7 mb-4" {...props} />,
          a:  ({ href, children, ...rest }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              {...rest}
            >
              {children}
            </a>
          ),
          ul: (props) => <ul className="list-disc list-inside space-y-1.5 mb-4 text-[--text-secondary] pl-4" {...props} />,
          ol: (props) => <ol className="list-decimal list-inside space-y-1.5 mb-4 text-[--text-secondary] pl-4" {...props} />,
          li: (props) => <li className="leading-7" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-indigo-500 pl-4 py-1 my-4 bg-[--bg-elevated] rounded-r-md italic text-[--text-secondary]"
              {...props}
            />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-[--border-default]">
              <table className="w-full text-sm" {...props} />
            </div>
          ),
          thead: (props) => <thead className="bg-[--bg-elevated]" {...props} />,
          th: (props) => <th className="px-4 py-3 text-left font-semibold text-[--text-primary] border-b border-[--border-default]" {...props} />,
          td: (props) => <td className="px-4 py-3 text-[--text-secondary] border-b border-[--border-default]/60" {...props} />,
          tr: (props) => <tr className="hover:bg-[--bg-elevated]/50 transition-colors" {...props} />,
          hr: () => <hr className="my-8 border-[--border-default]" />,
          strong: (props) => <strong className="font-semibold text-[--text-primary]" {...props} />,
          em: (props) => <em className="italic text-[--text-secondary]" {...props} />,
          code: ({ className: cls, children, ...rest }) => {
            // Inline code (no language class) vs block code (inside <pre>)
            const isBlock = /language-/.test(cls ?? '');
            if (!isBlock) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-[--bg-elevated] border border-[--border-default] text-amber-400 font-mono text-[0.875em]"
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            return <code className={cls} {...rest}>{children}</code>;
          },
          pre: ({ children }) => {
            // Extract language and raw text from the child <code> element
            const arr = React.Children.toArray(children);
            const first = arr[0] as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;
            const cls = first?.props?.className ?? '';

            // Mermaid diagram
            if (typeof cls === 'string' && /language-mermaid/.test(cls)) {
              const raw = React.Children.toArray(first!.props.children).join('');
              return <MermaidBlock chart={String(raw)} />;
            }

            // Extract language label from className like "language-java"
            const langMatch = typeof cls === 'string' ? cls.match(/language-(\w+)/) : null;
            const language = langMatch ? langMatch[1] : undefined;
            const codeContent = first?.props?.children;

            return <CodeBlock language={language}>{codeContent}</CodeBlock>;
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

