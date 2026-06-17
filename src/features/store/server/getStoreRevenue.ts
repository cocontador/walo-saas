import "server-only"
import { prisma } from "@/lib/prisma"
import { logError } from "@/lib/logger"

export async function getStoreRevenue(storeId: string) {
    try {
        const [orders, whatsappClicks] = await Promise.all([
            prisma.order.findMany({
                where: { storeId, status: 'PAID' },
                select: { totalAmount: true },
            }),
            prisma.whatsappClickEvent.count({
                where: { storeId },
            }),
        ])

        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
        const totalOrders = orders.length

        return {
            success: true,
            data: { totalRevenue, totalOrders, whatsappClicks },
        }
    } catch {
        logError({ event: 'store.revenue.error', scope: 'dashboard', message: 'Error obteniendo métricas' })
        return { success: false, data: null }
    }
}