export type ChatRequestContext = {
  conversationId?: string
  user?: string
}

export type Source = {
  datasetName?: string
  documentName?: string
  content?: string
}

export type ChatSession = {
  id: string
  title: string
  messages: Message[]
  conversationId?: string
  createdAt: number
  updatedAt: number
  isTitleManuallyEdited?: boolean
}

export type ChatRole = 'user' | 'assistant' | 'system'
export interface Message {
  id?: string
  role: ChatRole
  content: string
  createdAt?: number
  updatedAt?: number
  metadata?: unknown
  sources?: Source[]
}
