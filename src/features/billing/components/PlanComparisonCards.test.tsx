import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PlanComparisonCards } from './PlanComparisonCards'
import type { PlanCatalogItem, PlanDetails } from '../types'

vi.mock('./PlanChangeForm', () => ({
  PlanChangeForm: ({ ctaLabel }: { ctaLabel: string }) => (
    <button type="button">{ctaLabel}</button>
  ),
}))

const basePlan: PlanDetails = {
  id: 'plan-1',
  name: 'Inicial',
  slug: 'initial',
  description: 'Plan inicial',
  priceMonthly: 0,
  priceYearly: 0,
  currency: 'CLP',
  productLimit: 15,
  customDomain: false,
  analytics: false,
  premiumTemplates: false,
  supportLevel: 'basic',
  features: [],
  limitations: null,
  isActive: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const createCatalogItem = (overrides: Partial<PlanCatalogItem>): PlanCatalogItem => ({
  slug: overrides.slug ?? 'initial',
  name: overrides.name ?? 'Inicial',
  description: overrides.description ?? 'Digitalización base para microemprendedores.',
  productLimit: overrides.productLimit ?? 15,
  price: overrides.price ?? '$0',
  priceDetail: overrides.priceDetail ?? 'gratis para siempre',
  domainLabel: overrides.domainLabel ?? 'walo.cl/[nombre-tienda]',
  productLimitLabel: overrides.productLimitLabel ?? 'Hasta 15 productos activos',
  features: overrides.features ?? ['Vitrina digital con diseño estándar'],
  limitations: overrides.limitations ?? ['Sin dominio personalizado'],
  ctaLabel: overrides.ctaLabel ?? 'Empezar gratis',
  isCurrent: overrides.isCurrent ?? false,
  isPopular: overrides.isPopular ?? false,
})

describe('PlanComparisonCards', () => {
  it('renderiza cards comparativas con beneficios y restricciones', () => {
    render(<PlanComparisonCards plans={[createCatalogItem({ isCurrent: true })]} />)

    expect(screen.getByRole('heading', { name: 'Inicial' })).toBeInTheDocument()
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('walo.cl/[nombre-tienda]')).toBeInTheDocument()
    expect(screen.getByText('Hasta 15 productos activos')).toBeInTheDocument()
    expect(screen.getByText('Vitrina digital con diseño estándar')).toBeInTheDocument()
    expect(screen.getByText('Sin dominio personalizado')).toBeInTheDocument()
  })

  it('muestra badge de plan vigente y no ofrece cambio en el plan actual', () => {
    render(<PlanComparisonCards plans={[createCatalogItem({ isCurrent: true })]} />)

    expect(screen.getByText('Plan actual')).toBeInTheDocument()
    expect(screen.getByText('Vigente')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Empezar gratis' })).not.toBeInTheDocument()
  })

  it('muestra badge Más popular en Pro y CTA funcional', () => {
    render(
      <PlanComparisonCards
        plans={[
          createCatalogItem({
            slug: 'pro',
            name: 'Pro',
            price: '$5.990 CLP',
            priceDetail: '/ mes',
            ctaLabel: 'Mejorar plan',
            isPopular: true,
            limitations: [],
          }),
        ]}
      />
    )

    const proCard = screen.getByRole('article')

    expect(within(proCard).getByText('Más popular')).toBeInTheDocument()
    expect(within(proCard).getByRole('button', { name: 'Mejorar plan' })).toBeInTheDocument()
  })

  it('mantiene estado vigente y Más popular cuando Pro es el plan actual', () => {
    render(
      <PlanComparisonCards
        plans={[
          createCatalogItem({
            slug: 'pro',
            name: 'Pro',
            price: '$5.990 CLP',
            priceDetail: '/ mes',
            ctaLabel: 'Mejorar plan',
            isCurrent: true,
            isPopular: true,
            limitations: [],
          }),
        ]}
      />
    )

    const proCard = screen.getByRole('article')

    expect(within(proCard).getByText('Plan actual')).toBeInTheDocument()
    expect(within(proCard).getByText('Más popular')).toBeInTheDocument()
    expect(within(proCard).getByText('Vigente')).toBeInTheDocument()
    expect(within(proCard).queryByRole('link', { name: 'Mejorar plan' })).not.toBeInTheDocument()
  })
})
