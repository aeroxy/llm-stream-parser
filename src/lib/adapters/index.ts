import type { ParsedStream, Provider, StreamAdapter } from './types';
import { anthropicAdapter } from './anthropic';
import { openaiResponsesAdapter } from './openai-responses';
import { openaiChatAdapter } from './openai-chat';
import { geminiAdapter } from './gemini';
import { rawAdapter } from './raw';

export type { NormalizedEvent, ParsedStream, Provider, StreamAdapter, ToolCall, Usage } from './types';

// Most-specific signature first: anthropic/openai-responses use a `type`
// field that can't be confused with the others; `raw` always matches last.
export const ADAPTERS: StreamAdapter[] = [
  anthropicAdapter,
  openaiResponsesAdapter,
  openaiChatAdapter,
  geminiAdapter,
  rawAdapter,
];

export function getAdapter(id: Provider): StreamAdapter {
  const adapter = ADAPTERS.find((a) => a.id === id);
  if (!adapter) throw new Error(`Unknown adapter: ${id}`);
  return adapter;
}

export function detectAndParse(raw: string): { adapter: StreamAdapter; result: ParsedStream } {
  const adapter = ADAPTERS.find((a) => a.detect(raw)) ?? rawAdapter;
  return { adapter, result: adapter.parse(raw) };
}
