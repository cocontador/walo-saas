import "server-only"
import { prisma } from "@/lib/prisma"

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
    } catch (error) {
        console.error('Error obteniendo métricas:', error)
        return { success: false, data: null }
    }
}