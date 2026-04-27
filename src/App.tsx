import { useEffect, useRef, useState } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { Sidebar } from "./components/Sidebar";
import { sendMessageToDifyStream } from "./api/difyStream";
import type { ChatSession, Message } from "./types/chat";
import "./index.css";
import {
  createEmptySession,
  loadChatState,
  saveChatState,
  updateSessionTitle,
} from "./utils/storage";

function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const initialState = loadChatState();

  const [sessions, setSessions] = useState<ChatSession[]>(initialState.sessions);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    initialState.activeSessionId,
  );
  const activeSession =
    sessions.find((session) => session.id === activeSessionId) || sessions[0];

  const messages = activeSession?.messages || [];
  const conversationId = activeSession?.conversationId;

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    saveChatState({
      sessions,
      activeSessionId,
    });
  }, [sessions, activeSessionId]);

  function updateActiveSession(updater: (session: ChatSession) => ChatSession) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId ? updater(session) : session,
      ),
    );
  }

  function setActiveMessages(updater: (messages: Message[]) => Message[]) {
    updateActiveSession((session) => {
      const nextMessages = updater(session.messages);

      return updateSessionTitle({
        ...session,
        messages: nextMessages,
        updatedAt: Date.now(),
      });
    });
  }

  function setActiveConversationId(nextConversationId: string | undefined) {
    updateActiveSession((session) => ({
      ...session,
      conversationId: nextConversationId,
      updatedAt: Date.now(),
    }));
  }

  async function handleSend(question?: string) {
    const text = typeof question === "string" ? question.trim() : input.trim();

    if (!text || loading) {
      return;
    }

    setInput("");
    setLoading(true);

    const assistantMessageIndex = messages.length + 1;

    setActiveMessages((prev) => [
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
            setActiveMessages((prev) => {
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
          onConversationId: (id) => setActiveConversationId(id),
          onSources: (sources) => {
            setActiveMessages((prev) => {
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
            abortControllerRef.current = null;
          },
        },
        abortController.signal,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error(error);

      setActiveMessages((prev) => {
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

    setActiveMessages((prev) => {
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

  function handleNewSession() {
    const session = createEmptySession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
  }

  function handleSelectSession(sessionId: string) {
    if (loading) return;
    setActiveSessionId(sessionId);
  }

  function handleDeleteSession(sessionId: string) {
    if (loading) return;

    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== sessionId);

      if (next.length === 0) {
        const session = createEmptySession();
        setActiveSessionId(session.id);
        return [session];
      }

      if (sessionId === activeSessionId) {
        setActiveSessionId(next[0].id);
      }

      return next;
    });
  }

  function handleClear() {
    updateActiveSession((session) =>
      updateSessionTitle({
        ...session,
        messages: [],
        conversationId: undefined,
        updatedAt: Date.now(),
      }),
    );
  }

  function handleRenameSession(sessionId: string, title: string) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              title,
              isTitleManuallyEdited: true,
              updatedAt: Date.now(),
            }
          : session,
      ),
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />

      <div className="app-stage">
        <header className="app-header">
          <div className="app-header-title">
            <h1>Frontend AI Assistant</h1>
            <span className="app-header-divider" />
            <p>Based on Dify + DeepSeek</p>
          </div>
        </header>

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
    </div>
  );
}

export default App;
