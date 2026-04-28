import { useRef, useState } from "react";
import { ChatInput } from "./components/ChatInput";
import { ChatWindow } from "./components/ChatWindow";
import { Sidebar } from "./components/Sidebar";
import { useChatSessions } from "./hooks/useChatSessions";
import { useDifyStreamChat } from "./hooks/useDifyStreamChat";
import "./index.css";

function App() {
  const [input, setInput] = useState("");

  const {
    sessions,
    activeSessionId,
    messages,
    conversationId,
    setActiveMessages,
    setActiveConversationId,
    createSession,
    selectSession,
    deleteSession,
    renameSession,
    clearActiveSession,
  } = useChatSessions();

  const messagesRef = useRef(messages);
  const conversationIdRef = useRef(conversationId);

  messagesRef.current = messages;
  conversationIdRef.current = conversationId;

  const { loading, send, stop } = useDifyStreamChat({
    getMessages: () => messagesRef.current,
    getConversationId: () => conversationIdRef.current,
    setMessages: setActiveMessages,
    setConversationId: setActiveConversationId,
  });

  function handleSend(question?: string) {
    const text = question ?? input;

    setInput("");
    send(text);
  }

  function handleSelectSession(sessionId: string) {
    if (loading) return;
    selectSession(sessionId);
  }

  function handleDeleteSession(sessionId: string) {
    if (loading) return;
    deleteSession(sessionId);
  }

  function handleNewSession() {
    if (loading) return;
    createSession();
  }

  function handleClear() {
    if (loading) return;
    clearActiveSession();
  }

  return (
    <div className="app-shell">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={renameSession}
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
          onSend={() => handleSend()}
          onClear={handleClear}
          onStop={stop}
        />
      </div>
    </div>
  );
}

export default App;
