import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createSession as createSessionApi,
  deleteSession as deleteSessionApi,
  fetchSession,
  fetchSessions,
  updateSession,
} from '../api/sessions'
import type { ChatSession, Message } from '../types/chat'
import { mapApiSessionToChatSession } from '../utils/sessionMapper'

function generateSessionTitle(content: string) {
  const title = content.trim().replace(/\s+/g, ' ')

  if (!title) return '新会话'

  return title.length > 20 ? `${title.slice(0, 20)}...` : title
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [sessionError, setSessionError] = useState('')

  const activeSession = useMemo(() => {
    return sessions.find((session) => session.id === activeSessionId)
  }, [sessions, activeSessionId])

  const messages = activeSession?.messages ?? []
  const conversationId = activeSession?.conversationId

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true)
    setSessionError('')

    try {
      const apiSessions = await fetchSessions()
      const mappedSessions = apiSessions.map(mapApiSessionToChatSession)

      if (mappedSessions.length > 0) {
        const firstSessionId = mappedSessions[0].id
        const apiActiveSession = await fetchSession(firstSessionId)
        const activeSessionWithMessages =
          mapApiSessionToChatSession(apiActiveSession)

        setSessions(
          mappedSessions.map((session) =>
            session.id === firstSessionId ? activeSessionWithMessages : session
          )
        )
        setActiveSessionId(firstSessionId)
        return
      }

      const apiSession = await createSessionApi('新会话')
      const session = mapApiSessionToChatSession(apiSession)

      setSessions([session])
      setActiveSessionId(session.id)
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : '加载会话失败')
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  const createSession = useCallback(async () => {
    setSessionError('')

    try {
      const apiSession = await createSessionApi('新会话')
      const session = mapApiSessionToChatSession(apiSession)

      setSessions((prev) => [session, ...prev])
      setActiveSessionId(session.id)
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : '创建会话失败')
    }
  }, [])

  const selectSession = useCallback(async (sessionId: string) => {
    setSessionError('')

    try {
      const apiSession = await fetchSession(sessionId)
      const session = mapApiSessionToChatSession(apiSession)

      setSessions((prev) =>
        prev.map((item) => (item.id === sessionId ? session : item))
      )
      setActiveSessionId(sessionId)
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : '切换会话失败')
    }
  }, [])

  const deleteSession = useCallback(
    async (sessionId: string) => {
      setSessionError('')

      try {
        await deleteSessionApi(sessionId)

        const nextSessions = sessions.filter(
          (session) => session.id !== sessionId
        )

        if (nextSessions.length === 0) {
          const apiSession = await createSessionApi('新会话')
          const session = mapApiSessionToChatSession(apiSession)

          setSessions([session])
          setActiveSessionId(session.id)
          return
        }

        if (activeSessionId === sessionId) {
          const nextActiveSessionId = nextSessions[0].id
          const apiSession = await fetchSession(nextActiveSessionId)
          const nextActiveSession = mapApiSessionToChatSession(apiSession)

          setSessions(
            nextSessions.map((session) =>
              session.id === nextActiveSessionId ? nextActiveSession : session
            )
          )
          setActiveSessionId(nextActiveSessionId)
          return
        }

        setSessions(nextSessions)
      } catch (error) {
        setSessionError(error instanceof Error ? error.message : '删除会话失败')
      }
    },
    [activeSessionId, sessions]
  )

  const renameSession = useCallback(
    async (sessionId: string, title: string) => {
      const normalizedTitle = title.trim()

      if (!normalizedTitle) return

      setSessionError('')

      try {
        const apiSession = await updateSession(sessionId, {
          title: normalizedTitle,
        })
        const updatedSession = mapApiSessionToChatSession(apiSession)

        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  title: updatedSession.title,
                  updatedAt: updatedSession.updatedAt,
                  isTitleManuallyEdited: true,
                }
              : session
          )
        )
      } catch (error) {
        setSessionError(
          error instanceof Error ? error.message : '重命名会话失败'
        )
      }
    },
    []
  )

  const setActiveMessages = useCallback(
    (updater: (messages: Message[]) => Message[]) => {
      if (!activeSessionId) return

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== activeSessionId) return session

          const nextMessages = updater(session.messages)
          const firstUserMessage = nextMessages.find(
            (message) => message.role === 'user'
          )
          const shouldAutoUpdateTitle =
            !session.isTitleManuallyEdited &&
            session.messages.length === 0 &&
            !!firstUserMessage

          return {
            ...session,
            messages: nextMessages,
            title: shouldAutoUpdateTitle
              ? generateSessionTitle(firstUserMessage.content)
              : session.title,
            updatedAt: Date.now(),
          }
        })
      )
    },
    [activeSessionId]
  )

  const setActiveConversationId = useCallback(
    (nextConversationId: string | undefined) => {
      if (!activeSessionId) return

      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                conversationId: nextConversationId,
                updatedAt: Date.now(),
              }
            : session
        )
      )

      void updateSession(activeSessionId, {
        conversationId: nextConversationId,
      })
    },
    [activeSessionId]
  )

  const clearActiveSession = useCallback(async () => {
    if (!activeSessionId) return

    await deleteSession(activeSessionId)
  }, [activeSessionId, deleteSession])

  useEffect(() => {
    // Initial session bootstrap fetches remote data and then updates local state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSessions()
  }, [loadSessions])

  return {
    sessions,
    activeSessionId,
    activeSession,
    messages,
    conversationId,
    loadingSessions,
    sessionError,
    setActiveMessages,
    setActiveConversationId,
    createSession,
    selectSession,
    deleteSession,
    renameSession,
    clearActiveSession,
    loadSessions,
  }
}
