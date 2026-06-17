import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DateRangeFilter } from '../components/DateRangeFilter'

const mockReplace = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: mockReplace }),
    useSearchParams: () => mockSearchParams,
    usePathname: () => '/dashboard',
}))

describe('DateRangeFilter', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renderiza los 4 botones de preset', () => {
        render(<DateRangeFilter />)

        expect(screen.getByRole('button', { name: 'Hoy' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '7 días' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '30 días' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Personalizado' })).toBeInTheDocument()
    })

    it('al hacer click en "Hoy" llama router.replace con from == to (hoy)', () => {
        render(<DateRangeFilter />)

        fireEvent.click(screen.getByRole('button', { name: 'Hoy' }))

        expect(mockReplace).toHaveBeenCalledTimes(1)
        const url = mockReplace.mock.calls[0][0] as string
        const params = new URLSearchParams(url.split('?')[1])
        expect(params.get('from')).toBe(params.get('to'))
    })

    it('al hacer click en "7 días" llama router.replace con from 6 días antes de hoy', () => {
        render(<DateRangeFilter />)

        fireEvent.click(screen.getByRole('button', { name: '7 días' }))

        expect(mockReplace).toHaveBeenCalledTimes(1)
        const url = mockReplace.mock.calls[0][0] as string
        const params = new URLSearchParams(url.split('?')[1])
        const from = new Date(params.get('from')!)
        const to = new Date(params.get('to')!)
        const diffDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
        expect(diffDays).toBe(6)
    })

    it('el preset "30 días" es el activo por defecto cuando no hay params', () => {
        render(<DateRangeFilter />)

        const btn = screen.getByRole('button', { name: '30 días' })
        expect(btn.className).toContain('bg-green-500')
    })

    it('el modo Personalizado muestra inputs de fecha al hacer click', () => {
        const { container } = render(<DateRangeFilter />)

        expect(container.querySelectorAll('input[type="date"]')).toHaveLength(0)

        fireEvent.click(screen.getByRole('button', { name: 'Personalizado' }))

        expect(container.querySelectorAll('input[type="date"]')).toHaveLength(2)
    })

    it('en modo Personalizado, el botón Aplicar llama router.replace con las fechas ingresadas', () => {
        const { container } = render(<DateRangeFilter />)
        fireEvent.click(screen.getByRole('button', { name: 'Personalizado' }))

        const [fromInput, toInput] = container.querySelectorAll('input[type="date"]')
        fireEvent.change(fromInput, { target: { value: '2026-06-01' } })
        fireEvent.change(toInput, { target: { value: '2026-06-10' } })
        fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

        expect(mockReplace).toHaveBeenCalledTimes(1)
        const url = mockReplace.mock.calls[0][0] as string
        expect(url).toContain('from=2026-06-01')
        expect(url).toContain('to=2026-06-10')
    })
})
