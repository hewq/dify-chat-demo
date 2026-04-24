export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ChatRequestContext = {
  conversationId?: string
  user?: string
}
