export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

export type ChatRequestContext = {
  conversationId?: string
  user?: string
}

export type Source = {
  datasetName?: string
  documentName?: string
  content?: string
}
