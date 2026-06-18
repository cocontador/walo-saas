'use server'

import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'
import type { DateRange } from '../schemas/dateRange.schema'

export type SalesSummary = {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
}

export async function getSalesSummary(range: DateRange): Promise<SalesSummary> {
    const storeId = await getUserStoreId()
    if (!storeId) return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 }

    const orders = await prisma.order.findMany({
        where: {
            storeId,
            status: 'PAID',
            createdAt: { gte: range.from, lte: range.to },
        },
        select: { totalAmount: true },
    })

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    return { totalOrders, totalRevenue, averageOrderValue }
}
