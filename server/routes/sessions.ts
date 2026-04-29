import { Router } from 'express'
import {
  createSession,
  createSessionMessage,
  deleteSession,
  getSessionById,
  getSessions,
  updateSession,
  type ChatRole,
} from '../services/session'

export const sessionsRouter = Router()

const validRoles: ChatRole[] = ['user', 'assistant', 'system']

sessionsRouter.get('/', async (_req, res, next) => {
  try {
    const sessions = await getSessions()

    res.json({
      code: 0,
      data: sessions,
    })
  } catch (error) {
    next(error)
  }
})

sessionsRouter.post('/', async (req, res, next) => {
  try {
    const { title } = req.body ?? {}

    if (title !== undefined && typeof title !== 'string') {
      res.status(400).json({
        code: 400,
        message: 'title 必须是字符串',
      })
      return
    }

    const session = await createSession({
      title,
    })

    res.status(201).json({
      code: 0,
      data: session,
    })
  } catch (error) {
    next(error)
  }
})

sessionsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const session = await getSessionById(id)

    if (!session) {
      res.status(404).json({
        code: 404,
        message: '会话不存在',
      })
      return
    }

    res.json({
      code: 0,
      data: session,
    })
  } catch (error) {
    next(error)
  }
})

sessionsRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, conversationId } = req.body ?? {}

    if (title !== undefined && typeof title !== 'string') {
      res.status(400).json({
        code: 400,
        message: 'title 必须是字符串',
      })
      return
    }

    if (conversationId !== undefined && typeof conversationId !== 'string') {
      res.status(400).json({
        code: 400,
        message: 'conversationId 必须是字符串',
      })
      return
    }

    const session = await updateSession(id, {
      title,
      conversationId,
    })

    res.json({
      code: 0,
      data: session,
    })
  } catch (error) {
    next(error)
  }
})

sessionsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    await deleteSession(id)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

sessionsRouter.post('/:id/messages', async (req, res, next) => {
  try {
    const { id } = req.params
    const { role, content, sources } = req.body ?? {}

    if (!validRoles.includes(role)) {
      res.status(400).json({
        code: 400,
        message: 'role 必须是 user、assistant 或 system',
      })
      return
    }

    if (typeof content !== 'string' || !content.trim()) {
      res.status(400).json({
        code: 400,
        message: 'content 不能为空',
      })
      return
    }

    const session = await getSessionById(id)

    if (!session) {
      res.status(404).json({
        code: 404,
        message: '会话不存在',
      })
      return
    }

    const message = await createSessionMessage(id, {
      role,
      content,
      sources,
    })

    res.status(201).json({
      code: 0,
      data: message,
    })
  } catch (error) {
    next(error)
  }
})
