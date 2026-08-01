import type { NormalizedEvent, ParsedStream, StreamAdapter, ToolCall } from './types';
import { extractDataLines, get, tryParseJson } from './types';

function isChatCompletionChunk(obj: unknown): boolean {
  return Array.isArray(get(obj, ['choices'])) && get(obj, ['choices', 0, 'delta']) !== undefined;
}

export const openaiChatAdapter: StreamAdapter = {
  id: 'openai-chat',
  label: 'OpenAI Chat Completions',

  detect(raw) {
    return extractDataLines(raw).some((line) => {
      if (line === '[DONE]') return true;
      return isChatCompletionChunk(tryParseJson(line));
    });
  },

  parse(raw) {
    const events: NormalizedEvent[] = [];
    const rawObjects: unknown[] = [];
    let text = '';
    let thinking = '';
    let model: string | undefined;
    let createdAt: string | undefined;
    let finishReason: string | undefined;
    let usageRaw: unknown;

    const toolCallBuffers = new Map<number, { id?: string; name?: string; argsText: string }>();

    let index = 0;
    for (const line of extractDataLines(raw)) {
      if (line === '[DONE]') continue;
      const chunk = tryParseJson(line);
      if (chunk === undefined) continue;
      rawObjects.push(chunk);

      model = (get(chunk, ['model']) as string | undefined) ?? model;
      const created = get(chunk, ['created']);
      if (typeof created === 'number') createdAt = new Date(created * 1000).toISOString();
      const usage = get(chunk, ['usage']);
      if (usage !== undefined) usageRaw = usage;

      const delta = get(chunk, ['choices', 0, 'delta']);
      finishReason = (get(chunk, ['choices', 0, 'finish_reason']) as string | undefined) ?? finishReason;

      const content = get(delta, ['content']);
      const reasoning = get(delta, ['reasoning_content']) ?? get(delta, ['reasoning']);
      const toolCalls = get(delta, ['tool_calls']);

      if (typeof content === 'string' && content.length > 0) {
        text += content;
        events.push({ index: index++, type: 'text', textDelta: content, raw: chunk });
      }
      if (typeof reasoning === 'string' && reasoning.length > 0) {
        thinking += reasoning;
        events.push({ index: index++, type: 'thinking', textDelta: reasoning, raw: chunk });
      }
      if (Array.isArray(toolCalls)) {
        for (const tc of toolCalls) {
          const tcIndex = (get(tc, ['index']) as number | undefined) ?? 0;
          const buffer = toolCallBuffers.get(tcIndex) ?? { argsText: '' };
          const id = get(tc, ['id']);
          const name = get(tc, ['function', 'name']);
          const args = get(tc, ['function', 'arguments']);
          if (typeof id === 'string') buffer.id = id;
          if (typeof name === 'string') buffer.name = name;
          if (typeof args === 'string') buffer.argsText += args;
          toolCallBuffers.set(tcIndex, buffer);
        }
        events.push({ index: index++, type: 'tool_call', raw: chunk });
      }
      if (!content && !reasoning && !toolCalls) {
        events.push({ index: index++, type: usage !== undefined ? 'usage' : 'other', raw: chunk });
      }
    }

    const toolCallList: ToolCall[] = [...toolCallBuffers.values()].map((buf) => ({
      id: buf.id,
      name: buf.name,
      arguments: tryParseJson(buf.argsText) ?? buf.argsText,
    }));

    const result: ParsedStream = {
      provider: 'openai-chat',
      model,
      createdAt,
      message: { text, thinking: thinking || undefined, toolCalls: toolCallList },
      finishReason,
      events,
      raw: rawObjects,
    };
    if (usageRaw !== undefined) {
      result.usage = {
        inputTokens: get(usageRaw, ['prompt_tokens']) as number | undefined,
        outputTokens: get(usageRaw, ['completion_tokens']) as number | undefined,
        totalTokens: get(usageRaw, ['total_tokens']) as number | undefined,
        raw: usageRaw,
      };
    }
    return result;
  },
};
