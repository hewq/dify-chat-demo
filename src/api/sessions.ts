import type { Source } from '../types/chat'

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ApiChatMessage {
  id: string
  sessionId: string
  role: ChatRole
  content: string
  sources?: string | null
  createdAt: string
}

export interface ApiChatSession {
  id: string
  title: string
  conversationId?: string | null
  createdAt: string
  updatedAt: string
  messages?: ApiChatMessage[]
  _count?: {
    messages: number
  }
}

interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = `请求失败：${response.status}`

    try {
      const errorData = await response.json()
      message = errorData.message || message
    } catch {
      // ignore
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const result = (await response.json()) as ApiResponse<T>

  if (result.code !== 0) {
    throw new Error(result.message || '请求失败')
  }

  return result.data
}

export function fetchSessions() {
  return request<ApiChatSession[]>('/api/sessions')
}

export function createSession(title?: string) {
  return request<ApiChatSession>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({
      title,
    }),
  })
}

export function fetchSession(id: string) {
  return request<ApiChatSession>(`/api/sessions/${id}`)
}

export function updateSession(
  id: string,
  data: {
    title?: string
    conversationId?: string
  }
) {
  return request<ApiChatSession>(`/api/sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteSession(id: string) {
  return request<void>(`/api/sessions/${id}`, {
    method: 'DELETE',
  })
}

export function createSessionMessage(
  sessionId: string,
  data: {
    role: ChatRole
    content: string
    sources?: Source[]
  }
) {
  return request<ApiChatMessage>(`/api/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
