import { prisma } from '../db/prisma'

export type ChatRole = 'user' | 'assistant' | 'system'

export interface CreateSessionInput {
  title?: string
}

export interface UpdateSessionInput {
  title?: string
  conversationId?: string
}

export interface CreateMessageInput {
  role: ChatRole
  content: string
  sources?: unknown
}

export async function getSessions() {
  return prisma.chatSession.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  })
}

export async function createSession(input: CreateSessionInput = {}) {
  return prisma.chatSession.create({
    data: {
      title: input.title?.trim() || '新会话',
    },
  })
}

export async function getSessionById(id: string) {
  return prisma.chatSession.findUnique({
    where: {
      id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })
}

export async function updateSession(id: string, input: UpdateSessionInput) {
  return prisma.chatSession.update({
    where: {
      id,
    },
    data: {
      ...(input.title !== undefined
        ? {
            title: input.title.trim() || '新会话',
          }
        : {}),
      ...(input.conversationId !== undefined
        ? {
            conversationId: input.conversationId || null,
          }
        : {}),
    },
  })
}

export async function deleteSession(id: string) {
  return prisma.chatSession.delete({
    where: {
      id,
    },
  })
}

export async function createSessionMessage(
  sessionId: string,
  input: CreateMessageInput
) {
  return prisma.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        sessionId,
        role: input.role,
        content: input.content,
        sources:
          input.sources === undefined ? null : JSON.stringify(input.sources),
      },
    })

    await tx.chatSession.update({
      where: {
        id: sessionId,
      },
      data: {
        updatedAt: new Date(),
      },
    })

    return message
  })
}
