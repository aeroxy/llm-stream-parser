import { describe, expect, test } from 'bun:test';
import { openaiChatAdapter } from './openai-chat';

function sse(chunks: unknown[]): string {
  return chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('') + 'data: [DONE]\n\n';
}

const chunks = [
  {
    id: 'chatcmpl-1',
    object: 'chat.completion.chunk',
    created: 1700000000,
    model: 'gpt-4o-mini',
    choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }],
  },
  {
    id: 'chatcmpl-1',
    object: 'chat.completion.chunk',
    model: 'gpt-4o-mini',
    choices: [{ index: 0, delta: { reasoning_content: 'Let me think. ' }, finish_reason: null }],
  },
  {
    id: 'chatcmpl-1',
    object: 'chat.completion.chunk',
    model: 'gpt-4o-mini',
    choices: [{ index: 0, delta: { content: 'Hello' }, finish_reason: null }],
  },
  {
    id: 'chatcmpl-1',
    object: 'chat.completion.chunk',
    model: 'gpt-4o-mini',
    choices: [{ index: 0, delta: { content: ', world!' }, finish_reason: null }],
  },
  {
    id: 'chatcmpl-1',
    object: 'chat.completion.chunk',
    model: 'gpt-4o-mini',
    choices: [
      {
        index: 0,
        delta: {
          tool_calls: [
            { index: 0, id: 'call_abc', type: 'function', function: { name: 'get_weather', arguments: '' } },
          ],
        },
        finish_reason: null,
      },
    ],
  },
  {
    id: 'chatcmpl-1',
    object: 'chat.completion.chunk',
    model: 'gpt-4o-mini',
    choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: '{"city":' } }] }, finish_reason: null }],
  },
  {
    id: 'chatcmpl-1',
    object: 'chat.completion.chunk',
    model: 'gpt-4o-mini',
    choices: [{ index: 0, delta: { tool_calls: [{ index: 0, function: { arguments: '"SF"}' } }] }, finish_reason: null }],
  },
  {
    id: 'chatcmpl-1',
    object: 'chat.completion.chunk',
    model: 'gpt-4o-mini',
    choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }],
    usage: { prompt_tokens: 20, completion_tokens: 15, total_tokens: 35 },
  },
];

const fixture = sse(chunks);

describe('openaiChatAdapter', () => {
  test('detects Chat Completions chunks', () => {
    expect(openaiChatAdapter.detect(fixture)).toBe(true);
  });

  test('concatenates text and reasoning deltas', () => {
    const result = openaiChatAdapter.parse(fixture);
    expect(result.message.text).toBe('Hello, world!');
    expect(result.message.thinking).toBe('Let me think. ');
  });

  test('reassembles a tool call fragmented across chunks', () => {
    const result = openaiChatAdapter.parse(fixture);
    expect(result.message.toolCalls).toHaveLength(1);
    expect(result.message.toolCalls[0]).toEqual({
      id: 'call_abc',
      name: 'get_weather',
      arguments: { city: 'SF' },
    });
  });

  test('extracts usage from the final chunk and ignores [DONE]', () => {
    const result = openaiChatAdapter.parse(fixture);
    expect(result.usage).toEqual({ inputTokens: 20, outputTokens: 15, totalTokens: 35, raw: chunks[7].usage });
    expect(result.finishReason).toBe('tool_calls');
    expect(result.model).toBe('gpt-4o-mini');
  });
});
