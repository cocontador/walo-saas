import { prisma } from "@/lib/prisma"

export async function logKhipuError(orderId: string, error: any, context: string) {
    console.error(`[KHIPU ERROR] ${context}:`, error)
    await prisma.khipuLog.create({
        data: {
            orderId,
            context,
            message: error instanceof Error ? error.message : JSON.stringify(error),
            createdAt: new Date()
        }
    })
}