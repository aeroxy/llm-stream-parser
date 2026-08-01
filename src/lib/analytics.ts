import type { Provider } from './adapters';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const PROVIDER_LABELS: Record<Provider, string> = {
  'openai-chat': 'openai_chat_completion',
  'openai-responses': 'openai_responses',
  anthropic: 'anthropic_messages',
  gemini: 'google_gemini',
  raw: 'unrecognized',
};

export function trackParse(provider: Provider | 'failed') {
  const format = provider === 'failed' ? 'failed' : PROVIDER_LABELS[provider];
  window.gtag?.('event', 'parse', { format });
}
