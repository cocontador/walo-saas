import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StoreNotFound from './not-found'

describe('StoreNotFound', () => {
    it('renderiza mensaje de tienda no encontrada', () => {
        render(<StoreNotFound />)

        expect(
            screen.getByRole('heading', { name: /tienda no encontrada/i })
        ).toBeInTheDocument()
    })

    it('renderiza botón para volver al inicio', () => {
        render(<StoreNotFound />)

        expect(
            screen.getByRole('link', { name: /volver al inicio/i })
        ).toBeInTheDocument()
    })

    it('el link apunta a la raíz', () => {
        render(<StoreNotFound />)

        const link = screen.getByRole('link', { name: /volver al inicio/i })
        expect(link).toHaveAttribute('href', '/')
    })
})