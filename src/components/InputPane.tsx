import { useRef, type ChangeEvent } from 'react';
import { Upload, Sparkles } from 'lucide-react';

import { ADAPTERS, type Provider } from '@/lib/adapters';
import { Button } from '@/components/Button';
import { Label, Textarea } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';

export function InputPane({
  value,
  onChange,
  onParse,
  onLoadExample,
  override,
  onOverrideChange,
}: {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  onLoadExample: () => void;
  override: Provider | 'auto';
  onOverrideChange: (value: Provider | 'auto') => void;
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
