import { useEffect, useRef, useState } from 'react'
import { createSessionMessage, updateSession } from './api/sessions'
import { ChatInput } from './components/ChatInput'
import { ChatWindow } from './components/ChatWindow'
import { Sidebar } from './components/Sidebar'
import { useChatSessions } from './hooks/useChatSessions'
import { useDifyStreamChat } from './hooks/useDifyStreamChat'
import './index.css'

function createSessionTitle(content: string) {
  const title = content.trim().replace(/\s+/g, ' ')

  if (!title) return '新会话'

  return title.length > 20 ? `${title.slice(0, 20)}...` : title
}

function App() {
  const [input, setInput] = useState('')

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
  } = useChatSessions()

  const messagesRef = useRef(messages)
  const conversationIdRef = useRef(conversationId)
  const activeSessionIdRef = useRef(activeSessionId)

  useEffect(() => {
    messagesRef.current = messages
    conversationIdRef.current = conversationId
    activeSessionIdRef.current = activeSessionId
  }, [messages, conversationId, activeSessionId])

  const { loading, send, stop } = useDifyStreamChat({
    getMessages: () => messagesRef.current,
    getConversationId: () => conversationIdRef.current,
    setMessages: setActiveMessages,
    setConversationId: setActiveConversationId,
    onUserMessageCreated: async (content) => {
      const sessionId = activeSessionIdRef.current

      if (!sessionId) return

      await createSessionMessage(sessionId, {
        role: 'user',
        content,
      })

      if (messagesRef.current.length === 0) {
        const title = createSessionTitle(content)

        await updateSession(sessionId, {
          title,
        })
      }
    },
    onAssistantMessageCreated: async ({ content, sources }) => {
      const sessionId = activeSessionIdRef.current

      if (!sessionId || !content.trim()) return

      await createSessionMessage(sessionId, {
        role: 'assistant',
        content,
        sources,
      })
    },
  })

  function handleSend(question?: string) {
    const text = question ?? input

    setInput('')
    void send(text)
  }

  function handleSelectSession(sessionId: string) {
    if (loading) return
    void selectSession(sessionId)
  }

  function handleDeleteSession(sessionId: string) {
    if (loading) return
    void deleteSession(sessionId)
  }

  function handleNewSession() {
    if (loading) return
    void createSession()
  }

  function handleClear() {
    if (loading) return
    void clearActiveSession()
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
  )
}

export default App
