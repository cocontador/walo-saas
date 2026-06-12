import type { PlanDetails } from '../types'

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
    'Vitrina digital estándar',
    'Carga de logotipo',
    'Pedidos vía WhatsApp',
    'SEO base',
    'Subdominio compartido walo.app',
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

export const PLAN_DETAILS_MAP: Record<string, { price: string; features: string[]; limitations: string[] }> = {
  initial: {
    price: '$0',
    features: [
      'Hasta 15 productos activos',
      'Carga de logotipo de tu tienda',
      'Pedidos directamente a tu WhatsApp',
      'SEO base para buscadores',
      'Subdominio compartido (walo.app/tu-tienda)',
    ],
    limitations: [
      'Sin dominio propio',
      'Sin plantillas premium',
      'Sin analítica de visitas',
      'Sin soporte prioritario',
    ],
  },
  pro: {
    price: '$5.990 CLP/mes',
    features: [
      'Productos activos ilimitados',
      'Dominio propio (.cl, .com, etc.)',
      'Acceso a plantillas premium',
      'Analíticas de visitas y clicks',
      'Soporte por correo electrónico',
      'Personalización de colores y marca',
    ],
    limitations: [
      'Límite de 1 tienda asociada',
      'Sin pasarela de pagos integrada',
    ],
  },
  business: {
    price: '$12.990 CLP/mes',
    features: [
      'Todo lo del Plan Pro',
      'Multi-tienda (hasta 3 tiendas asociadas)',
      'Integración con pasarela de pagos',
      'Analíticas avanzadas y reportes',
      'Secciones y metadatos avanzados',
      'Soporte prioritario 24/7',
    ],
    limitations: [],
  },
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
