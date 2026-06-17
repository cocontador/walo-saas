'use server'

import "server-only"

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/features/category/types'

export async function deleteCategory(categoryId: string): Promise<ActionResult<null>> {
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

    // Delete only if belongs to store (onDelete: SetNull will keep products safe)
    const result = await prisma.category.deleteMany({ where: { id: categoryId, storeId } })

    if (result.count === 0) {
      return {
        success: false,
        error: 'Categoría no encontrada o no tienes permiso para eliminarla.',
      }
    }

    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products')

    return { success: true, data: null }
  } catch (error) {
    logError({
      event: 'category.delete.failed',
      scope: 'category',
      message: 'Fallo al eliminar categoría',
      errorCode: 'CATEGORY_DELETE_FAILED',
      meta: { errorName: error instanceof Error ? error.name : 'UnknownError' },
    })
    return {
      success: false,
      error: 'Ocurrió un error al eliminar la categoría. Por favor intenta nuevamente.',
    }
  }
}
