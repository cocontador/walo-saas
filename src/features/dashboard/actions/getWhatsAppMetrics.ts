'use server'

import type { DateRange } from '../schemas/dateRange.schema'

export type WhatsAppMetrics = {
    clicks: number
}

// Stub hasta que WALO-063 agregue WhatsAppClickEvent al schema
export async function getWhatsAppMetrics(_range: DateRange): Promise<WhatsAppMetrics> {
    return { clicks: 0 }
}
