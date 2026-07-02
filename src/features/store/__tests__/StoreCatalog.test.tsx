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

type MockProduct = {
    id: string
    name: string
    description: string | null
    price: number
    imageUrl: string | null
    categories: { category: { name: string; visible: boolean } }[]
}

const mockProducts: MockProduct[] = [
    { id: 'prod-1', name: 'Pan de Masa Madre', description: 'Pan fresco', price: 3500, imageUrl: null, categories: [{ category: { name: 'Panadería', visible: true } }] },
    { id: 'prod-2', name: 'Torta Tres Leches', description: 'Porción', price: 4500, imageUrl: null, categories: [{ category: { name: 'Pastelería', visible: true } }] }
]

describe('StoreCatalog Component', () => {
    // Unificamos: usamos storeId que viene del argumento, con valor por defecto
    const renderComponent = (productsList: MockProduct[] = mockProducts, storeId = 'test-store') => {
        return render(
            <CartProvider storeId={storeId}>
                <StoreCatalog products={productsList} storeId={storeId} storeSlug="test-tienda" />
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

    it('busca productos por nombre (sin distinción de mayúsculas)', () => {
        renderComponent()
        const searchInput = screen.getByRole('searchbox', { name: /buscar productos/i })
        fireEvent.change(searchInput, { target: { value: 'masa madre' } })
        expect(screen.getByText('Pan de Masa Madre')).toBeDefined()
        expect(screen.queryByText('Torta Tres Leches')).toBeNull()
    })

    it('muestra estado vacío cuando la búsqueda no tiene coincidencias', () => {
        renderComponent()
        const searchInput = screen.getByRole('searchbox', { name: /buscar productos/i })
        fireEvent.change(searchInput, { target: { value: 'producto inexistente xyz' } })
        expect(screen.queryByText('Pan de Masa Madre')).toBeNull()
        expect(screen.queryByText('Torta Tres Leches')).toBeNull()
        expect(screen.getByText(/No se encontraron productos/i)).toBeDefined()
    })

    it('combina filtro de categoría y búsqueda correctamente', () => {
        renderComponent()
        const categoryButton = screen.getByRole('button', { name: 'Panadería' })
        fireEvent.click(categoryButton)
        const searchInput = screen.getByRole('searchbox', { name: /buscar productos/i })
        fireEvent.change(searchInput, { target: { value: 'torta' } })
        expect(screen.queryByText('Pan de Masa Madre')).toBeNull()
        expect(screen.queryByText('Torta Tres Leches')).toBeNull()
    })

    it('restaura todos los productos al limpiar la búsqueda', () => {
        renderComponent()
        const searchInput = screen.getByRole('searchbox', { name: /buscar productos/i })
        fireEvent.change(searchInput, { target: { value: 'pan' } })
        expect(screen.queryByText('Torta Tres Leches')).toBeNull()
        fireEvent.change(searchInput, { target: { value: '' } })
        expect(screen.getByText('Torta Tres Leches')).toBeDefined()
    })
})
