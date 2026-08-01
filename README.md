# LLM Stream Parser

A pure-frontend dashboard for turning a raw LLM streaming response — the
`data: {...}` (or NDJSON) chunks you'd capture off the wire — into a single,
readable, normalized JSON object: the concatenated reply text, any
reasoning/thinking text, reassembled tool calls, and token usage. No backend,
no network calls — everything happens in the browser.

Paste a stream, click **Parse**, and read the result across three views:
Reconstructed (rendered text + usage table), Timeline (chunk-by-chunk), and
Raw JSON (read-only, foldable, copy/download).

## Supported formats

Auto-detected, in this order (most distinctive signature first), with a
manual override in the UI if detection guesses wrong:

| Provider | Shape |
|---|---|
| **Anthropic Messages** | Named SSE events — `message_start`, `content_block_delta` (`text_delta` / `thinking_delta` / `input_json_delta`), `message_delta`, `message_stop` |
| **OpenAI Responses API** | `data:` payloads with a self-describing `type`, e.g. `response.output_text.delta`, `response.function_call_arguments.delta`, `response.completed` |
| **OpenAI Chat Completions** | `data: {"choices":[{"delta":{...}}]}` chunks, terminated by `data: [DONE]` |
| **Gemini / Vertex AI** | `{"candidates":[...]}`, optionally wrapped in `{"response": {...}}` (the shape Google's internal Cloud Code Assist / `gemini-cli` surface sends) |
| **Raw / unrecognized** | Always matches last. Tries whole-input JSON, then NDJSON, then falls back to showing the pasted text verbatim — the app never hard-fails on unknown input. |

Each format is one adapter under `src/lib/adapters/`, implementing:

```ts
interface StreamAdapter {
  id: Provider;
  label: string;
  detect(raw: string): boolean;
  parse(raw: string): ParsedStream;
}
```

Adding a new provider means adding one adapter file and registering it in
`src/lib/adapters/index.ts`'s `ADAPTERS` array (ordered most-specific-first;
`raw` stays last as the catch-all).

## Getting started

```bash
bun install
bun run dev       # http://localhost:5173
```

Click **Load example** to try it against a small hand-rolled, synthetic
Gemini-shaped fixture (`src/lib/exampleFixture.ts` — made-up content, not
real captured traffic), or paste/upload your own stream dump.

## Scripts

| Command | Does |
|---|---|
| `bun run dev` | Vite dev server |
| `bun run build` | Typecheck (`tsc -b`) + production build to `dist/` |
| `bun run preview` | Serve the production build locally |
| `bun run typecheck` | `tsc -b --noEmit` |
| `bun test` | Adapter unit tests (fixture-driven, one file per provider) |

## Project layout

```
src/
  lib/
    cn.ts                 # clsx + tailwind-merge helper
    adapters/
      types.ts            # ParsedStream / NormalizedEvent / StreamAdapter
      gemini.ts, openai-chat.ts, openai-responses.ts, anthropic.ts, raw.ts
      index.ts             # ADAPTERS list + detectAndParse()
      *.test.ts             # bun test, one fixture-driven file per adapter
  components/
    Button.tsx, Card.tsx, Input.tsx, Select.tsx   # styled primitives
    CodeEditor.tsx          # CodeMirror 6, read-only JSON view
    Markdown.tsx, ThinkingBlock.tsx
    InputPane.tsx, ReconstructedView.tsx, TimelineView.tsx, JsonView.tsx
  App.tsx                  # two-pane layout + tab state
```

## Design system

Visual style is adapted from `aero-oops-wtf`'s design system: warm-paper
background, near-black ink, a single orange **action** accent reserved for
the one primary control per view (here, "Parse"), and blue **status** for
live/detected-format indicators. Tokens live in `src/index.css` and
`tailwind.config.js`; `Inter` + `JetBrains Mono` are loaded via Google Fonts
in `index.html`.
