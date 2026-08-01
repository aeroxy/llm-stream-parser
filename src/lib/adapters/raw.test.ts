import { describe, expect, test } from 'bun:test';
import { rawAdapter } from './raw';

describe('rawAdapter', () => {
  test('always detects', () => {
    expect(rawAdapter.detect('anything at all')).toBe(true);
  });

  test('parses a whole-input JSON array into one event per element', () => {
    const input = JSON.stringify([{ a: 1 }, { a: 2 }]);
    const result = rawAdapter.parse(input);
    expect(result.events).toHaveLength(2);
    expect(result.raw).toEqual([{ a: 1 }, { a: 2 }]);
  });

  test('parses NDJSON (one JSON object per line, no SSE framing)', () => {
    const input = '{"a":1}\n{"a":2}\n{"a":3}';
    const result = rawAdapter.parse(input);
    expect(result.events).toHaveLength(3);
    expect(result.raw).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
  });

  test('falls back to plain text when nothing parses as JSON', () => {
    const input = 'just some plain, non-JSON text';
    const result = rawAdapter.parse(input);
    expect(result.message.text).toBe(input);
    expect(result.events).toHaveLength(1);
  });
});
