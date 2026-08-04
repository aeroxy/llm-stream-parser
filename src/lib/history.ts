import type { Provider } from '@/lib/adapters';

const STORAGE_KEY = 'llm-stream-parser:history';
const MAX_HISTORY = 5;

export interface HistoryRecord {
  raw: string;
  override: Provider | 'auto';
  savedAt: string;
}

export function loadHistory(): HistoryRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Records a parsed input, most-recent-first, capped at 5, deduped by raw text. */
export function addToHistory(raw: string, override: Provider | 'auto'): HistoryRecord[] {
  const next = [
    { raw, override, savedAt: new Date().toISOString() },
    ...loadHistory().filter((r) => r.raw !== raw),
  ].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable (quota/private mode) — history just won't persist
  }
  return next;
}
