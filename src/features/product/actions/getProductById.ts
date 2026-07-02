'use server'

import "server-only"

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type ProductDetail = {
  id: string
  name: string
  slug: string | null
  price: number
  description: string | null
  visible: boolean
  storeId: string
  imageUrl: string | null
  imageKey: string | null
  categories: { id: string; name: string }[]
  createdAt: Date
  updatedAt: Date
}

export async function getProductById(productId: string): Promise<ActionResult<ProductDetail>> {
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

    // Fetch product and validate it belongs to user's store
    const raw = await prisma.product.findFirst({
      where: { id: productId, storeId },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        description: true,
        visible: true,
        storeId: true,
        imageUrl: true,
        imageKey: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    if (!raw) {
      return {
        success: false,
        error: 'Producto no encontrado o no tienes permiso para acceder a él.',
      }
    }

    return {
      success: true,
      data: {
        ...raw,
        categories: raw.categories.map(pc => pc.category),
      },
    }
  } catch (error) {
    logError({
      event: 'product.get.failed',
      scope: 'product',
      message: 'Fallo al obtener producto',
      errorCode: 'PRODUCT_GET_FAILED',
      meta: { errorName: error instanceof Error ? error.name : 'UnknownError' },
    })
    return {
      success: false,
      error: 'Ocurrió un error al obtener el producto. Por favor intenta nuevamente.',
    }
  }
}
