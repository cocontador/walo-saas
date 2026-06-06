'use server'

import "server-only"

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { updateCategorySchema, type UpdateCategoryInput } from '@/features/category/schemas'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { ActionResult, CategoryListItem } from '@/features/category/types'

export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput
): Promise<ActionResult<CategoryListItem>> {
  try {
    const validatedData = updateCategorySchema.parse(input)

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
    const existing = await prisma.category.findFirst({ where: { id: categoryId, storeId }, select: { id: true } })

    if (!existing) {
      return {
        success: false,
        error: 'Categoría no encontrada o no tienes permiso para editarla.',
      }
    }

    // Build update data only with provided fields
    const updateData: Prisma.CategoryUpdateInput = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.visible !== undefined) updateData.visible = validatedData.visible
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive

    const updateResult = await prisma.category.updateMany({
      where: { id: categoryId, storeId },
      data: updateData,
    })

    if (updateResult.count === 0) {
      return {
        success: false,
        error: 'No se pudo actualizar la categoría.',
      }
    }

    const category = await prisma.category.findFirst({ where: { id: categoryId, storeId }, select: { id: true, name: true, isActive: true, visible: true } })

    if (!category) {
      return {
        success: false,
        error: 'No se pudo recuperar la categoría actualizada.',
      }
    }

    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products')

    return { success: true, data: category }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return {
        success: false,
        error: firstError.message || 'Datos inválidos. Por favor verifica los campos.',
      }
    }

    if (
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') ||
      (error && typeof error === 'object' && 'code' in error && (error as Record<string, unknown>).code === 'P2002')
    ) {
      return {
        success: false,
        error: 'Ya existe una categoría con ese nombre en tu tienda.',
      }
    }

    console.error('Error updating category:', error)
    return {
      success: false,
      error: 'Ocurrió un error al actualizar la categoría. Por favor intenta nuevamente.',
    }
  }
}
