import { describe, expect, test } from 'bun:test';
import { openaiResponsesAdapter } from './openai-responses';

function sse(events: unknown[]): string {
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('');
}

const usage = { input_tokens: 12, output_tokens: 8, total_tokens: 20 };

const events = [
  { type: 'response.created', response: { id: 'resp_1', model: 'gpt-5-mini', status: 'in_progress' } },
  { type: 'response.output_text.delta', item_id: 'msg_1', delta: 'Hi' },
  { type: 'response.output_text.delta', item_id: 'msg_1', delta: ' there' },
  { type: 'response.reasoning_summary_text.delta', item_id: 'msg_1', delta: 'thinking it through' },
  { type: 'response.function_call_arguments.delta', item_id: 'fc_1', delta: '{"city":' },
  { type: 'response.function_call_arguments.delta', item_id: 'fc_1', delta: '"NYC"}' },
  {
    type: 'response.output_item.done',
    item: { id: 'fc_1', type: 'function_call', call_id: 'call_xyz', name: 'get_weather', arguments: '{"city":"NYC"}' },
  },
  {
    type: 'response.completed',
    response: { id: 'resp_1', model: 'gpt-5-mini', status: 'completed', usage },
  },
];

const fixture = sse(events);

describe('openaiResponsesAdapter', () => {
  test('detects the response.* named-event shape', () => {
    expect(openaiResponsesAdapter.detect(fixture)).toBe(true);
  });

  test('does not get confused with Chat Completions or Anthropic shapes', () => {
    expect(
      openaiResponsesAdapter.detect('data: {"choices":[{"delta":{"content":"hi"}}]}\n\n'),
    ).toBe(false);
    expect(openaiResponsesAdapter.detect('data: {"type":"message_start"}\n\n')).toBe(false);
  });

  test('concatenates output_text and reasoning_summary_text deltas', () => {
    const result = openaiResponsesAdapter.parse(fixture);
    expect(result.message.text).toBe('Hi there');
    expect(result.message.thinking).toBe('thinking it through');
  });

  test('reassembles a fragmented function call by item_id', () => {
    const result = openaiResponsesAdapter.parse(fixture);
    expect(result.message.toolCalls).toHaveLength(1);
    expect(result.message.toolCalls[0]).toEqual({
      id: 'call_xyz',
      name: 'get_weather',
      arguments: { city: 'NYC' },
    });
  });

  test('extracts model, status and usage from response.completed', () => {
    const result = openaiResponsesAdapter.parse(fixture);
    expect(result.model).toBe('gpt-5-mini');
    expect(result.finishReason).toBe('completed');
    expect(result.usage).toEqual({ inputTokens: 12, outputTokens: 8, totalTokens: 20, raw: usage });
  });
});
