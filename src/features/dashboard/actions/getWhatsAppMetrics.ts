'use server'

import { prisma } from '@/lib/prisma'
import { getUserStoreId } from '@/server/store'
import type { DateRange } from '../schemas/dateRange.schema'

export type WhatsAppMetrics = {
    clicks: number
}

export async function getWhatsAppMetrics(range: DateRange): Promise<WhatsAppMetrics> {
    const storeId = await getUserStoreId()
    if (!storeId) return { clicks: 0 }

    const clicks = await prisma.whatsappClickEvent.count({
        where: {
            storeId,
            createdAt: { gte: range.from, lte: range.to },
        },
    })

    return { clicks }
}
