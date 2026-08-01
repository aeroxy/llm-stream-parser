import type { NormalizedEvent, ParsedStream, StreamAdapter } from './types';
import { extractDataLines, get, tryParseJson } from './types';

/** Every non-blank line, JSON-parsed independently — bare NDJSON with no `data:` framing. */
function eventStrings(raw: string): string[] {
  const dataLines = extractDataLines(raw);
  if (dataLines.length > 0) return dataLines;
  return raw
    .split('\n')
    .map((l) => l.replace(/\r$/, '').trim())
    .filter((l) => l.length > 0);
}

function hasCandidates(obj: unknown): boolean {
  return Array.isArray(get(obj, ['candidates'])) || Array.isArray(get(obj, ['response', 'candidates']));
}

export const geminiAdapter: StreamAdapter = {
  id: 'gemini',
  label: 'Gemini / Vertex AI',

  detect(raw) {
    return eventStrings(raw).some((line) => hasCandidates(tryParseJson(line)));
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

    let index = 0;
    for (const line of eventStrings(raw)) {
      const parsed = tryParseJson(line);
      if (parsed === undefined) continue;
      rawObjects.push(parsed);

      // Google's internal Cloud Code Assist surface wraps the payload in
      // `{response: {...}}`; the public generateContent API does not.
      const body = (get(parsed, ['response']) ?? parsed) as unknown;

      model = (get(body, ['modelVersion']) as string | undefined) ?? model;
      createdAt = (get(body, ['createTime']) as string | undefined) ?? createdAt;
      const usage = get(body, ['usageMetadata']);
      if (usage !== undefined) usageRaw = usage;

      const candidate = get(body, ['candidates', 0]);
      finishReason = (get(candidate, ['finishReason']) as string | undefined) ?? finishReason;
      const parts = get(candidate, ['content', 'parts']);
      if (Array.isArray(parts)) {
        for (const part of parts) {
          const partText = get(part, ['text']);
          if (typeof partText !== 'string' || partText.length === 0) continue;
          const isThought = get(part, ['thought']) === true;
          if (isThought) thinking += partText;
          else text += partText;
          events.push({
            index: index++,
            type: isThought ? 'thinking' : 'text',
            textDelta: partText,
            raw: parsed,
          });
        }
      } else if (usage !== undefined) {
        events.push({ index: index++, type: 'usage', raw: parsed });
      } else {
        events.push({ index: index++, type: 'other', raw: parsed });
      }
    }

    const result: ParsedStream = {
      provider: 'gemini',
      model,
      createdAt,
      message: { text, thinking: thinking || undefined, toolCalls: [] },
      finishReason,
      events,
      raw: rawObjects,
    };
    if (usageRaw !== undefined) {
      result.usage = {
        inputTokens: get(usageRaw, ['promptTokenCount']) as number | undefined,
        outputTokens: get(usageRaw, ['candidatesTokenCount']) as number | undefined,
        totalTokens: get(usageRaw, ['totalTokenCount']) as number | undefined,
        raw: usageRaw,
      };
    }
    return result;
  },
};
