import { describe, expect, test } from 'bun:test';
import { anthropicAdapter } from './anthropic';

function sse(events: unknown[]): string {
  return events.map((e) => `event: ${(e as { type: string }).type}\ndata: ${JSON.stringify(e)}\n\n`).join('');
}

const events = [
  { type: 'message_start', message: { id: 'msg_1', model: 'claude-opus-5', usage: { input_tokens: 25, output_tokens: 1 } } },
  { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } },
  { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'Let me consider this. ' } },
  { type: 'content_block_stop', index: 0 },
  { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } },
  { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: 'Hello' } },
  { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: ', world!' } },
  { type: 'content_block_stop', index: 1 },
  { type: 'content_block_start', index: 2, content_block: { type: 'tool_use', id: 'toolu_1', name: 'get_weather', input: {} } },
  { type: 'content_block_delta', index: 2, delta: { type: 'input_json_delta', partial_json: '{"city":' } },
  { type: 'content_block_delta', index: 2, delta: { type: 'input_json_delta', partial_json: '"SF"}' } },
  { type: 'content_block_stop', index: 2 },
  { type: 'message_delta', delta: { stop_reason: 'tool_use' }, usage: { output_tokens: 15 } },
  { type: 'message_stop' },
];

const fixture = sse(events);

describe('anthropicAdapter', () => {
  test('detects named message_start/content_block_* events', () => {
    expect(anthropicAdapter.detect(fixture)).toBe(true);
  });

  test('concatenates text_delta and thinking_delta separately per block', () => {
    const result = anthropicAdapter.parse(fixture);
    expect(result.message.text).toBe('Hello, world!');
    expect(result.message.thinking).toBe('Let me consider this. ');
  });

  test('reassembles a tool_use block from input_json_delta fragments', () => {
    const result = anthropicAdapter.parse(fixture);
    expect(result.message.toolCalls).toHaveLength(1);
    expect(result.message.toolCalls[0]).toEqual({
      id: 'toolu_1',
      name: 'get_weather',
      arguments: { city: 'SF' },
    });
  });

  test('merges input usage (message_start) with output usage (message_delta)', () => {
    const result = anthropicAdapter.parse(fixture);
    expect(result.model).toBe('claude-opus-5');
    expect(result.finishReason).toBe('tool_use');
    expect(result.usage?.inputTokens).toBe(25);
    expect(result.usage?.outputTokens).toBe(15);
    expect(result.usage?.totalTokens).toBe(40);
  });
});
