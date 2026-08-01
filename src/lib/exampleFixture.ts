/**
 * Small, entirely synthetic Gemini/Vertex-shaped SSE dump for the "Load
 * example" button — deliberately not real captured traffic, safe to ship
 * and commit.
 */
export const EXAMPLE_FIXTURE = [
  {
    response: {
      candidates: [
        { content: { role: 'model', parts: [{ text: 'Thinking about the best way to phrase this. ', thought: true }] } },
      ],
      modelVersion: 'gemini-3.5-flash',
      createTime: '2026-01-01T00:00:00.000Z',
    },
    traceId: 'example-trace',
  },
  {
    response: {
      candidates: [{ content: { role: 'model', parts: [{ text: 'Sure — here' }] } }],
      modelVersion: 'gemini-3.5-flash',
    },
    traceId: 'example-trace',
  },
  {
    response: {
      candidates: [{ content: { role: 'model', parts: [{ text: "'s a **quick example** of a streamed reply.\n\n" }] } }],
      modelVersion: 'gemini-3.5-flash',
    },
    traceId: 'example-trace',
  },
  {
    response: {
      candidates: [
        {
          content: { role: 'model', parts: [{ text: '- It arrives in small text deltas\n- Gets reconstructed here into one message' }] },
        },
      ],
      modelVersion: 'gemini-3.5-flash',
    },
    traceId: 'example-trace',
  },
  {
    response: {
      candidates: [{ content: { role: 'model', parts: [{ text: '' }] }, finishReason: 'STOP' }],
      usageMetadata: { promptTokenCount: 42, candidatesTokenCount: 31, totalTokenCount: 73 },
      modelVersion: 'gemini-3.5-flash',
    },
    traceId: 'example-trace',
  },
]
  .map((event) => `data: ${JSON.stringify(event)}\n\n`)
  .join('');
