import type { NormalizedEvent } from '@/lib/adapters';
import { cn } from '@/lib/cn';

const TYPE_STYLES: Record<NormalizedEvent['type'], string> = {
  text: 'border-status-300 bg-status-soft text-status-700',
  thinking: 'border-border-strong bg-surface-muted text-fg-2',
  tool_call: 'border-action-300 bg-action-soft text-action-700',
  usage: 'border-border bg-surface text-fg-2',
  other: 'border-border bg-surface text-fg-3',
};

export function TimelineView({ events }: { events: NormalizedEvent[] }) {
  if (events.length === 0) {
    return <div className="p-5 text-sm text-fg-3">No events parsed.</div>;
  }

  return (
    <div className="scroll-slim flex h-full flex-col gap-2 overflow-y-auto p-5">
      {events.map((event) => (
        <div key={event.index} className="rounded-md border border-border bg-surface p-3">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="eyebrow !text-[10px]">#{event.index}</span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide',
                TYPE_STYLES[event.type],
              )}
            >
              {event.type}
            </span>
          </div>
          {event.textDelta ? (
            <div className="mb-1.5 font-mono text-[12px] text-fg">{JSON.stringify(event.textDelta)}</div>
          ) : null}
          <pre className="scroll-slim overflow-x-auto font-mono text-[11px] text-fg-3">
            {JSON.stringify(event.raw, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
