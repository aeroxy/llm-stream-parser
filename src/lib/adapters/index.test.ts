import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectAndParse } from './index';

const geminiExample = readFileSync(join(import.meta.dir, '../../../refs/example'), 'utf8');

function sse(events: unknown[]): string {
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
}

describe('detectAndParse', () => {
  test('routes the Gemini fixture to the gemini adapter', () => {
    const { adapter } = detectAndParse(geminiExample);
    expect(adapter.id).toBe('gemini');
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
