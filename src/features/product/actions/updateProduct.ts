'use server'

import "server-only"

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
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
      where: {
        id: productId,
        storeId,
      },
      select: {
        id: true,
      },
    })

    if (!existingProduct) {
      return {
        success: false,
        error: 'Producto no encontrado o no tienes permiso para editarlo.',
      }
    }

    // Validate input data
    const validatedData = updateProductSchema.parse(input)

    let categoryData: { categoryId?: string | null } = {}

    if (validatedData.categoryId !== undefined) {
      const categoryId = validatedData.categoryId?.trim() ?? null

      if (categoryId) {
        const category = await prisma.category.findFirst({
          where: {
            id: categoryId,
            storeId,
          },
          select: {
            id: true,
          },
        })

        if (!category) {
          return {
            success: false,
            error: 'La categoría seleccionada no existe o no pertenece a tu tienda.',
          }
        }
      }

      categoryData = { categoryId }
    }

    // Update the product in the database
    const updateResult = await prisma.product.updateMany({
      where: {
        id: productId,
        storeId,
      },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.price !== undefined && { price: validatedData.price }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.visible !== undefined && { visible: validatedData.visible }),
        ...categoryData,
      },
    })

    if (updateResult.count === 0) {
      return {
        success: false,
        error: 'Producto no encontrado o no tienes permiso para editarlo.',
      }
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        visible: true,
      },
    })

    if (!product) {
      return {
        success: false,
        error: 'No se pudo recuperar el producto actualizado.',
      }
    }

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

    console.error('Error updating product:', error)
    return {
      success: false,
      error: 'Ocurrió un error al actualizar el producto. Por favor intenta nuevamente.',
    }
  }
}
