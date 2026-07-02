import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StorePublicHeader } from './StorePublicHeader'

describe('StorePublicHeader', () => {
    it('muestra el nombre de la tienda siempre', () => {
        render(<StorePublicHeader name="Panadería El Sol" />)
        expect(screen.getByText('Panadería El Sol')).toBeDefined()
    })

    it('muestra las iniciales cuando no hay logo', () => {
        render(<StorePublicHeader name="Pan Artesanal" />)
        expect(screen.getByText('PA')).toBeDefined()
    })

    it('muestra imagen con alt accesible cuando hay logoUrl', () => {
        render(<StorePublicHeader name="Mi Tienda" logoUrl="https://ejemplo.com/logo.png" />)
        const img = screen.getByAltText('Logo de Mi Tienda')
        expect(img).toBeDefined()
    })

    it('usa solo la primera letra cuando el nombre es una sola palabra', () => {
        render(<StorePublicHeader name="WALO" />)
        expect(screen.getByText('W')).toBeDefined()
    })

    it('no muestra la imagen si logoUrl es null', () => {
        render(<StorePublicHeader name="Mi Tienda" logoUrl={null} />)
        expect(screen.queryByAltText('Logo de Mi Tienda')).toBeNull()
    })
})
