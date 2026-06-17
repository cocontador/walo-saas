'use server'

import "server-only"

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'
import { ActionResult, CategoryListItem } from '@/features/category/types'

export async function getCategories(): Promise<ActionResult<CategoryListItem[]>> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesión.',
      }
    }

    const storeId = await getUserStoreId()

    if (!storeId) {
      return {
        success: false,
        error: 'No tienes una tienda asociada. Contacta a soporte.',
      }
    }

    const categories = await prisma.category.findMany({
      where: {
        storeId,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        visible: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return {
      success: true,
      data: categories,
    }
  } catch (error) {
    logError({
      event: 'category.list.failed',
      scope: 'category',
      message: 'Fallo al obtener categorías',
      errorCode: 'CATEGORY_LIST_FAILED',
      meta: { errorName: error instanceof Error ? error.name : 'UnknownError' },
    })
    return {
      success: false,
      error: 'Ocurrió un error al obtener las categorías. Por favor intenta nuevamente.',
    }
  }
}
