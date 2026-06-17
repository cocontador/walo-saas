'use server'

import type { PlanCatalogInfo } from '@/features/billing/types'
import { normalizePlansForCatalog } from '@/features/billing/utils/limits'
import { getAvailablePlans } from './getAvailablePlans'
import { getCurrentPlan } from './getCurrentPlan'

/**
 * Obtiene el catálogo de planes activos y marca el plan vigente de la tienda.
 * Si la tienda no tiene suscripción, getCurrentPlan retorna Initial/fallback sin escribir en BD.
 */
export async function getPlanCatalog(): Promise<PlanCatalogInfo> {
  const [availablePlans, currentPlanInfo] = await Promise.all([
    getAvailablePlans(),
    getCurrentPlan(),
  ])

  return {
    plans: normalizePlansForCatalog(availablePlans, currentPlanInfo.plan),
    currentPlanSlug: currentPlanInfo.plan.slug,
  }
}
