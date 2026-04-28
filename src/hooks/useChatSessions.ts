import { useEffect, useMemo, useState } from 'react'
import type { ChatSession, Message } from '../types/chat'
import {
  createEmptySession,
  loadChatState,
  saveChatState,
  updateSessionTitle,
} from '../utils/storage'

export function useChatSessions() {
  const initialState = loadChatState()

  const [sessions, setSessions] = useState<ChatSession[]>(initialState.sessions)
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    initialState.activeSessionId
  )

  const activeSession = useMemo(() => {
    return (
      sessions.find((session) => session.id === activeSessionId) || sessions[0]
    )
  }, [sessions, activeSessionId])

  const messages = activeSession?.messages || []
  const conversationId = activeSession?.conversationId

  useEffect(() => {
    saveChatState({
      activeSessionId,
      sessions,
    })
  }, [activeSessionId, sessions])

  function updateActiveSession(updater: (session: ChatSession) => ChatSession) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId ? updater(session) : session
      )
    )
  }

  function setActiveMessages(updater: (messages: Message[]) => Message[]) {
    updateActiveSession((session) => {
      const nextMessages = updater(session.messages)

      return updateSessionTitle({
        ...session,
        messages: nextMessages,
        updatedAt: Date.now(),
      })
    })
  }

  function setActiveConversationId(conversationId: string | undefined) {
    updateActiveSession((session) => ({
      ...session,
      conversationId,
      updatedAt: Date.now(),
    }))
  }

  function createSession() {
    const session = createEmptySession()

    setSessions((prev) => [session, ...prev])
    setActiveSessionId(session.id)
  }

  function selectSession(sessionId: string) {
    setActiveSessionId(sessionId)
  }

  function deleteSession(sessionId: string) {
    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== sessionId)

      if (next.length === 0) {
        const session = createEmptySession()
        setActiveSessionId(session.id)
        return [session]
      }

      if (sessionId === activeSessionId) {
        setActiveSessionId(next[0].id)
      }

      return next
    })
  }

  function renameSession(sessionId: string, title: string) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              title,
              isTitleManuallyEdited: true,
              updatedAt: Date.now(),
            }
          : session
      )
    )
  }

  function clearActiveSession() {
    updateActiveSession((session) =>
      updateSessionTitle({
        ...session,
        messages: [],
        conversationId: undefined,
        updatedAt: Date.now(),
      })
    )
  }

  return {
    sessions,
    activeSession,
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
  }
}
