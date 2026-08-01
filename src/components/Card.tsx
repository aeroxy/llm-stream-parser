import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-surface shadow-md', className)}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-border px-5 py-3.5', className)} {...rest} />;
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...rest} />;
}

/** Mono uppercase micro-label. `.eyebrow` lives in index.css. */
export function Eyebrow({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('eyebrow', className)} {...rest} />;
}

/** Numbered section rule — "001 ──── Reconstructed ──────── 3 EVENTS". */
export function SectionHead({
  n,
  title,
  meta,
  className,
}: {
  n?: string;
  title: string;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-baseline gap-3.5', className)}>
      {n ? <Eyebrow className="!text-[12px] font-bold">{n}</Eyebrow> : null}
      <h2 className="text-[22px] font-bold tracking-[-0.03em] text-fg">{title}</h2>
      <span className="h-px flex-1 bg-border" />
      {meta ? <Eyebrow className="!text-[10px]">{meta}</Eyebrow> : null}
    </div>
  );
}

/** Small outlined pill. `tone="live"` marks the auto-detected format. */
export function Chip({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: 'neutral' | 'live';
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium',
        tone === 'live'
          ? 'border-status-300 bg-status-soft text-status-700'
          : 'border-border bg-surface text-fg-2',
        className,
      )}
    >
      {tone === 'live' ? <span className="dot-live h-1.5 w-1.5 flex-none rounded-full" /> : null}
      {children}
    </span>
  );
}
