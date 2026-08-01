import type { NormalizedEvent, ParsedStream, StreamAdapter, ToolCall } from './types';
import { extractDataLines, get, tryParseJson } from './types';

function eventType(obj: unknown): string | undefined {
  const type = get(obj, ['type']);
  return typeof type === 'string' ? type : undefined;
}

export const anthropicAdapter: StreamAdapter = {
  id: 'anthropic',
  label: 'Anthropic Messages',

  detect(raw) {
    return extractDataLines(raw).some((line) => {
      const type = eventType(tryParseJson(line));
      return type !== undefined && (type.startsWith('message_') || type.startsWith('content_block_'));
    });
  },

  parse(raw) {
    const events: NormalizedEvent[] = [];
    const rawObjects: unknown[] = [];
    let text = '';
    let thinking = '';
    let model: string | undefined;
    let finishReason: string | undefined;
    const usageRaw: Record<string, unknown> = {};

    const blockKinds = new Map<number, string>();
    const toolCallBuffers = new Map<number, { id?: string; name?: string; argsText: string }>();

    let index = 0;
    for (const line of extractDataLines(raw)) {
      const obj = tryParseJson(line);
      if (obj === undefined) continue;
      const type = eventType(obj);
      if (type === 'ping') continue;
      rawObjects.push(obj);

      switch (type) {
        case 'message_start': {
          const message = get(obj, ['message']);
          model = (get(message, ['model']) as string | undefined) ?? model;
          const usage = get(message, ['usage']);
          if (usage !== undefined) Object.assign(usageRaw, usage as Record<string, unknown>);
          events.push({ index: index++, type: 'other', raw: obj });
          break;
        }
        case 'content_block_start': {
          const blockIndex = get(obj, ['index']) as number | undefined;
          const block = get(obj, ['content_block']);
          const kind = get(block, ['type']) as string | undefined;
          if (blockIndex !== undefined && kind !== undefined) {
            blockKinds.set(blockIndex, kind);
            if (kind === 'tool_use') {
              toolCallBuffers.set(blockIndex, {
                id: get(block, ['id']) as string | undefined,
                name: get(block, ['name']) as string | undefined,
                argsText: '',
              });
            }
          }
          events.push({ index: index++, type: 'other', raw: obj });
          break;
        }
        case 'content_block_delta': {
          const blockIndex = get(obj, ['index']) as number | undefined;
          const delta = get(obj, ['delta']);
          const deltaType = get(delta, ['type']);
          if (deltaType === 'text_delta') {
            const chunk = get(delta, ['text']);
            if (typeof chunk === 'string' && chunk.length > 0) {
              text += chunk;
              events.push({ index: index++, type: 'text', textDelta: chunk, raw: obj });
            }
          } else if (deltaType === 'thinking_delta') {
            const chunk = get(delta, ['thinking']);
            if (typeof chunk === 'string' && chunk.length > 0) {
              thinking += chunk;
              events.push({ index: index++, type: 'thinking', textDelta: chunk, raw: obj });
            }
          } else if (deltaType === 'input_json_delta' && blockIndex !== undefined) {
            const buffer = toolCallBuffers.get(blockIndex) ?? { argsText: '' };
            const partial = get(delta, ['partial_json']);
            if (typeof partial === 'string') buffer.argsText += partial;
            toolCallBuffers.set(blockIndex, buffer);
            events.push({ index: index++, type: 'tool_call', raw: obj });
          } else {
            events.push({ index: index++, type: 'other', raw: obj });
          }
          break;
        }
        case 'message_delta': {
          const delta = get(obj, ['delta']);
          finishReason = (get(delta, ['stop_reason']) as string | undefined) ?? finishReason;
          const usage = get(obj, ['usage']);
          if (usage !== undefined) Object.assign(usageRaw, usage as Record<string, unknown>);
          events.push({ index: index++, type: 'usage', raw: obj });
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
      provider: 'anthropic',
      model,
      message: { text, thinking: thinking || undefined, toolCalls: toolCallList },
      finishReason,
      events,
      raw: rawObjects,
    };
    if (Object.keys(usageRaw).length > 0) {
      result.usage = {
        inputTokens: usageRaw.input_tokens as number | undefined,
        outputTokens: usageRaw.output_tokens as number | undefined,
        totalTokens:
          typeof usageRaw.input_tokens === 'number' && typeof usageRaw.output_tokens === 'number'
            ? usageRaw.input_tokens + usageRaw.output_tokens
            : undefined,
        raw: usageRaw,
      };
    }
    return result;
  },
};
