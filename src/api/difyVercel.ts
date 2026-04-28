export type VercelChatSource = {
  dataset_name?: string
  document_name?: string
  content?: string
}

export type VercelChatResponse = {
  answer: string
  conversationId?: string
  sources?: VercelChatSource[]
}

export async function sendMessageToVercelDify(
  message: string,
  conversationId?: string
): Promise<VercelChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationId,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || '请求失败')
  }

  return response.json()
}
