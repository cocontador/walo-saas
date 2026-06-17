import { describe, it, expect } from 'vitest'
import { getSalesSummary } from '../actions/getSalesSummary'
import type { DateRange } from '../schemas/dateRange.schema'

const range: DateRange = {
    from: new Date('2026-06-01T00:00:00.000Z'),
    to: new Date('2026-06-17T23:59:59.999Z'),
}

describe('getSalesSummary (stub hasta merge de feature/pagos)', () => {
    it('retorna ceros mientras el modelo Order no esté disponible', async () => {
        const result = await getSalesSummary(range)

        expect(result.totalOrders).toBe(0)
        expect(result.totalRevenue).toBe(0)
        expect(result.averageOrderValue).toBe(0)
    })

    it('acepta cualquier DateRange sin error', async () => {
        const shortRange: DateRange = {
            from: new Date('2026-06-17T00:00:00.000Z'),
            to: new Date('2026-06-17T23:59:59.999Z'),
        }
        await expect(getSalesSummary(shortRange)).resolves.toBeDefined()
    })
})
