import { vi } from 'vitest';

// MOCK GLOBAL PARA EVITAR DATABASE_URL
vi.mock('@/lib/prisma', () => ({
    prisma: {
        order: { findUnique: vi.fn(), findMany: vi.fn() },
        store: { findUnique: vi.fn() },
        paymentAttempt: { findUnique: vi.fn(), update: vi.fn() },
    }
}));

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StoreCatalog } from '@/features/store/components/StoreCatalog'
import { CartProvider } from '@/features/store/components/CartContext'

const mockProducts = [
    { id: 'prod-1', name: 'Pan de Masa Madre', description: 'Pan fresco', price: 3500, imageUrl: null, categories: [{ category: { name: 'Panadería', visible: true } }] },
    { id: 'prod-2', name: 'Torta Tres Leches', description: 'Porción', price: 4500, imageUrl: null, categories: [{ category: { name: 'Pastelería', visible: true } }] }
]

describe('StoreCatalog Component', () => {
    const renderComponent = (productsList = mockProducts, storeId = 'store-1') => {
        return render(
            <CartProvider>
                <StoreCatalog products={productsList as any} storeId={storeId} />
            </CartProvider>
        )
    }

    it('debe mostrar la lista completa de productos al cargar', () => {
        renderComponent()
        expect(screen.getByText('Pan de Masa Madre')).toBeDefined()
        expect(screen.getByText('Torta Tres Leches')).toBeDefined()
    })

    it('debe filtrar al seleccionar una categoría', () => {
        renderComponent()
        const categoryButton = screen.getByRole('button', { name: 'Panadería' })
        fireEvent.click(categoryButton)
        expect(screen.getByText('Pan de Masa Madre')).toBeDefined()
        expect(screen.queryByText('Torta Tres Leches')).toBeNull()
    })
})