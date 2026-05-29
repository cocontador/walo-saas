'use server'

import "server-only"

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
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
    const categoryId = validatedData.categoryId?.trim()

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

    // Create product in database
    const product = await prisma.product.create({
      data: {
        storeId,
        name: validatedData.name,
        price: validatedData.price,
        description: validatedData.description || null,
        visible: true,
        ...(categoryId ? { categoryId } : {}),
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

    console.error('Error creating product:', error)
    return {
      success: false,
      error: 'Ocurrió un error al crear el producto. Por favor intenta nuevamente.',
    }
  }
}
