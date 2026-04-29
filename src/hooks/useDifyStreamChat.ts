import { useRef, useState } from 'react'
import { sendMessageToDifyStream } from '../api/difyStream'
import type { Message, Source } from '../types/chat'

type UseDifyStreamChatOptions = {
  getMessages: () => Message[]
  getConversationId: () => string | undefined
  setMessages: (updater: (messages: Message[]) => Message[]) => void
  setConversationId: (conversationId: string | undefined) => void
  onUserMessageCreated?: (content: string) => Promise<void>
  onAssistantMessageCreated?: (message: {
    content: string
    sources?: Source[]
    stopped?: boolean
  }) => Promise<void>
}

export function useDifyStreamChat({
  getMessages,
  getConversationId,
  setMessages,
  setConversationId,
  onUserMessageCreated,
  onAssistantMessageCreated,
}: UseDifyStreamChatOptions) {
  const [loading, setLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const assistantMessageIndexRef = useRef<number | null>(null)
  const assistantContentRef = useRef('')
  const assistantSourcesRef = useRef<Source[] | undefined>(undefined)
  const stoppedRef = useRef(false)
  const persistedAssistantRef = useRef(false)

  async function persistAssistantMessage() {
    if (persistedAssistantRef.current) return

    const content = assistantContentRef.current.trim()
    const sources = assistantSourcesRef.current

    if (!content && !stoppedRef.current) return

    persistedAssistantRef.current = true

    await onAssistantMessageCreated?.({
      content: stoppedRef.current
        ? content
          ? `${content}\n\n_已停止生成_`
          : '_已停止生成_'
        : content,
      sources,
      stopped: stoppedRef.current,
    })
  }

  async function send(text: string) {
    const message = text.trim()

    if (!message || loading) return

    setLoading(true)
    stoppedRef.current = false
    persistedAssistantRef.current = false
    assistantContentRef.current = ''
    assistantSourcesRef.current = undefined

    const currentMessages = getMessages()
    const assistantMessageIndex = currentMessages.length + 1
    assistantMessageIndexRef.current = assistantMessageIndex

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message, createdAt: Date.now() },
      { role: 'assistant', content: '', createdAt: Date.now() },
    ])

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      await onUserMessageCreated?.(message)

      await sendMessageToDifyStream(
        message,
        getConversationId(),
        {
          onMessage: (chunk) => {
            assistantContentRef.current += chunk

            setMessages((prev) => {
              const next = [...prev]
              const current = next[assistantMessageIndex]

              if (current) {
                next[assistantMessageIndex] = {
                  ...current,
                  content: current.content + chunk,
                }
              }

              return next
            })
          },
          onConversationId: (id) => {
            setConversationId(id)
          },
          onSources: (sources) => {
            const mappedSources = sources.map((source) => ({
              datasetName: source.dataset_name,
              documentName: source.document_name,
              content: source.content,
            }))

            assistantSourcesRef.current = mappedSources

            setMessages((prev) => {
              const next = [...prev]
              const current = next[assistantMessageIndex]

              if (current) {
                next[assistantMessageIndex] = {
                  ...current,
                  sources: mappedSources,
                }
              }

              return next
            })
          },
          onError: (error) => {
            setMessages((prev) => {
              const next = [...prev]
              const current = next[assistantMessageIndex]

              if (current) {
                next[assistantMessageIndex] = {
                  ...current,
                  content: `请求失败：${error.message}`,
                }
              }

              return next
            })
          },
          onDone: () => {
            setLoading(false)
            abortControllerRef.current = null
          },
        },
        abortController.signal
      )

      await persistAssistantMessage()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        await persistAssistantMessage()
        return
      }

      setMessages((prev) => {
        const next = [...prev]
        const current = next[assistantMessageIndex]

        if (current) {
          next[assistantMessageIndex] = {
            ...current,
            content:
              error instanceof Error
                ? `请求失败：${error.message}`
                : '请求失败，请稍后重试。',
          }
        }

        return next
      })
    } finally {
      setLoading(false)
      abortControllerRef.current = null
      assistantMessageIndexRef.current = null
    }
  }

  async function stop() {
    stoppedRef.current = true
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setLoading(false)

    setMessages((prev) => {
      const next = [...prev]
      const assistantMessageIndex = assistantMessageIndexRef.current
      const current =
        assistantMessageIndex === null
          ? next[next.length - 1]
          : next[assistantMessageIndex]

      if (!current || current.role !== 'assistant') return next

      const stoppedContent = current.content.trim()
        ? `${current.content}\n\n_已停止生成_`
        : '_已停止生成_'

      if (assistantMessageIndex === null) {
        next[next.length - 1] = {
          ...current,
          content: stoppedContent,
        }
      } else {
        next[assistantMessageIndex] = {
          ...current,
          content: stoppedContent,
        }
      }

      return next
    })

    await persistAssistantMessage()
  }

  return {
    loading,
    send,
    stop,
  }
}
