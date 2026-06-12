import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
// Usamos rutas absolutas para no fallar nunca
import { StoreCatalog } from '@/features/store/components/StoreCatalog'
import { CartProvider } from '@/features/store/components/CartContext'
// Datos simulados alineados con el esquema de datos tolerante a nulos
const mockProducts = [
    {
        id: 'prod-1',
        name: 'Pan de Masa Madre',
        description: 'Pan fresco artesanal',
        price: 3500,
        imageUrl: null,
        categories: [
            { category: { name: 'Panadería', visible: true } }
        ]
    },
    {
        id: 'prod-2',
        name: 'Torta Tres Leches',
        description: 'Porción individual',
        price: 4500,
        imageUrl: null,
        categories: [
            { category: { name: 'Pastelería', visible: true } }
        ]
    }
]

describe('StoreCatalog Component (WALO-50)', () => {
    // Helper para inyectar el proveedor del carrito indispensable en los subcomponentes
    const renderComponent = (productsList = mockProducts) => {
        return render(
            <CartProvider storeId="test-store">
                <StoreCatalog products={productsList} />
            </CartProvider>
        )
    }

    it('debe mostrar la lista completa de productos al cargar la interfaz', () => {
        renderComponent()

        expect(screen.getByText('Pan de Masa Madre')).toBeDefined()
        expect(screen.getByText('Torta Tres Leches')).toBeDefined()
    })

    it('debe filtrar y aislar los elementos al seleccionar una categoría específica', () => {
        renderComponent()

        // Seleccionamos específicamente el BOTÓN de la categoría, ignorando las etiquetas visuales
        const categoryButton = screen.getByRole('button', { name: 'Panadería' })
        fireEvent.click(categoryButton)

        // El producto perteneciente a la categoría seleccionada debe persistir
        expect(screen.getByText('Pan de Masa Madre')).toBeDefined()

        // El producto de la otra categoría debe ser removido de la vista
        const pasteleriaItem = screen.queryByText('Torta Tres Leches')
        expect(pasteleriaItem).toBeNull()
    })

    it('debe desplegar el estado vacío controlado si no existen artículos correspondientes', () => {
        // Inicializar con un arreglo vacío
        renderComponent([])

        expect(screen.getByText('🔍')).toBeDefined()
        expect(screen.getByText('No hay productos en esta categoría.')).toBeDefined()
    })
})