'use server'

import type { DateRange } from '../schemas/dateRange.schema'

export type SalesSummary = {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
}

// Implementación completa pendiente de merge de feature/pagos (necesita modelo Order)
export async function getSalesSummary(_range: DateRange): Promise<SalesSummary> {
    return { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 }
}
