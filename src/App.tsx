import { useState, useEffect, useRef } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { sendMessageToDifyStream } from "./api/difyStream";
import type { Message } from "./types/chat";
import "./index.css";
import { loadChatState, saveChatState, clearChatState } from "./utils/storage";

function App() {
  const initialState = loadChatState();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialState.messages);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialState.conversationId,
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    saveChatState({
      messages,
      conversationId,
    });
  }, [messages, conversationId]);

  async function handleSend(question?: string) {
    const text = typeof question === "string" ? question.trim() : input.trim();

    if (!text || loading) {
      return;
    }

    setInput("");
    setLoading(true);

    const assistantMessageIndex = messages.length + 1;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
      {
        role: "assistant",
        content: "",
      },
    ]);

    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      await sendMessageToDifyStream(
        text,
        conversationId,
        {
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
          onConversationId: (id) => setConversationId(id),
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
          onError: (error) => {
            console.error(error);
          },
          onDone: () => {
            setLoading(false);
          },
        },
        abortController.signal,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error(error);

      setMessages((prev) => {
        const next = [...prev];
        const current = next[assistantMessageIndex];

        if (current) {
          next[assistantMessageIndex] = {
            ...current,
            content:
              error instanceof Error
                ? `请求失败：${error.message}`
                : "请求失败，请稍后重试。",
          };
        }

        return next;
      });

      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function handleStop() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);

    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];

      if (last?.role === "assistant" && last.content.trim()) {
        next[next.length - 1] = {
          ...last,
          content: `${last.content}\n\n_已停止生成_`,
        };
      }

      if (last?.role === "assistant" && !last.content.trim()) {
        next[next.length - 1] = {
          ...last,
          content: "_已停止生成_",
        };
      }

      return next;
    });
  }

  function handleClear() {
    setMessages([]);
    setConversationId(undefined);
    clearChatState();
  }

  return (
    <div className="app-shell">
      <div className="app-background" />
      <div className="app-header-copy">
        <h1>Frontend AI Assistant</h1>
        <p>基于 Dify + DeepSeek 的前端知识库助手</p>
      </div>
      <main className="app-main">
        <ChatWindow
          messages={messages}
          loading={loading}
          onExampleClick={(question) => handleSend(question)}
        />
      </main>

      <ChatInput
        value={input}
        loading={loading}
        onChange={setInput}
        onSend={handleSend}
        onClear={handleClear}
        onStop={handleStop}
      />
    </div>
  );
}

export default App;
