import { describe, expect, it, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '@/features/store/components/CartContext'

describe('CartContext & useCart Hook (WALO-52)', () => {
    // Definimos un ID de prueba constante
    const TEST_STORE_ID = 'test-store'

    // Helper para envolver el hook con el provider obligatorio
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CartProvider storeId={TEST_STORE_ID}>{children}</CartProvider>
    )

    beforeEach(() => {
        localStorage.clear()
    })

    it('debe inicializar un estado limpio y valores en cero', () => {
        const { result } = renderHook(() => useCart(), { wrapper })

        expect(result.current.items).toEqual([])
        expect(result.current.total).toBe(0)
        expect(result.current.itemCount).toBe(0)
    })

    it('debe agregar un producto nuevo y calcular los acumuladores base', () => {
        const { result } = renderHook(() => useCart(), { wrapper })

        act(() => {
            result.current.addItem({ id: 'p-1', name: 'Empanada de Pino', price: 2500 })
        })

        expect(result.current.items.length).toBe(1)
        expect(result.current.items[0].quantity).toBe(1)
        expect(result.current.itemCount).toBe(1)
        expect(result.current.total).toBe(2500)
    })

    it('debe modificar la cantidad de un ítem existente y escalar los montos totales (WALO-485)', () => {
        const { result } = renderHook(() => useCart(), { wrapper })

        act(() => {
            result.current.addItem({ id: 'p-1', name: 'Empanada de Pino', price: 2500 })
        })

        act(() => {
            result.current.updateQuantity('p-1', 4)
        })

        expect(result.current.items[0].quantity).toBe(4)
        expect(result.current.itemCount).toBe(4)
        expect(result.current.total).toBe(10000)
    })

    it('debe purgar el elemento del estado si la cantidad asignada es menor o igual a cero', () => {
        const { result } = renderHook(() => useCart(), { wrapper })

        act(() => {
            result.current.addItem({ id: 'p-1', name: 'Empanada de Pino', price: 2500 })
            result.current.updateQuantity('p-1', 0)
        })

        expect(result.current.items.length).toBe(0)
        expect(result.current.itemCount).toBe(0)
        expect(result.current.total).toBe(0)
    })

    it('debe purgar por completo el estado y restablecer los totales a cero al ejecutar clearCart (WALO-493)', () => {
        const { result } = renderHook(() => useCart(), { wrapper })

        act(() => {
            result.current.addItem({ id: 'prod-1', name: 'Pan de Masa Madre', price: 3500 })
            result.current.addItem({ id: 'prod-2', name: 'Torta Tres Leches', price: 4500 })
        })

        expect(result.current.items.length).toBe(2)
        expect(result.current.total).toBe(8000)

        act(() => {
            result.current.clearCart()
        })

        expect(result.current.items).toEqual([])
        expect(result.current.itemCount).toBe(0)
        expect(result.current.total).toBe(0)
    })
})