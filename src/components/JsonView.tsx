import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';

import type { ParsedStream } from '@/lib/adapters';
import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';

export function JsonView({ result }: { result: ParsedStream }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(result, null, 2);

  function copy() {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function download() {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.provider}-parsed.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-end gap-2 border-b border-border p-2">
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="secondary" size="sm" onClick={download}>
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <CodeEditor value={json} readOnly height="100%" />
      </div>
    </div>
  );
}
