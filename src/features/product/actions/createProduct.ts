'use server'

import "server-only"

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'
import { createProductSchema, type CreateProductInput } from '@/features/product/schemas'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createProduct(
  input: CreateProductInput
): Promise<ActionResult<{ id: string; name: string; price: number; description: string | null }>> {
  try {
    const validatedData = createProductSchema.parse(input)

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

    const categoryIds = validatedData.categoryIds ?? []

    if (categoryIds.length > 0) {
      const validCategories = await prisma.category.findMany({
        where: { id: { in: categoryIds }, storeId },
        select: { id: true },
      })

      if (validCategories.length !== categoryIds.length) {
        return {
          success: false,
          error: 'Una o más categorías no existen o no pertenecen a tu tienda.',
        }
      }
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        storeId,
        name: validatedData.name,
        price: validatedData.price,
        description: validatedData.description || null,
        visible: true,
        ...(categoryIds.length > 0 && {
          categories: {
            create: categoryIds.map(id => ({ categoryId: id })),
          },
        }),
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
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
      event: 'product.create.failed',
      scope: 'product',
      message: 'Fallo al crear producto',
      errorCode: 'PRODUCT_CREATE_FAILED',
      meta: { errorName: error instanceof Error ? error.name : 'UnknownError' },
    })
    return {
      success: false,
      error: 'Ocurrió un error al crear el producto. Por favor intenta nuevamente.',
    }
  }
}
