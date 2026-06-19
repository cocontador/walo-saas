'use server'

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

    const { prisma } = await import('@/lib/prisma')

    const result = await prisma.order.aggregate({
        where: {
            storeId,
            status: 'PAID',
            createdAt: { gte: range.from, lte: range.to },
        },
        _count: { _all: true },
        _sum: { totalAmount: true },
    })

    const totalOrders = result._count._all
    const totalRevenue = result._sum.totalAmount ?? 0
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

    return { totalOrders, totalRevenue, averageOrderValue }
}
