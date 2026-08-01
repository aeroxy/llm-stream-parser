import type { ParsedStream } from '@/lib/adapters';
import { Chip, Eyebrow } from '@/components/Card';
import { Markdown } from '@/components/Markdown';
import { ThinkingBlock } from '@/components/ThinkingBlock';

export function ReconstructedView({
  result,
  adapterLabel,
}: {
  result: ParsedStream;
  adapterLabel: string;
}) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="live">{adapterLabel}</Chip>
        {result.model ? <Chip>{result.model}</Chip> : null}
        {result.finishReason ? <Chip>{result.finishReason}</Chip> : null}
        {result.createdAt ? <Chip>{new Date(result.createdAt).toLocaleString()}</Chip> : null}
      </div>

      {result.message.thinking ? <ThinkingBlock text={result.message.thinking} /> : null}

      <Markdown text={result.message.text || '_No text content in this stream._'} />

      {result.message.toolCalls.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Eyebrow>Tool calls</Eyebrow>
          {result.message.toolCalls.map((call, i) => (
            <div key={i} className="rounded-md border border-border bg-surface-sunken p-3">
              <div className="mb-1 font-mono text-[12px] font-semibold text-fg">
                {call.name ?? '(unnamed)'}
                {call.id ? <span className="ml-2 font-normal text-fg-3">{call.id}</span> : null}
              </div>
              <pre className="scroll-slim overflow-x-auto font-mono text-[11.5px] text-fg-2">
                {typeof call.arguments === 'string'
                  ? call.arguments
                  : JSON.stringify(call.arguments, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      ) : null}

      {result.usage ? (
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-surface-sunken">
              <tr>
                <th className="eyebrow px-3 py-2 font-medium">Metric</th>
                <th className="eyebrow px-3 py-2 font-medium">Tokens</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2 text-fg-2">Input</td>
                <td className="tabular px-3 py-2 text-fg">{result.usage.inputTokens ?? '—'}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 text-fg-2">Output</td>
                <td className="tabular px-3 py-2 text-fg">{result.usage.outputTokens ?? '—'}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 text-fg-2">Total</td>
                <td className="tabular px-3 py-2 text-fg">{result.usage.totalTokens ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
