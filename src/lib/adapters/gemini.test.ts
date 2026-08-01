import { describe, expect, test } from 'bun:test';
import { geminiAdapter } from './gemini';

function sse(events: unknown[]): string {
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
}

// Mirrors the shape Google's internal Cloud Code Assist / gemini-cli surface
// sends: candidates wrapped in `{"response": {...}}`, plus a `traceId` and
// `metadata` sibling the public generateContent API doesn't emit. Also
// exercises a `thought: true` part, which the public API supports too.
const events = [
  {
    response: {
      candidates: [{ content: { role: 'model', parts: [{ text: 'Let me check the docs. ', thought: true }] } }],
      modelVersion: 'gemini-3.5-flash',
      createTime: '2026-01-01T00:00:00.000Z',
    },
    traceId: 'trace-1',
    metadata: { remoteContext: { ragState: 'RAG_DISABLED' } },
  },
  {
    response: {
      candidates: [{ content: { role: 'model', parts: [{ text: 'Amazing catch. ' }] } }],
      modelVersion: 'gemini-3.5-flash',
    },
    traceId: 'trace-1',
  },
  {
    response: {
      candidates: [{ content: { role: 'model', parts: [{ text: 'Aspiring Engineers, Real Output.' }] } }],
      modelVersion: 'gemini-3.5-flash',
    },
    traceId: 'trace-1',
  },
  {
    response: {
      candidates: [{ content: { role: 'model', parts: [{ text: '' }] }, finishReason: 'STOP' }],
      usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 20, totalTokenCount: 120 },
      modelVersion: 'gemini-3.5-flash',
    },
    traceId: 'trace-1',
  },
];

const fixture = sse(events);

describe('geminiAdapter', () => {
  test('detects the Cloud Code Assist wrapped format', () => {
    expect(geminiAdapter.detect(fixture)).toBe(true);
  });

  test('reconstructs the concatenated reply text', () => {
    const result = geminiAdapter.parse(fixture);
    expect(result.provider).toBe('gemini');
    expect(result.message.text).toBe('Amazing catch. Aspiring Engineers, Real Output.');
  });

  test('extracts model, finish reason, and usage metadata', () => {
    const result = geminiAdapter.parse(fixture);
    expect(result.model).toBe('gemini-3.5-flash');
    expect(result.finishReason).toBe('STOP');
    expect(result.usage).toBeDefined();
    expect(result.usage?.inputTokens).toBe(100);
    expect(result.usage?.outputTokens).toBe(20);
    expect(result.usage?.totalTokens).toBe(120);
  });

  test('separates thought:true parts into thinking, apart from visible text', () => {
    const result = geminiAdapter.parse(fixture);
    expect(result.message.thinking).toBe('Let me check the docs. ');
    expect(result.message.text).not.toContain('Let me check the docs');
  });

  test('does not match non-Gemini shapes', () => {
    expect(geminiAdapter.detect('data: {"choices":[{"delta":{"content":"hi"}}]}\n')).toBe(false);
  });
});
