import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ChatMessages } from "./components/ChatMessages";
import { sendMessageToDifyStream } from "./api/difyStream";
import type { ChatMessage } from "./types/chat";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = input.trim();
    if (!content || isLoading) return;

    const nextMessages = [
      ...messages,
      createMessage("user", content),
      createMessage("assistant", ""),
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    const assistantMessageIndex = messages.length + 1;

    try {
      await sendMessageToDifyStream(content, conversationId, {
        onMessage: (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            const current = next[assistantMessageIndex];

            if (current) {
              next[assistantMessageIndex] = {
                ...current,
                content: current.content + chunk,
              };
            }

            return next;
          });
        },
        onSources: (sources) => {
          setMessages((prev) => {
            const next = [...prev];
            const current = next[assistantMessageIndex];

            if (current) {
              next[assistantMessageIndex] = {
                ...current,
                sources: sources.map((source) => ({
                  datasetName: source.dataset_name,
                  documentName: source.document_name,
                  content: source.content,
                })),
              };
            }

            return next;
          });
        },
        onConversationId: (id) => {
          setConversationId(id);
        },
        onError: (requestError) => {
          console.error(requestError);
          const message = getErrorMessage(requestError);
          setError(message);

          setMessages((prev) => {
            const next = [...prev];
            const current = next[assistantMessageIndex];

            if (current) {
              next[assistantMessageIndex] = {
                ...current,
                content: message,
              };
            }

            return next;
          });
        },
        onDone: () => {
          setIsLoading(false);
        },
      });
    } catch (requestError) {
      console.error(requestError);
      const message = getErrorMessage(requestError);
      setError(message);

      setMessages((prev) => {
        const next = [...prev];
        const current = next[assistantMessageIndex];

        if (current) {
          next[assistantMessageIndex] = {
            ...current,
            content: message,
          };
        }

        return next;
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff,_#eef3fb_45%,_#e8eef7)] text-slate-700">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-4 pt-6 sm:max-w-3xl sm:px-6">
        <header className="mb-4 flex items-center justify-between rounded-full border border-white/60 bg-white/75 px-4 py-3 shadow-[0_12px_40px_rgba(148,163,184,0.14)] backdrop-blur">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-400">
              Dify Chat
            </p>
            <h1 className="text-lg font-semibold text-slate-900">Chat Demo</h1>
          </div>
          <div className="flex items-center gap-2">
            {conversationId ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                Session Active
              </span>
            ) : null}
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
              {isLoading ? "Thinking" : "Ready"}
            </span>
          </div>
        </header>

        <section
          ref={listRef}
          className="flex-1 space-y-4 overflow-y-auto rounded-[2rem] border border-white/70 bg-white/55 p-4 shadow-[0_20px_80px_rgba(148,163,184,0.18)] backdrop-blur sm:p-6"
        >
          {messages.length === 0 ? (
            <div className="flex min-h-[58vh] flex-col items-center justify-center text-center">
              <div className="mb-5 rounded-3xl border border-slate-200/80 bg-white/80 p-5 text-slate-300 shadow-sm">
                <RobotIcon />
              </div>
              <p className="max-w-xs text-sm leading-7 text-slate-400 sm:max-w-sm sm:text-base">
                Enter a message below to start debugging your chatbot UI.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessages
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
                />
              ))}
            </>
          )}
        </section>

        {error ? (
          <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex items-end gap-3 rounded-[1.75rem] border border-white/80 bg-white/85 p-3 shadow-[0_16px_48px_rgba(148,163,184,0.22)] backdrop-blur"
        >
          <label className="sr-only" htmlFor="chat-input">
            Message input
          </label>
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Talk with the bot"
            className="max-h-32 min-h-[48px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            aria-label="Send message"
          >
            {isLoading ? <SpinnerIcon /> : <SendIcon />}
          </button>
        </form>
      </div>
    </main>
  );
}

function createMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: createMessageId(),
    role,
    content,
  };
}

function createMessageId() {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Request failed. Please try again later.";
}

function RobotIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      className="h-14 w-14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 12V20M32 12C29.8 12 28 10.2 28 8C28 5.8 29.8 4 32 4C34.2 4 36 5.8 36 8C36 10.2 34.2 12 32 12Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M23 22H41C46 22 50 26 50 31V44C50 49 46 53 41 53H23C18 53 14 49 14 44V31C14 26 18 22 23 22Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M19 32H14M50 32H45"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="25" cy="37" r="3" fill="currentColor" />
      <circle cx="39" cy="37" r="3" fill="currentColor" />
      <path
        d="M25 46H39"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M45 13H56C58.2 13 60 14.8 60 17V26C60 28.2 58.2 30 56 30H51L45 35V13Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 19L20 12L4 5V10L13 12L4 14V19Z" fill="currentColor" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 animate-spin"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12C21 7.02944 16.9706 3 12 3"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default App;
