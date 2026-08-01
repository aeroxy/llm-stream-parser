import { describe, expect, test } from 'bun:test';
import { detectAndParse } from './index';

function sse(events: unknown[]): string {
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
}

describe('detectAndParse', () => {
  test('routes Gemini-shaped candidates to the gemini adapter', () => {
    const input = sse([{ response: { candidates: [{ content: { parts: [{ text: 'hi' }] } }] } }]);
    expect(detectAndParse(input).adapter.id).toBe('gemini');
  });

  test('routes Chat Completions chunks to openai-chat', () => {
    const input = sse([{ object: 'chat.completion.chunk', choices: [{ delta: { content: 'hi' } }] }]);
    expect(detectAndParse(input).adapter.id).toBe('openai-chat');
  });

  test('routes response.* events to openai-responses', () => {
    const input = sse([{ type: 'response.output_text.delta', item_id: 'x', delta: 'hi' }]);
    expect(detectAndParse(input).adapter.id).toBe('openai-responses');
  });

  test('routes message_start/content_block_* events to anthropic', () => {
    const input = sse([{ type: 'message_start', message: { model: 'claude-opus-5' } }]);
    expect(detectAndParse(input).adapter.id).toBe('anthropic');
  });

  test('falls back to raw for unrecognized input', () => {
    expect(detectAndParse('not a recognized stream format at all').adapter.id).toBe('raw');
  });
});
