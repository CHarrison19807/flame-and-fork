import { Session } from "@prisma/client"
import { prisma } from "./prisma"

const idleExpiresAtDurationMs = 1000 * 60 * 60 * 24 * 2 // 2 days
const absoluteExpiresAtDurationMs = 1000 * 60 * 60 * 24 * 14 // 14 days

const idleExpiresAtDate = new Date(Date.now() + idleExpiresAtDurationMs)
const absoluteExpiresAtDate = new Date(Date.now() + absoluteExpiresAtDurationMs)

export const createSession = async (userId: string): Promise<Session> => {
    const newSession = await prisma.session.create({
        data: {
            userId,
            expiresAt: absoluteExpiresAtDate,
            idleExpiresAt: idleExpiresAtDate,
        },
    })
    return newSession;
}

export const getSessionById = async (sessionId: string) => {
    return prisma.session.findUnique({
        where: {
            id: sessionId,
        },
    })
}

export const extendSessionIdleExpiry = async (sessionId: string) => {
    return prisma.session.update({
        where: {
            id: sessionId,
        },
        data: {
            idleExpiresAt: idleExpiresAtDate
        },
    })
}

export const deleteSessionById = async (sessionId: string) => {
    return prisma.session.delete({
        where: {
            id: sessionId,
        },
    })
}

export const deleteSessionsByUserId = async (userId: string) => {
    return prisma.session.deleteMany({
        where: {
            userId,
        },
    })
}

export const deleteExpiredSessions = async () => {
    const now = new Date()
    return prisma.session.deleteMany({
        where: {
            OR: [
                {
                    expiresAt: {
                        lt: now,
                    },
                },
                {
                    idleExpiresAt: {
                        lt: now,
                    },
                },
            ],
        },
    })
}

