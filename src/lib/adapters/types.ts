export type Provider = 'gemini' | 'openai-chat' | 'openai-responses' | 'anthropic' | 'raw';

export interface NormalizedEvent {
  index: number;
  type: 'text' | 'thinking' | 'tool_call' | 'usage' | 'other';
  textDelta?: string;
  raw: unknown;
}

export interface ToolCall {
  id?: string;
  name?: string;
  arguments: unknown;
}

export interface Usage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  raw?: unknown;
}

export interface ParsedStream {
  provider: Provider;
  model?: string;
  createdAt?: string;
  message: {
    text: string;
    thinking?: string;
    toolCalls: ToolCall[];
  };
  usage?: Usage;
  finishReason?: string;
  events: NormalizedEvent[];
  raw: unknown[];
}

export interface StreamAdapter {
  id: Provider;
  label: string;
  detect(raw: string): boolean;
  parse(raw: string): ParsedStream;
}

/** Splits raw SSE text into `data:` payload strings, one per event. */
export function extractDataLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.replace(/\r$/, ''))
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trimStart())
    .filter((line) => line.length > 0);
}

/** Best-effort JSON.parse — returns undefined instead of throwing. */
export function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function get(value: unknown, path: (string | number)[]): unknown {
  let cur: unknown = value;
  for (const key of path) {
    if (typeof key === 'number') {
      if (!Array.isArray(cur)) return undefined;
      cur = cur[key];
    } else {
      if (!isRecord(cur)) return undefined;
      cur = cur[key];
    }
  }
  return cur;
}
