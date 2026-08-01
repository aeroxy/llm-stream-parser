import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Markdown } from '@/components/Markdown';
import { cn } from '@/lib/cn';

/** Collapsed-by-default "Reasoning ›" disclosure for the reconstructed thinking text. */
export function ThinkingBlock({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  if (!text.trim()) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[11px] font-medium text-fg-3 hover:text-fg-2"
      >
        <ChevronRight className={cn('h-3 w-3 transition-transform', open && 'rotate-90')} />
        Reasoning
      </button>
      {open ? (
        <div className="mt-1.5 border-l-2 border-border pl-3 opacity-70">
          <Markdown text={text} className="prose-sm text-[12px]" />
        </div>
      ) : null}
    </div>
  );
}
