# Carma Chatbot

Simple Angular 17 frontend for a RAG-powered chatbot. Sends a user question to a backend API and renders the generated answer along with the supporting source documents.

## Getting started

```bash
npm install
npm start
```

The dev server runs at http://localhost:4200 and proxies `/api/*` to `http://localhost:8000` (configurable in `proxy.conf.json`).

## API contract

`POST /api/chat` with body `{ "question": "..." }` must return:

```json
{
  "question": "string",
  "generation": "string - the answer to show",
  "context": "string",
  "documents": [
    { "page_content": "...", "metadata": { "source": "..." } }
  ]
}
```

`documents` may also be an array of plain strings.

## Project layout

- `src/app/app.component.*` — chat UI (messages, composer, sources panel).
- `src/app/chatbot.service.ts` — HTTP client calling `/api/chat`.
- `src/app/chatbot.model.ts` — shared types.
