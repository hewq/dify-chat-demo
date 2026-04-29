import type { ApiChatMessage, ApiChatSession } from '../api/sessions'
import type { ChatSession, Message, Source } from '../types/chat'

function parseSources(sources?: string | null): Source[] | undefined {
  if (!sources) return undefined

  try {
    const parsed = JSON.parse(sources)

    if (Array.isArray(parsed)) {
      return parsed as Source[]
    }

    return undefined
  } catch {
    return undefined
  }
}

export function mapApiMessageToChatMessage(message: ApiChatMessage): Message {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    sources: parseSources(message.sources),
    createdAt: new Date(message.createdAt).getTime(),
  }
}

export function mapApiSessionToChatSession(
  session: ApiChatSession
): ChatSession {
  return {
    id: session.id,
    title: session.title,
    conversationId: session.conversationId ?? undefined,
    messages: session.messages?.map(mapApiMessageToChatMessage) ?? [],
    createdAt: new Date(session.createdAt).getTime(),
    updatedAt: new Date(session.updatedAt).getTime(),
    isTitleManuallyEdited: false,
  }
}
