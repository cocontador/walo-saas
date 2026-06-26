import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PlanChangeState } from '../types'

const mocks = vi.hoisted(() => ({
  action: vi.fn(),
  routerRefresh: vi.fn(),
  state: { status: 'idle', message: '' } as PlanChangeState,
  pending: false,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.routerRefresh }),
}))

vi.mock('../actions/changePlan', () => ({
  changePlan: vi.fn(),
}))

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return {
    ...actual,
    useFormStatus: () => ({ pending: mocks.pending }),
  }
})

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useActionState: () => [mocks.state, mocks.action] as const,
  }
})

import { PlanChangeForm } from './PlanChangeForm'

describe('PlanChangeForm', () => {
  it('renderiza botón para seleccionar plan y campo oculto', () => {
    mocks.state = { status: 'idle', message: '' }
    mocks.pending = false

    render(<PlanChangeForm planSlug="pro" ctaLabel="Mejorar plan" />)

    expect(screen.getByRole('button', { name: 'Mejorar plan' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('pro')).toHaveAttribute('name', 'planSlug')
  })

  it('muestra estado pendiente del botón', () => {
    mocks.state = { status: 'idle', message: '' }
    mocks.pending = true

    render(<PlanChangeForm planSlug="pro" ctaLabel="Mejorar plan" />)

    expect(screen.getByRole('button', { name: 'Confirmando...' })).toBeDisabled()
  })

  it('muestra feedback exitoso y refresca la vista', () => {
    mocks.state = { status: 'success', message: 'Tu tienda ahora usa el Plan Pro.' }
    mocks.pending = false

    render(<PlanChangeForm planSlug="pro" ctaLabel="Mejorar plan" />)

    expect(screen.getByText('Tu tienda ahora usa el Plan Pro.')).toBeInTheDocument()
    expect(mocks.routerRefresh).toHaveBeenCalled()
  })

  it('muestra feedback de error sin refrescar', () => {
    mocks.routerRefresh.mockClear()
    mocks.state = { status: 'invalid_plan', message: 'El plan seleccionado no está disponible.' }
    mocks.pending = false

    render(<PlanChangeForm planSlug="missing" ctaLabel="Ver opción" />)

    expect(screen.getByText('El plan seleccionado no está disponible.')).toBeInTheDocument()
    expect(mocks.routerRefresh).not.toHaveBeenCalled()
  })
})
