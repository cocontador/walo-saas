import { describe, expect, it } from 'vitest'
import { buildWhatsAppMessage } from '@/features/store/components/CartDrawer'
import { CartItem } from '@/features/store/components/CartContext'

describe('CartDrawer - WhatsApp Link Builder (WALO-55 / WALO-56)', () => {
    it('debe construir la URL correctamente con los productos formateados y el total (WALO-494, WALO-495, WALO-497)', () => {
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

    it('debe conservar la estructura mínima e inyectar el mensaje editado del usuario (WALO-499, WALO-500)', () => {
        const mockItems: CartItem[] = [{ id: '1', name: 'Pan de Masa Madre', price: 3000, quantity: 1 }]
        const notes = 'Por favor, enviar por la entrada lateral. Timbre en mal estado.'
        
        // Ejecutamos la función inyectando las notas (lo que hace el textarea)
        const url = buildWhatsAppMessage('+56912345678', 'Tienda Test', mockItems, 3000, notes)
        
        const urlObj = new URL(url)
        const decodedText = decodeURIComponent(urlObj.searchParams.get('text') || '')
        
        // Verificamos que la estructura base no se corrompió
        expect(decodedText).toMatch(/1x Pan de Masa Madre \(\$\s*3\.000\)/)
        expect(decodedText).toMatch(/\*Total a pagar: \$\s*3\.000\*/)
        
        // Verificamos que las instrucciones se insertaron correctamente al final
        expect(decodedText).toContain('*Instrucciones especiales:*')
        expect(decodedText).toContain('Por favor, enviar por la entrada lateral. Timbre en mal estado.')
    })

    it('debe limpiar cualquier caracter no numérico del teléfono ingresado', () => {
        const url = buildWhatsAppMessage('+56 9 8765-4321', 'Test Store', [], 0)
        expect(url).toContain('https://wa.me/+56987654321')
    })

    it('debe retornar "#" si no se provee un teléfono válido', () => {
        const url = buildWhatsAppMessage('', 'Test Store', [], 0)
        expect(url).toBe('#')
    })
})