import type { PlanCatalogItem, PlanDetails } from '../types'

export const FALLBACK_FREE_PLAN: PlanDetails = {
  id: 'fallback-initial',
  name: 'Inicial',
  slug: 'initial',
  description: 'Plan gratuito para empezar',
  priceMonthly: 0,
  priceYearly: 0,
  currency: 'CLP',
  productLimit: 15,
  customDomain: false,
  analytics: false,
  premiumTemplates: false,
  supportLevel: 'basic',
  features: [
    'Vitrina digital con diseño estándar',
    'Catálogo de hasta 15 productos activos',
    'Categorización básica de inventario',
    'Carga de logotipo de la tienda',
    'Pedidos vía WhatsApp con mensaje estructurado',
    'Indexación SEO base SSR',
    'Subdominio compartido walo.cl/tu-tienda',
  ],
  limitations: {
    maxProducts: 15,
    maxStores: 1,
    customDomain: false,
    analytics: false,
    premiumTemplates: false,
  },
  isActive: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const PLAN_DETAILS_MAP: Record<
  string,
  {
    price: string
    priceDetail: string
    domainLabel: string
    productLimitLabel: string
    description: string
    features: string[]
    limitations: string[]
    ctaLabel: string
    isPopular: boolean
  }
> = {
  initial: {
    price: '$0',
    priceDetail: 'gratis para siempre',
    domainLabel: 'walo.cl/[nombre-tienda]',
    productLimitLabel: 'Hasta 15 productos activos',
    description: 'Digitalización base para microemprendedores en etapa temprana.',
    features: [
      'Vitrina digital con diseño estándar',
      'Catálogo de hasta 15 productos activos',
      'Categorización básica de inventario',
      'Carga de logotipo de la tienda',
      'Pedidos vía WhatsApp con mensaje estructurado',
      'Indexación SEO base SSR',
      'Subdominio compartido walo.cl/tu-tienda',
    ],
    limitations: [
      'Sin dominio personalizado',
      'Sin plantillas ni colores personalizados',
      'Sin módulo de analítica',
    ],
    ctaLabel: 'Empezar gratis',
    isPopular: false,
  },
  pro: {
    price: '$5.990 CLP',
    priceDetail: '/ mes',
    domainLabel: 'walo.cl/[nombre-tienda]',
    productLimitLabel: 'Catálogo ilimitado de productos',
    description: 'Para negocios establecidos que quieren crecer y posicionar su marca.',
    features: [
      'Todo lo del Plan Inicial',
      'Catálogo ilimitado de productos',
      'Módulo de analítica: ingresos, pedidos y clics a WhatsApp',
      'Pasarela de pagos Khipu',
      'Motor de plantillas premium (Próximamente)',
      'Conexión de dominio externo CNAME/A Records (Próximamente)',
      'Personalización de colores y diseño (Próximamente)',
    ],
    limitations: [],
    ctaLabel: 'Mejorar plan',
    isPopular: true,
  },
  business: {
    price: '$12.990 CLP',
    priceDetail: '/ mes',
    domainLabel: 'Dominio propio .cl o .com',
    productLimitLabel: 'Multi-tienda: hasta 3 tiendas',
    description: 'Para gestión avanzada y centralización de múltiples operaciones comerciales.',
    features: [
      'Todo lo del Plan Pro',
      'Multi-tienda: hasta 3 tiendas en una cuenta (Próximamente)',
      'Analítica avanzada: productos de alta rotación (Próximamente)',
      'Optimización de metadatos por producto (Próximamente)',
      'Soporte prioritario con SLA garantizado',
    ],
    limitations: [],
    ctaLabel: 'Hablar con ventas',
    isPopular: false,
  },
}

// Fuente de verdad visual del catálogo de planes. El seed mantiene los datos base en BD,
// pero esta capa define copy, CTA y jerarquía de beneficios para la presentación.
const FALLBACK_PLAN_DETAILS = {
  price: '$0',
  priceDetail: '',
  domainLabel: 'Configuración estándar',
  productLimitLabel: 'Según límite del plan',
  description: 'Plan disponible para tu tienda.',
  features: [] as string[],
  limitations: [] as string[],
  ctaLabel: 'Ver opción',
  isPopular: false,
}

export function normalizePlanForCatalog(
  plan: PlanDetails,
  currentPlanSlug: string
): PlanCatalogItem {
  const slug = plan.slug.toLowerCase()
  const details = PLAN_DETAILS_MAP[slug] ?? {
    ...FALLBACK_PLAN_DETAILS,
    price: plan.priceMonthly === 0 ? '$0' : `$${plan.priceMonthly.toLocaleString('es-CL')} CLP`,
    features: Array.isArray(plan.features) ? (plan.features as string[]) : [],
    limitations: Array.isArray(plan.limitations) ? (plan.limitations as string[]) : [],
  }

  return {
    slug,
    name: plan.name,
    description: details.description,
    productLimit: plan.productLimit,
    price: details.price,
    priceDetail: details.priceDetail,
    domainLabel: details.domainLabel,
    productLimitLabel: details.productLimitLabel,
    features: details.features,
    limitations: details.limitations,
    ctaLabel: details.ctaLabel,
    isCurrent: slug === currentPlanSlug.toLowerCase(),
    isPopular: details.isPopular,
  }
}

export function normalizePlansForCatalog(
  plans: PlanDetails[],
  currentPlan: PlanDetails
): PlanCatalogItem[] {
  const currentPlanSlug = currentPlan.slug.toLowerCase()
  const hasCurrentPlan = plans.some((plan) => plan.slug.toLowerCase() === currentPlanSlug)
  const catalogPlans = hasCurrentPlan ? plans : [currentPlan, ...plans]

  return catalogPlans.map((plan) => normalizePlanForCatalog(plan, currentPlanSlug))
}

export type LimitStatus = 'unlimited' | 'OK' | 'warning' | 'reached'

export interface LimitEvaluation {
  status: LimitStatus
  percentage: number
  isNearLimit: boolean
  isReached: boolean
}

/**
 * Evalúa el consumo actual respecto a un límite de plan.
 * OK < 80%
 * warning >= 80%
 * reached >= 100%
 * unlimited si limit=null (o menor a 0 en fallback)
 */
export function evaluateLimit(current: number, limit: number | null): LimitEvaluation {
  if (limit === null || limit < 0) {
    return {
      status: 'unlimited',
      percentage: 0,
      isNearLimit: false,
      isReached: false,
    }
  }

  const percentage = limit > 0 ? (current / limit) * 100 : 100
  const isReached = current >= limit
  const isNearLimit = !isReached && percentage >= 80

  let status: LimitStatus = 'OK'
  if (isReached) {
    status = 'reached'
  } else if (isNearLimit) {
    status = 'warning'
  }

  return {
    status,
    percentage: Math.min(percentage, 100),
    isNearLimit,
    isReached,
  }
}
