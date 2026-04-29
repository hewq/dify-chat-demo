import { useState } from 'react'
import { sendMessageToVercelDify } from '../api/difyVercel'
import type { Message, Source } from '../types/chat'

type UseDifyBlockingChatOptions = {
  getMessages: () => Message[]
  getConversationId: () => string | undefined
  setMessages: (updater: (messages: Message[]) => Message[]) => void
  setConversationId: (conversationId: string | undefined) => void
  onUserMessageCreated?: (content: string) => Promise<void>
  onAssistantMessageCreated?: (message: {
    content: string
    sources?: Source[]
  }) => Promise<void>
}

export function useDifyBlockingChat({
  getMessages,
  getConversationId,
  setMessages,
  setConversationId,
  onUserMessageCreated,
  onAssistantMessageCreated,
}: UseDifyBlockingChatOptions) {
  const [loading, setLoading] = useState(false)

  async function send(text: string) {
    const message = text.trim()
    if (!message || loading) return

    setLoading(true)

    const currentMessages = getMessages()
    const assistantMessageIndex = currentMessages.length + 1

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message, createdAt: Date.now() },
      { role: 'assistant', content: '', createdAt: Date.now() },
    ])

    try {
      await onUserMessageCreated?.(message)

      const result = await sendMessageToVercelDify(message, getConversationId())

      setConversationId(result.conversationId)

      const sources = result.sources?.map((source) => ({
        datasetName: source.dataset_name,
        documentName: source.document_name,
        content: source.content,
      }))

      setMessages((prev) => {
        const next = [...prev]
        const current = next[assistantMessageIndex]

        if (current) {
          next[assistantMessageIndex] = {
            ...current,
            content: result.answer,
            sources,
          }
        }

        return next
      })

      await onAssistantMessageCreated?.({
        content: result.answer,
        sources,
      })
    } catch (error) {
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
    }
  }

  function stop() {
    setLoading(false)
  }

  return {
    loading,
    send,
    stop,
  }
}
