import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import rehypeShiki from '@shikijs/rehype';

// ─── Custom MDX Components ───────────────────────────────────
// These override the default HTML elements rendered by MDX
// with our design-system styled versions.

const mdxComponents = {
  // Headings with anchor links
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold font-display mt-8 mb-4 text-[--text-primary] scroll-mt-20" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold font-display mt-8 mb-3 text-[--text-primary] border-b border-[--border-default] pb-2 scroll-mt-20" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold font-display mt-6 mb-2 text-[--text-primary] scroll-mt-20" {...props} />
  ),

  // Paragraph
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-[--text-secondary] leading-7 mb-4" {...props} />
  ),

  // Links
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
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

  // Lists
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside space-y-1.5 mb-4 text-[--text-secondary] pl-4" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-4 text-[--text-secondary] pl-4" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-7" {...props} />
  ),

  // Blockquote
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-[--accent-ai] pl-4 py-1 my-4 bg-[--bg-elevated] rounded-r-md italic text-[--text-secondary]"
      {...props}
    />
  ),

  // Tables
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-[--border-default]">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-[--bg-elevated]" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3 text-left font-semibold text-[--text-primary] border-b border-[--border-default]" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 text-[--text-secondary] border-b border-[--border-muted]" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="hover:bg-[--bg-elevated]/50 transition-colors" {...props} />
  ),

  // Inline Code
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // Block code is handled by Shiki — only style inline code here
    if (!className) {
      return (
        <code
          className="px-1.5 py-0.5 rounded bg-[--bg-elevated] border border-[--border-default] text-[--accent-java] font-code text-[0.875em]"
          {...props}
        >
          {children}
        </code>
      );
    }
    // Block code: just pass through (Shiki wraps it in a <pre>)
    return <code className={className} {...props}>{children}</code>;
  },

  // Code Block Wrapper (Shiki renders inside this)
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <div className="relative my-6 group">
      <pre
        className="overflow-x-auto rounded-xl border border-[--border-default] bg-[--bg-elevated] p-4 text-sm leading-relaxed font-code"
        {...props}
      >
        {children}
      </pre>
    </div>
  ),

  // Horizontal Rule
  hr: () => <hr className="my-8 border-[--border-default]" />,

  // Strong & Em
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-[--text-primary]" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-[--text-secondary]" {...props} />
  ),
};

// ─── The MDX Renderer ─────────────────────────────────────────

interface MdxRendererProps {
  source: string;
  className?: string;
}

export async function MdxRenderer({ source, className = '' }: MdxRendererProps) {
  if (!source || source.trim() === '') {
    return (
      <div className="flex items-center justify-center h-40 text-[--text-muted] italic text-sm">
        Content for this layer is being prepared...
      </div>
    );
  }

  return (
    <div className={`mdx-content ${className}`}>
      <MDXRemote
        source={source}
        components={mdxComponents as any}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor-link'] } }],
              [
                rehypeShiki,
                {
                  theme: 'github-dark-dimmed',
                  addLanguageClass: true,
                },
              ],
            ],
          },
        }}
      />
    </div>
  );
}
