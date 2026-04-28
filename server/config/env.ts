import dotenv from 'dotenv'

dotenv.config()

function requireEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const env = {
  port: Number(process.env.PORT || 3001),
  difyApiKey: requireEnv('DIFY_API_KEY'),
  difyApiUrl:
    process.env.DIFY_API_URL || 'https://api.dify.ai/v1/chat-messages',
  difyUser: process.env.DIFY_USER || 'vite-demo-user',
}