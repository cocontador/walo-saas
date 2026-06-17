import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getStoreRevenue } from '@/features/store/server/getStoreRevenue' // Ajusta la ruta si es necesario
import { prisma } from '@/lib/prisma'

// 1. Mockeamos el cliente de prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findMany: vi.fn(),
        },
        whatsappClickEvent: {
            count: vi.fn(),
        },
    },
}))

describe('getStoreRevenue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('debe retornar los totales correctamente cuando hay órdenes', async () => {
        // 2. Simulamos la respuesta de Prisma
        const mockOrders = [
            { totalAmount: 1000 },
            { totalAmount: 2000 },
        ]

        vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any)
        vi.mocked(prisma.whatsappClickEvent.count).mockResolvedValue(5)

        const result = await getStoreRevenue('store-123')

        // 3. Verificamos los cálculos
        expect(result.success).toBe(true)
        expect(result.data).toEqual({
            totalRevenue: 3000,
            totalOrders: 2,
            whatsappClicks: 5
        })
    })

    it('debe retornar ceros si no hay órdenes ni clics', async () => {
        vi.mocked(prisma.order.findMany).mockResolvedValue([])
        vi.mocked(prisma.whatsappClickEvent.count).mockResolvedValue(0)

        const result = await getStoreRevenue('store-123')

        expect(result.success).toBe(true)
        expect(result.data).toEqual({
            totalRevenue: 0,
            totalOrders: 0,
            whatsappClicks: 0
        })
    })

    it('debe manejar errores del servidor gracefully', async () => {
        vi.mocked(prisma.order.findMany).mockRejectedValue(new Error('DB Error'))

        const result = await getStoreRevenue('store-123')

        expect(result.success).toBe(false)
        expect(result.data).toBeNull()
    })
})