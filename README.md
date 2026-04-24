# dify-chat-demo

A chat UI demo built with React, TypeScript, Vite, and Tailwind CSS.

The project now includes a reusable API layer for calling a backend chat endpoint. The page contains an empty state, message list, input box, send button, loading state, and error feedback.

## Features

- Mobile-first chat layout
- User and assistant message rendering
- Empty state and loading state
- Basic request error feedback
- Reusable API layer for backend integration
- Tailwind CSS v4 styling

## Tech Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a local env file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Environment variables:

- `VITE_API_BASE_URL`: backend base URL, default is `https://api.dify.ai/v1`
- `VITE_CHAT_API_PATH`: chat endpoint path, default is `/chat-messages`
- `VITE_API_KEY`: optional bearer token, sent as `Authorization: Bearer <token>`
- `VITE_DIFY_USER`: Dify `user` field used to identify the current end user

### 3. Start development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## API Contract

The frontend sends a `POST` request to the configured chat endpoint:

```json
{
  "inputs": {
    "history": [
      { "role": "user", "content": "Hello" }
    ]
  },
  "query": "Hello",
  "response_mode": "blocking",
  "conversation_id": "",
  "user": "demo-user"
}
```

The frontend accepts several common response formats and extracts the reply from one of these fields:

- `answer`
- `reply`
- `message`
- `data.answer`
- `data.reply`
- `choices[0].message.content`
- `choices[0].text`

Recommended backend response:

```json
{
  "conversation_id": "conversation-id",
  "answer": "Hi, how can I help you?"
}
```

## Project Structure

```text
src/
  api/
    chat.ts        # Chat request wrapper
  types/
    chat.ts        # Shared message types
  App.tsx          # Chat page UI and state
  index.css        # Tailwind import and global styles
  main.tsx         # App entry
```

## Scripts

- `npm run dev`: start local development
- `npm run build`: type-check and build for production
- `npm run preview`: preview production build
- `npm run lint`: run ESLint

## Next Steps

- Connect to Dify Chat API or your own backend
- Add streaming responses
- Add conversation persistence
- Add retry and network timeout handling
- Add authentication if needed

## License

MIT
