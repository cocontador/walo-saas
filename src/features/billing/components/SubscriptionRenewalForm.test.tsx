import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { SubscriptionRenewalActionState } from '../types'

const mocks = vi.hoisted(() => ({
  action: vi.fn(),
  routerRefresh: vi.fn(),
  state: { status: 'idle', message: '' } as SubscriptionRenewalActionState,
  pending: false,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.routerRefresh }),
}))

vi.mock('../actions/cancelPlanRenewal', () => ({
  cancelPlanRenewal: vi.fn(),
}))

vi.mock('../actions/reactivatePlan', () => ({
  reactivatePlan: vi.fn(),
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

import { SubscriptionRenewalForm } from './SubscriptionRenewalForm'

describe('SubscriptionRenewalForm', () => {
  it('renderiza acción para cancelar renovación', () => {
    mocks.state = { status: 'idle', message: '' }
    mocks.pending = false

    render(<SubscriptionRenewalForm actionType="cancel" />)

    expect(screen.getByRole('button', { name: 'Cancelar renovación' })).toBeInTheDocument()
  })

  it('renderiza acción para reactivar plan', () => {
    mocks.state = { status: 'idle', message: '' }
    mocks.pending = false

    render(<SubscriptionRenewalForm actionType="reactivate" />)

    expect(screen.getByRole('button', { name: 'Reactivar plan' })).toBeInTheDocument()
  })

  it('muestra estado pendiente al cancelar', () => {
    mocks.state = { status: 'idle', message: '' }
    mocks.pending = true

    render(<SubscriptionRenewalForm actionType="cancel" />)

    expect(screen.getByRole('button', { name: 'Cancelando...' })).toBeDisabled()
  })

  it('muestra feedback exitoso y refresca la vista', () => {
    mocks.routerRefresh.mockClear()
    mocks.state = {
      status: 'success',
      message: 'Plan activo. La renovación de tu suscripción fue reactivada.',
    }
    mocks.pending = false

    render(<SubscriptionRenewalForm actionType="reactivate" />)

    expect(screen.getByText('Plan activo. La renovación de tu suscripción fue reactivada.')).toBeInTheDocument()
    expect(mocks.routerRefresh).toHaveBeenCalled()
  })

  it('muestra feedback de error sin refrescar', () => {
    mocks.routerRefresh.mockClear()
    mocks.state = {
      status: 'expired',
      message: 'La ventana de reactivación expiró. Elige un plan para continuar.',
    }
    mocks.pending = false

    render(<SubscriptionRenewalForm actionType="reactivate" />)

    expect(screen.getByText('La ventana de reactivación expiró. Elige un plan para continuar.')).toBeInTheDocument()
    expect(mocks.routerRefresh).not.toHaveBeenCalled()
  })
})
