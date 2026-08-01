import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/cn';

const PLUGINS = [remarkGfm];

const COMPONENTS: Components = {
  pre: ({ node: _node, className, ...props }) => (
    <pre className={cn(className, 'scroll-slim')} {...props} />
  ),
  table: ({ node: _node, ...props }) => (
    <div className="scroll-slim overflow-x-auto">
      <table {...props} />
    </div>
  ),
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
};

/** Renders reconstructed assistant text/thinking as GitHub-flavored markdown. */
export function Markdown({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none break-words',
        'prose-headings:mt-3 prose-headings:mb-1.5 prose-headings:font-semibold prose-headings:text-fg first:prose-headings:mt-0',
        'prose-p:my-1.5 prose-p:text-fg first:prose-p:mt-0 last:prose-p:mb-0',
        'prose-pre:my-2 prose-pre:rounded-md prose-pre:bg-surface-sunken',
        'prose-code:rounded prose-code:bg-surface-sunken prose-code:px-1 prose-code:py-0.5 prose-code:text-fg prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0',
        'prose-a:text-action prose-a:font-medium prose-a:no-underline hover:prose-a:underline',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={PLUGINS} components={COMPONENTS}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
