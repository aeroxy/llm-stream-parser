import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { geminiAdapter } from './gemini';

const example = readFileSync(join(import.meta.dir, '../../../refs/example'), 'utf8');

describe('geminiAdapter', () => {
  test('detects the Cloud Code Assist wrapped format', () => {
    expect(geminiAdapter.detect(example)).toBe(true);
  });

  test('reconstructs the concatenated reply text from refs/example', () => {
    const result = geminiAdapter.parse(example);
    expect(result.provider).toBe('gemini');
    expect(result.message.text).toStartWith('<system-reminder>');
    expect(result.message.text).toContain('Amazing catch');
    expect(result.message.text).toContain('Aspiring Engineers, Real Output');
    expect(result.message.text).toEndWith('ready for deployment under the real name!');
  });

  test('extracts model and usage metadata', () => {
    const result = geminiAdapter.parse(example);
    expect(result.model).toBe('gemini-3.5-flash');
    expect(result.usage).toBeDefined();
    expect(result.usage?.inputTokens).toBe(147349);
    expect(result.usage?.outputTokens).toBe(291);
    expect(result.usage?.totalTokens).toBe(147640);
  });

  test('separates thinking parts (system-reminder text) from visible text', () => {
    // refs/example has no `thought: true` parts, so thinking should be empty
    // and the leading system-reminder text (sent as a plain text part) should
    // still land in `text`.
    const result = geminiAdapter.parse(example);
    expect(result.message.thinking).toBeUndefined();
    expect(result.message.text).toContain('system-reminder');
  });

  test('does not match non-Gemini shapes', () => {
    expect(geminiAdapter.detect('data: {"choices":[{"delta":{"content":"hi"}}]}\n')).toBe(false);
  });
});
