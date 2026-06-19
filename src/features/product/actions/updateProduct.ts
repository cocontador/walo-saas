'use server'

import "server-only"

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'
import { updateProductSchema, type UpdateProductInput } from '@/features/product/schemas'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function updateProduct(
  productId: string,
  input: UpdateProductInput
): Promise<
  ActionResult<{ id: string; name: string; price: number; description: string | null; visible: boolean }>
> {
  try {
    // Get user session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesión.',
      }
    }

    // Get user's store
    const storeId = await getUserStoreId()

    if (!storeId) {
      return {
        success: false,
        error: 'No tienes una tienda asociada. Contacta a soporte.',
      }
    }

    // Check if the product exists and belongs to the user's store
    const existingProduct = await prisma.product.findFirst({
      where: { id: productId, storeId },
      select: { id: true },
    })

    if (!existingProduct) {
      return {
        success: false,
        error: 'Producto no encontrado o no tienes permiso para editarlo.',
      }
    }

    // Validate input data
    const validatedData = updateProductSchema.parse(input)

    if (validatedData.categoryIds !== undefined && validatedData.categoryIds.length > 0) {
      const validCategories = await prisma.category.findMany({
        where: { id: { in: validatedData.categoryIds }, storeId },
        select: { id: true },
      })

      if (validCategories.length !== validatedData.categoryIds.length) {
        return {
          success: false,
          error: 'Una o más categorías no existen o no pertenecen a tu tienda.',
        }
      }
    }

    // Update the product in the database
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.price !== undefined && { price: validatedData.price }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.visible !== undefined && { visible: validatedData.visible }),
        ...(validatedData.categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: validatedData.categoryIds.map(id => ({ categoryId: id })),
          },
        }),
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        visible: true,
      },
    })

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return {
        success: false,
        error: firstError.message || 'Datos inválidos. Por favor verifica los campos.',
      }
    }

    logError({
      event: 'product.update.failed',
      scope: 'product',
      message: 'Fallo al actualizar producto',
      errorCode: 'PRODUCT_UPDATE_FAILED',
      meta: { errorName: error instanceof Error ? error.name : 'UnknownError' },
    })
    return {
      success: false,
      error: 'Ocurrió un error al actualizar el producto. Por favor intenta nuevamente.',
    }
  }
}
