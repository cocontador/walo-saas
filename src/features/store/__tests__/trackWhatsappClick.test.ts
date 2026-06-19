import { describe, it, expect, vi } from 'vitest'
import type { WhatsappClickEvent } from '@prisma/client'
import { trackWhatsappClick } from '@/features/store/server/trackWhatsappClick'
import { prisma } from '@/lib/prisma'

// Aseguramos que prisma esté mockeado
vi.mock('@/lib/prisma', () => ({
    prisma: {
        whatsappClickEvent: {
            create: vi.fn(),
        },
    },
}))

describe('WALO-551: Testing métricas WhatsApp', () => {
    it('debe registrar un evento de clic en la base de datos correctamente', async () => {
        // Simulamos que el create de prisma es exitoso
        vi.mocked(prisma.whatsappClickEvent.create).mockResolvedValue({
            id: 'click-123',
            storeId: 'store-1',
            createdAt: new Date(),
        } satisfies WhatsappClickEvent)

        const result = await trackWhatsappClick('store-1')

        // Verificamos que prisma haya sido llamado con los datos correctos
        expect(prisma.whatsappClickEvent.create).toHaveBeenCalledWith({
            data: { storeId: 'store-1' }
        })

        // Verificamos que la acción retorne éxito
        expect(result.success).toBe(true)
    })

    it('debe manejar errores si la persistencia falla', async () => {
        // Simulamos un fallo en la base de datos
        vi.mocked(prisma.whatsappClickEvent.create).mockRejectedValue(new Error('DB Fail'))

        const result = await trackWhatsappClick('store-1')

        // Verificamos que la acción capture el error y retorne false
        expect(result.success).toBe(false)
    })
})
