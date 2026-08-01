import type { NormalizedEvent, ParsedStream, StreamAdapter, ToolCall } from './types';
import { extractDataLines, get, tryParseJson } from './types';

function eventType(obj: unknown): string | undefined {
  const type = get(obj, ['type']);
  return typeof type === 'string' ? type : undefined;
}

export const openaiResponsesAdapter: StreamAdapter = {
  id: 'openai-responses',
  label: 'OpenAI Responses API',

  detect(raw) {
    return extractDataLines(raw).some((line) => {
      const type = eventType(tryParseJson(line));
      return type !== undefined && type.startsWith('response.');
    });
  },

  parse(raw) {
    const events: NormalizedEvent[] = [];
    const rawObjects: unknown[] = [];
    let text = '';
    let thinking = '';
    let model: string | undefined;
    let finishReason: string | undefined;
    let usageRaw: unknown;

    const toolCallBuffers = new Map<string, { id?: string; name?: string; argsText: string }>();

    let index = 0;
    for (const line of extractDataLines(raw)) {
      if (line === '[DONE]') continue;
      const obj = tryParseJson(line);
      if (obj === undefined) continue;
      rawObjects.push(obj);
      const type = eventType(obj);

      switch (type) {
        case 'response.output_text.delta': {
          const delta = get(obj, ['delta']);
          if (typeof delta === 'string' && delta.length > 0) {
            text += delta;
            events.push({ index: index++, type: 'text', textDelta: delta, raw: obj });
          }
          break;
        }
        case 'response.reasoning_summary_text.delta': {
          const delta = get(obj, ['delta']);
          if (typeof delta === 'string' && delta.length > 0) {
            thinking += delta;
            events.push({ index: index++, type: 'thinking', textDelta: delta, raw: obj });
          }
          break;
        }
        case 'response.function_call_arguments.delta': {
          const itemId = get(obj, ['item_id']);
          const delta = get(obj, ['delta']);
          if (typeof itemId === 'string') {
            const buffer = toolCallBuffers.get(itemId) ?? { argsText: '' };
            if (typeof delta === 'string') buffer.argsText += delta;
            toolCallBuffers.set(itemId, buffer);
          }
          events.push({ index: index++, type: 'tool_call', raw: obj });
          break;
        }
        case 'response.output_item.done': {
          const item = get(obj, ['item']);
          if (get(item, ['type']) === 'function_call') {
            const itemId = (get(item, ['id']) as string | undefined) ?? 'unknown';
            const buffer = toolCallBuffers.get(itemId) ?? { argsText: '' };
            buffer.id = (get(item, ['call_id']) as string | undefined) ?? buffer.id;
            buffer.name = (get(item, ['name']) as string | undefined) ?? buffer.name;
            if (buffer.argsText === '') {
              const args = get(item, ['arguments']);
              if (typeof args === 'string') buffer.argsText = args;
            }
            toolCallBuffers.set(itemId, buffer);
          }
          events.push({ index: index++, type: 'other', raw: obj });
          break;
        }
        case 'response.completed': {
          const response = get(obj, ['response']);
          model = (get(response, ['model']) as string | undefined) ?? model;
          finishReason = (get(response, ['status']) as string | undefined) ?? finishReason;
          const usage = get(response, ['usage']);
          if (usage !== undefined) usageRaw = usage;
          events.push({ index: index++, type: 'usage', raw: obj });
          break;
        }
        case 'response.created':
        case 'response.in_progress': {
          const response = get(obj, ['response']);
          model = (get(response, ['model']) as string | undefined) ?? model;
          events.push({ index: index++, type: 'other', raw: obj });
          break;
        }
        default:
          events.push({ index: index++, type: 'other', raw: obj });
      }
    }

    const toolCallList: ToolCall[] = [...toolCallBuffers.values()].map((buf) => ({
      id: buf.id,
      name: buf.name,
      arguments: tryParseJson(buf.argsText) ?? buf.argsText,
    }));

    const result: ParsedStream = {
      provider: 'openai-responses',
      model,
      message: { text, thinking: thinking || undefined, toolCalls: toolCallList },
      finishReason,
      events,
      raw: rawObjects,
    };
    if (usageRaw !== undefined) {
      result.usage = {
        inputTokens: get(usageRaw, ['input_tokens']) as number | undefined,
        outputTokens: get(usageRaw, ['output_tokens']) as number | undefined,
        totalTokens: get(usageRaw, ['total_tokens']) as number | undefined,
        raw: usageRaw,
      };
    }
    return result;
  },
};
