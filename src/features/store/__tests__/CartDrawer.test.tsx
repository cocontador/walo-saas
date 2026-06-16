import { vi } from 'vitest';

// MOCK GLOBAL PARA EVITAR DATABASE_URL
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findUnique: vi.fn(), findMany: vi.fn() },
    store: { findUnique: vi.fn() },
    paymentAttempt: { findUnique: vi.fn(), update: vi.fn() },
  }
}));

// MOCK DE SERVIDOR PARA COMPONENTES DE CLIENTE
vi.mock('@/features/store/server/createPayment', () => ({ createPaymentIntent: vi.fn() }));
vi.mock('@/features/store/server/trackWhatsappClick', () => ({ trackWhatsappClick: vi.fn() }));

import { describe, expect, it } from 'vitest'
import { buildWhatsAppMessage, buildWhatsAppMessageText } from '@/features/store/components/CartDrawer'
import { CartItem } from '@/features/store/components/CartContext'

describe('CartDrawer - WhatsApp Link Builder (WALO-55 / WALO-56)', () => {
    it('debe construir la URL correctamente con los productos formateados y el total', () => {
        const mockItems: CartItem[] = [
            { id: '1', name: 'Empanada de Pino', price: 2500, quantity: 2 },
            { id: '2', name: 'Bebida Lata', price: 1000, quantity: 1 }
        ]
        const total = 6000
        const phone = '+56987654321'
        const storeName = 'La Cocina de Juan'

        const url = buildWhatsAppMessage(phone, storeName, mockItems, total)
        expect(url).toContain('https://wa.me/+56987654321')

        const urlObj = new URL(url)
        const decodedText = decodeURIComponent(urlObj.searchParams.get('text') || '')

        expect(decodedText).toContain('Hola, me gustaría hacer un pedido en *La Cocina de Juan*:')
        expect(decodedText).toMatch(/2x Empanada de Pino \(\$\s*5\.000\)/)
        expect(decodedText).toMatch(/1x Bebida Lata \(\$\s*1\.000\)/)
        expect(decodedText).toMatch(/\*Total a pagar: \$\s*6\.000\*/)
    })

    it('debe insertar las instrucciones especiales al final', () => {
        const mockItems: CartItem[] = [{ id: '1', name: 'Pan de Masa Madre', price: 3000, quantity: 1 }]
        const notes = 'Por favor, enviar por la entrada lateral.'
        const url = buildWhatsAppMessage('+56912345678', 'Tienda Test', mockItems, 3000, notes)
        const decodedText = decodeURIComponent(new URL(url).searchParams.get('text') || '')
        
        expect(decodedText).toContain('*Instrucciones especiales:*')
        expect(decodedText).toContain('Por favor, enviar por la entrada lateral.')
    })

    // WALO-56 AC1: la preview usa la misma fuente de verdad que la URL
    it('buildWhatsAppMessageText debe producir el mismo texto que decodificar la URL generada por buildWhatsAppMessage', () => {
        const mockItems: CartItem[] = [
            { id: '1', name: 'Empanada de Pino', price: 2500, quantity: 2 }
        ]
        const notes = 'Sin cebolla por favor'

        const text = buildWhatsAppMessageText('La Cocina', mockItems, 5000, notes)
        const url = buildWhatsAppMessage('+56987654321', 'La Cocina', mockItems, 5000, notes)

        // El texto de la preview debe ser idéntico al que viaja dentro de la URL
        const decodedFromUrl = decodeURIComponent(new URL(url).searchParams.get('text') || '')
        expect(text).toBe(decodedFromUrl)
    })
})