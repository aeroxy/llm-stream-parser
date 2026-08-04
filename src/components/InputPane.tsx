import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Upload, Sparkles, History } from 'lucide-react';

import { ADAPTERS, type Provider } from '@/lib/adapters';
import type { HistoryRecord } from '@/lib/history';
import { Button } from '@/components/Button';
import { Label, Textarea } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';

function previewOf(raw: string): string {
  const flat = raw.replace(/\s+/g, ' ').trim();
  return flat.length > 60 ? `${flat.slice(0, 60)}…` : flat;
}

function HistoryMenu({
  history,
  onSelect,
}: {
  history: HistoryRecord[];
  onSelect: (record: HistoryRecord) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [open]);

  if (history.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)}>
        <History className="h-3.5 w-3.5" /> History
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-1 w-72 rounded-md border border-border bg-surface p-1 shadow-lg">
          {history.map((record, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(record);
                setOpen(false);
              }}
              className="flex w-full flex-col items-start gap-0.5 rounded-sm px-2 py-1.5 text-left hover:bg-surface-muted"
            >
              <span className="w-full truncate text-[12px] text-fg">{previewOf(record.raw)}</span>
              <span className="text-[11px] text-fg-3">
                {new Date(record.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function InputPane({
  value,
  onChange,
  onParse,
  onLoadExample,
  override,
  onOverrideChange,
  history,
  onSelectHistory,
}: {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  onLoadExample: () => void;
  override: Provider | 'auto';
  onOverrideChange: (value: Provider | 'auto') => void;
  history: HistoryRecord[];
  onSelectHistory: (record: HistoryRecord) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(onChange);
    e.target.value = '';
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="raw-input">Raw stream</Label>
        <Select value={override} onValueChange={(v) => onOverrideChange(v as Provider | 'auto')}>
          <SelectTrigger className="!h-8 w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-detect</SelectItem>
            {ADAPTERS.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Textarea
        id="raw-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a raw SSE / NDJSON stream dump here…"
        className="scroll-slim min-h-0 flex-1 resize-none text-[12px]"
      />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onLoadExample}>
          <Sparkles className="h-3.5 w-3.5" /> Load example
        </Button>
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" /> Upload file
        </Button>
        <HistoryMenu history={history} onSelect={onSelectHistory} />
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.log,.jsonl,.ndjson"
          className="hidden"
          onChange={handleFile}
        />
        <span className="flex-1" />
        <Button variant="accent" onClick={onParse} disabled={value.trim().length === 0}>
          Parse
        </Button>
      </div>
    </div>
  );
}
