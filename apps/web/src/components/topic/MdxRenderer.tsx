'use client';

// ─── Client-side Markdown Renderer ──────────────────────────────
// Uses react-markdown + remark/rehype plugins instead of next-mdx-remote/rsc
// This runs on the client, so it can be safely passed as a prop or used
// inside 'use client' components without the Server→Client boundary error.

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MdxRendererProps {
  source: string;
  className?: string;
}

export function MdxRenderer({ source, className = '' }: MdxRendererProps) {
  if (!source || source.trim() === '') {
    return (
      <div className="flex items-center justify-center h-40 text-[--text-muted] italic text-sm">
        Content for this layer is being prepared...
      </div>
    );
  }

  return (
    <div className={`mdx-content prose max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold font-display mt-8 mb-4 text-[--text-primary] scroll-mt-20" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-bold font-display mt-8 mb-3 text-[--text-primary] border-b border-[--border-default] pb-2 scroll-mt-20" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold font-display mt-6 mb-2 text-[--text-primary] scroll-mt-20" {...props}>
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p className="text-[--text-secondary] leading-7 mb-4" {...props}>
              {children}
            </p>
          ),
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-[--accent-ai] hover:text-[--text-primary] underline underline-offset-2 transition-colors"
              {...props}
            >
              {children}
            </a>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside space-y-1.5 mb-4 text-[--text-secondary] pl-4" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside space-y-1.5 mb-4 text-[--text-secondary] pl-4" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-7" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-[--accent-ai] pl-4 py-1 my-4 bg-[--bg-elevated] rounded-r-md italic text-[--text-secondary]"
              {...props}
            >
              {children}
            </blockquote>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-[--border-default]">
              <table className="w-full text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-[--bg-elevated]" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-3 text-left font-semibold text-[--text-primary] border-b border-[--border-default]" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-3 text-[--text-secondary] border-b border-[--border-muted]" {...props}>
              {children}
            </td>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-[--bg-elevated]/50 transition-colors" {...props}>
              {children}
            </tr>
          ),
          hr: () => <hr className="my-8 border-[--border-default]" />,
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-[--text-primary]" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-[--text-secondary]" {...props}>
              {children}
            </em>
          ),
          // Code block with syntax highlighting
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isBlock = !!match;

            if (isBlock) {
              return (
                <div className="relative my-6 group">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      borderRadius: '0.75rem',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // Inline code
            return (
              <code
                className="px-1.5 py-0.5 rounded bg-[--bg-elevated] border border-[--border-default] text-[--accent-java] font-code text-[0.875em]"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
