import { useState } from 'react'
import { sendMessageToVercelDify } from '../api/difyVercel'
import type { Message } from '../types/chat'

type UseDifyBlockingChatOptions = {
  getMessages: () => Message[]
  getConversationId: () => string | undefined
  setMessages: (updater: (messages: Message[]) => Message[]) => void
  setConversationId: (conversationId: string | undefined) => void
}

export function useDifyBlockingChat({
  getMessages,
  getConversationId,
  setMessages,
  setConversationId,
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
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const result = await sendMessageToVercelDify(message, getConversationId())

      setConversationId(result.conversationId)

      setMessages((prev) => {
        const next = [...prev]
        const current = next[assistantMessageIndex]

        if (current) {
          next[assistantMessageIndex] = {
            ...current,
            content: result.answer,
            sources: result.sources?.map((source) => ({
              datasetName: source.dataset_name,
              documentName: source.document_name,
              content: source.content,
            })),
          }
        }

        return next
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
