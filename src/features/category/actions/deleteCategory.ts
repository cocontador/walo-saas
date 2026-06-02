'use server'

import "server-only"

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

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
    console.error('Error deleting category:', error)
    return {
      success: false,
      error: 'Ocurrió un error al eliminar la categoría. Por favor intenta nuevamente.',
    }
  }
}
