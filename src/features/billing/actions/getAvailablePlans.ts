'use server'

import { prisma } from '@/lib/prisma'
import type { PlanDetails } from '@/features/billing/types'

/**
 * Obtiene todos los planes activos ordenados por sortOrder
 * No requiere storeId - consulta pública
 */
export async function getAvailablePlans(): Promise<PlanDetails[]> {
  const plans = await prisma.plan.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  })

  return plans
}
