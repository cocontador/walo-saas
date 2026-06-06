'use server'

import "server-only"

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ActionResult, CategoryListItem } from '@/features/category/types'

export async function hideCategory(categoryId: string): Promise<ActionResult<CategoryListItem>> {
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

    // Ensure category exists and belongs to the store
    const existing = await prisma.category.findFirst({
      where: { id: categoryId, storeId },
      select: { id: true },
    })

    if (!existing) {
      return {
        success: false,
        error: 'Categoría no encontrada o no tienes permiso para editarla.',
      }
    }

    const updateResult = await prisma.category.updateMany({
      where: { id: categoryId, storeId },
      data: { visible: false },
    })

    if (updateResult.count === 0) {
      return {
        success: false,
        error: 'No se pudo ocultar la categoría.',
      }
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, storeId },
      select: { id: true, name: true, isActive: true, visible: true },
    })

    if (!category) {
      return {
        success: false,
        error: 'No se pudo recuperar la categoría.',
      }
    }

    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products')

    return { success: true, data: category }
  } catch (error) {
    console.error('Error hiding category:', error)
    return {
      success: false,
      error: 'Ocurrió un error al ocultar la categoría. Por favor intenta nuevamente.',
    }
  }
}
