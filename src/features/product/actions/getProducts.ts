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

export type ProductListItem = {
  id: string
  name: string
  price: number
  description: string | null
  visible: boolean
  imageUrl: string | null
  createdAt: Date
}

export async function getProducts(searchTerm?: string | null): Promise<ActionResult<ProductListItem[]>> {
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

    // Fetch products and validate they belong to user's store
    const products = await prisma.product.findMany({
      where: {
        storeId,
        ...(searchTerm && searchTerm.trim()
          ? {
              OR: [
                { name: { contains: searchTerm.trim(), mode: 'insensitive' } },
                { description: { contains: searchTerm.trim(), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        visible: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: products,
    }
  } catch (error) {
    logError({
      event: 'product.list.failed',
      scope: 'product',
      message: 'Fallo al obtener productos',
      errorCode: 'PRODUCT_LIST_FAILED',
      meta: { errorName: error instanceof Error ? error.name : 'UnknownError' },
    })
    return {
      success: false,
      error: 'Ocurrió un error al obtener los productos. Por favor intenta nuevamente.',
    }
  }
}

