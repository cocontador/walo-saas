'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type ProductListItem = {
  id: string
  name: string
  price: number
  description: string | null
  visible: boolean
  createdAt: Date
}

export async function getProducts(): Promise<ActionResult<ProductListItem[]>> {
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
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        visible: true,
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
    console.error('Error fetching products:', error)
    return {
      success: false,
      error: 'Ocurrió un error al obtener los productos. Por favor intenta nuevamente.',
    }
  }
}
