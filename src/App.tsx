import { useState } from 'react';

import { ADAPTERS, detectAndParse, getAdapter, type ParsedStream, type Provider } from '@/lib/adapters';
import { EXAMPLE_FIXTURE } from '@/lib/exampleFixture';
import { Eyebrow } from '@/components/Card';
import { InputPane } from '@/components/InputPane';
import { ReconstructedView } from '@/components/ReconstructedView';
import { TimelineView } from '@/components/TimelineView';
import { JsonView } from '@/components/JsonView';
import { cn } from '@/lib/cn';

type Tab = 'reconstructed' | 'timeline' | 'json';
const TABS: { id: Tab; label: string }[] = [
  { id: 'reconstructed', label: 'Reconstructed' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'json', label: 'Raw JSON' },
];

export default function App() {
  const [input, setInput] = useState('');
  const [override, setOverride] = useState<Provider | 'auto'>('auto');
  const [parsed, setParsed] = useState<{ adapterLabel: string; result: ParsedStream } | null>(null);
  const [tab, setTab] = useState<Tab>('reconstructed');

  function handleParse() {
    if (override === 'auto') {
      const { adapter, result } = detectAndParse(input);
      setParsed({ adapterLabel: adapter.label, result });
    } else {
      const adapter = getAdapter(override);
      setParsed({ adapterLabel: adapter.label, result: adapter.parse(input) });
    }
    setTab('reconstructed');
  }

  function handleLoadExample() {
    setInput(EXAMPLE_FIXTURE);
    setOverride('auto');
  }

  return (
    <div className="mx-auto flex h-screen max-w-[1400px] flex-col gap-5 p-6">
      <header className="flex flex-col gap-1.5">
        <Eyebrow>LLM Stream Parser</Eyebrow>
        <h1 className="display text-fg">Stream → readable JSON</h1>
        <p className="text-sm text-fg-2">
          Paste a raw SSE/NDJSON stream dump from any LLM provider — {ADAPTERS.length - 1} known formats
          auto-detected, everything else falls back to a raw JSON view.
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="min-h-0 rounded-xl border border-border bg-surface p-4 shadow-md">
          <InputPane
            value={input}
            onChange={setInput}
            onParse={handleParse}
            onLoadExample={handleLoadExample}
            override={override}
            onOverrideChange={setOverride}
          />
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-md">
          <div className="flex border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'px-4 py-2.5 text-[13px] font-medium transition',
                  tab === t.id
                    ? 'border-b-2 border-action text-fg'
                    : 'border-b-2 border-transparent text-fg-3 hover:text-fg-2',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            {parsed ? (
              tab === 'reconstructed' ? (
                <ReconstructedView result={parsed.result} adapterLabel={parsed.adapterLabel} />
              ) : tab === 'timeline' ? (
                <TimelineView events={parsed.result.events} />
              ) : (
                <JsonView result={parsed.result} />
              )
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-fg-3">
                Paste a stream and click Parse to see it reconstructed here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
