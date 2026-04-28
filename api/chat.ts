import type { VercelRequest, VercelResponse } from '@vercel/node'

const DIFY_API_URL =
  process.env.DIFY_API_URL || 'https://api.dify.ai/v1/chat-messages'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const DIFY_API_KEY = process.env.DIFY_API_KEY

  if (!DIFY_API_KEY) {
    return res.status(500).json({ error: 'Missing DIFY_API_KEY' })
  }

  const { message, conversationId } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' })
  }

  try {
    const difyResponse = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: 'blocking',
        conversation_id: conversationId || '',
        user: 'vercel-demo-user',
      }),
    })

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text()
      return res.status(difyResponse.status).json({
        error: 'Dify API request failed',
        detail: errorText,
      })
    }

    const data = await difyResponse.json()

    return res.status(200).json({
      answer: data.answer,
      conversationId: data.conversation_id,
      sources: data.metadata?.retriever_resources || [],
      raw: data,
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
