import { useState, useEffect } from "react";
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
      await sendMessageToDifyStream(text, conversationId, {
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
      });
    } catch (error) {
      console.error(error);

      setMessages((prev) => {
        const next = [...prev];
        const current = next[assistantMessageIndex];

        if (current) {
          next[assistantMessageIndex] = {
            ...current,
            content: "请求失败，请稍后重试。",
          };
        }

        return next;
      });

      setLoading(false);
    }
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
      />
    </div>
  );
}

export default App;
