export type Message = {
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

export type ChatSession = {
  id: string
  title: string
  messages: Message[]
  conversationId?: string
  createdAt: number
  updatedAt: number
  isTitleManuallyEdited?: boolean
}
