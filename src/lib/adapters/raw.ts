import type { NormalizedEvent, StreamAdapter } from './types';
import { tryParseJson } from './types';

/**
 * Always matches. Degrades gracefully so the tool never hard-fails on
 * unrecognized input: whole-input JSON, then NDJSON, then plain text.
 */
export const rawAdapter: StreamAdapter = {
  id: 'raw',
  label: 'Raw / unrecognized',

  detect() {
    return true;
  },

  parse(raw) {
    const whole = tryParseJson(raw.trim());
    if (whole !== undefined) {
      const items = Array.isArray(whole) ? whole : [whole];
      const events: NormalizedEvent[] = items.map((item, index) => ({
        index,
        type: 'other',
        raw: item,
      }));
      return {
        provider: 'raw',
        message: { text: JSON.stringify(whole, null, 2), toolCalls: [] },
        events,
        raw: items,
      };
    }

    const lines = raw
      .split('\n')
      .map((l) => l.replace(/\r$/, '').trim())
      .filter((l) => l.length > 0);
    const ndjsonObjects = lines.map((line) => tryParseJson(line)).filter((v) => v !== undefined);
    if (ndjsonObjects.length > 0 && ndjsonObjects.length === lines.length) {
      const events: NormalizedEvent[] = ndjsonObjects.map((item, index) => ({
        index,
        type: 'other',
        raw: item,
      }));
      return {
        provider: 'raw',
        message: { text: JSON.stringify(ndjsonObjects, null, 2), toolCalls: [] },
        events,
        raw: ndjsonObjects,
      };
    }

    return {
      provider: 'raw',
      message: { text: raw, toolCalls: [] },
      events: [{ index: 0, type: 'other', raw }],
      raw: [raw],
    };
  },
};
