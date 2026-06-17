import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PlanLimitsCard } from './PlanLimitsCard'
import type { PlanDetails } from '../types'

const mockPlan: PlanDetails = {
  id: 'plan-1',
  name: 'Inicial',
  slug: 'custom-slug',
  description: 'Plan inicial para tu negocio',
  priceMonthly: 0,
  priceYearly: 0,
  currency: 'CLP',
  productLimit: 15,
  customDomain: false,
  analytics: false,
  premiumTemplates: false,
  supportLevel: 'basic',
  features: ['Feature 1', 'Feature 2'],
  limitations: ['Limitation 1'],
  isActive: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('PlanLimitsCard', () => {
  it('renderiza la información del plan correctamente', () => {
    const mockUsage = {
      activeProducts: 5,
      productLimit: 15,
      isUnlimited: false,
      usagePercentage: 33.3,
      isNearLimit: false,
      shouldUpgrade: false,
    }

    render(<PlanLimitsCard plan={mockPlan} usage={mockUsage} />)

    expect(screen.getByText('Plan Inicial')).toBeInTheDocument()
    expect(screen.getByText('Plan inicial para tu negocio')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('/ 15')).toBeInTheDocument()
    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    expect(screen.getByText('Limitation 1')).toBeInTheDocument()
  })

  it('renderiza el CTA de upgrade como link funcional', () => {
    const mockUsage = {
      activeProducts: 5,
      productLimit: 15,
      isUnlimited: false,
      usagePercentage: 33.3,
      isNearLimit: false,
      shouldUpgrade: false,
    }

    render(
      <PlanLimitsCard
        plan={mockPlan}
        usage={mockUsage}
        upgradeHref="/dashboard/billing#upgrade-plans"
      />
    )

    expect(screen.getByRole('link', { name: 'Mejorar plan' })).toHaveAttribute(
      'href',
      '/dashboard/billing#upgrade-plans'
    )
  })

  it('muestra la alerta de advertencia cuando se está cerca del límite (>= 80%)', () => {
    const mockUsage = {
      activeProducts: 12, // 80%
      productLimit: 15,
      isUnlimited: false,
      usagePercentage: 80,
      isNearLimit: true,
      shouldUpgrade: true,
    }

    render(<PlanLimitsCard plan={mockPlan} usage={mockUsage} />)

    expect(screen.getByText('Cerca del límite')).toBeInTheDocument()
    expect(screen.getByText(/Has utilizado el 80% de tu límite/)).toBeInTheDocument()
  })

  it('muestra la alerta de límite alcanzado cuando se llega al 100%', () => {
    const mockUsage = {
      activeProducts: 15, // 100%
      productLimit: 15,
      isUnlimited: false,
      usagePercentage: 100,
      isNearLimit: false,
      shouldUpgrade: true,
    }

    render(<PlanLimitsCard plan={mockPlan} usage={mockUsage} />)

    expect(screen.getByText('Límite alcanzado')).toBeInTheDocument()
    expect(screen.getByText(/Has llegado al límite máximo de productos activos/)).toBeInTheDocument()
  })

  it('no muestra barra de progreso si es ilimitado', () => {
    const unlimitedPlan = { ...mockPlan, productLimit: null }
    const mockUsage = {
      activeProducts: 50,
      productLimit: -1,
      isUnlimited: true,
      usagePercentage: 0,
      isNearLimit: false,
      shouldUpgrade: false,
    }

    render(<PlanLimitsCard plan={unlimitedPlan} usage={mockUsage} />)

    expect(screen.queryByText('% consumido')).not.toBeInTheDocument()
    expect(screen.getByText(/Ilimitados/)).toBeInTheDocument()
  })
})
