import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const base =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm ' +
  'text-fg placeholder:text-fg-3 transition focus:outline-none ' +
  'focus:border-action focus:shadow-focus';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...rest }, ref) => (
  <textarea ref={ref} className={cn(base, 'font-mono leading-snug', className)} {...rest} />
));
Textarea.displayName = 'Textarea';

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[12px] font-semibold text-fg-2">
      {children}
    </label>
  );
}
