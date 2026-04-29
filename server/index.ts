import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from './config/env'
import { chatRouter } from './routes/chat'
import { sessionsRouter } from './routes/sessions'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
  })
})

app.use('/api', chatRouter)
app.use('/api/sessions', sessionsRouter)

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    void next
    console.error(error)

    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
)

const clientDistPath = path.resolve(__dirname, '../dist')

app.use(express.static(clientDistPath))

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'))
})

app.listen(env.port, () => {
  console.log(`API server running at http://localhost:${env.port}`)
})
