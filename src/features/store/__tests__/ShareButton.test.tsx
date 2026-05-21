import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ShareButton } from '@/features/store/components/ShareButton'

describe('ShareButton', () => {
    beforeEach(() => {
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        })
        vi.spyOn(window, 'alert').mockImplementation(() => { })
    })

    it('renderiza el botón de compartir', () => {
        render(<ShareButton slug="mi-tienda" />)

        expect(
            screen.getByRole('button', { name: /compartir catálogo/i })
        ).toBeInTheDocument()
    })

    it('copia la URL al portapapeles al hacer clic', async () => {
        render(<ShareButton slug="mi-tienda" />)

        fireEvent.click(screen.getByRole('button', { name: /compartir catálogo/i }))

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            'https://walo.app/mi-tienda'
        )
    })

    it('muestra alerta de confirmación tras copiar', async () => {
        render(<ShareButton slug="mi-tienda" />)

        fireEvent.click(screen.getByRole('button', { name: /compartir catálogo/i }))

        await vi.waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('¡Link copiado al portapapeles!')
        })
    })
})