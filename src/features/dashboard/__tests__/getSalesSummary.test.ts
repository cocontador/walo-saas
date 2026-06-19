import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSalesSummary } from '../actions/getSalesSummary'
import type { DateRange } from '../schemas/dateRange.schema'

vi.mock('@/server/store', () => ({
    getUserStoreId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            aggregate: vi.fn(),
        },
    },
}))

import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'

const range: DateRange = {
    from: new Date('2026-06-01T00:00:00.000Z'),
    to: new Date('2026-06-17T23:59:59.999Z'),
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('getSalesSummary', () => {
    it('retorna ceros si el usuario no tiene tienda asociada', async () => {
        vi.mocked(getUserStoreId).mockResolvedValue(null)

        const result = await getSalesSummary(range)

        expect(result).toEqual({ totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 })
        expect(prisma.order.aggregate).not.toHaveBeenCalled()
    })

    it('retorna ceros si no hay órdenes PAID en el período', async () => {
        vi.mocked(getUserStoreId).mockResolvedValue('store-1')
        vi.mocked(prisma.order.aggregate).mockResolvedValue({ _count: { _all: 0 }, _sum: { totalAmount: null } } as never)

        const result = await getSalesSummary(range)

        expect(result).toEqual({ totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 })
    })

    it('calcula totales correctamente con órdenes PAID', async () => {
        vi.mocked(getUserStoreId).mockResolvedValue('store-1')
        vi.mocked(prisma.order.aggregate).mockResolvedValue({ _count: { _all: 3 }, _sum: { totalAmount: 60000 } } as never)

        const result = await getSalesSummary(range)

        expect(result.totalOrders).toBe(3)
        expect(result.totalRevenue).toBe(60000)
        expect(result.averageOrderValue).toBe(20000)
    })

    it('filtra solo por la tienda del usuario autenticado', async () => {
        vi.mocked(getUserStoreId).mockResolvedValue('store-abc')
        vi.mocked(prisma.order.aggregate).mockResolvedValue({ _count: { _all: 0 }, _sum: { totalAmount: null } } as never)

        await getSalesSummary(range)

        expect(prisma.order.aggregate).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ storeId: 'store-abc', status: 'PAID' }),
            }),
        )
    })
})
