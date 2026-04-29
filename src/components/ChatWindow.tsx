import type { Message } from '../types/chat'
import { ChatMessage } from './ChatMessage'
import { EmptyState } from './EmptyState'

type ChatWindowProps = {
  messages: Message[]
  loading: boolean
  onExampleClick: (question: string) => void
}

function hasVisibleAssistantContent(content: string) {
  return (
    content
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<think>[\s\S]*$/gi, '')
      .trim().length > 0
  )
}

function isRenderableMessage(
  message: Message
): message is Message & { role: 'user' | 'assistant' } {
  return (
    message.role === 'user' ||
    (message.role === 'assistant' &&
      hasVisibleAssistantContent(message.content))
  )
}

export function ChatWindow({
  messages,
  loading,
  onExampleClick,
}: ChatWindowProps) {
  const visibleMessages = messages.filter(isRenderableMessage)
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant')
  const currentAssistantHasContent = lastAssistantMessage
    ? hasVisibleAssistantContent(lastAssistantMessage.content)
    : false

  if (messages.length === 0) {
    return <EmptyState onExampleClick={onExampleClick} />
  }

  return (
    <div className="chat-window">
      <div className="chat-window-inner">
        {visibleMessages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            sources={message.sources}
          />
        ))}
        {loading && !currentAssistantHasContent && (
          <div className="typing">AI 正在生成回复...</div>
        )}
      </div>
    </div>
  )
}
