'use server'

import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import type { PlanUsageInfo } from '@/features/billing/types'
import { getCurrentPlan } from './getCurrentPlan'
import { evaluateLimit } from '../utils/limits'

/**
 * Obtiene la información de uso del plan actual
 * Compara productos activos vs límite del plan
 */
export async function getPlanUsage(): Promise<PlanUsageInfo> {
  const storeId = await getUserStoreId()

  if (!storeId) {
    throw new Error('No authenticated store found')
  }

  // Obtener plan actual de forma segura (con fallback)
  const { plan } = await getCurrentPlan()

  // Contar productos activos (visible = true)
  const activeProducts = await prisma.product.count({
    where: {
      storeId,
      visible: true,
    },
  })

  const productLimit = plan.productLimit
  const evaluation = evaluateLimit(activeProducts, productLimit)

  return {
    activeProducts,
    productLimit: productLimit ?? -1, // -1 indica ilimitado en el cliente si lo prefiere
    isUnlimited: evaluation.status === 'unlimited',
    usagePercentage: evaluation.percentage,
    isNearLimit: evaluation.isNearLimit,
    shouldUpgrade: evaluation.isReached || evaluation.isNearLimit,
  }
}
