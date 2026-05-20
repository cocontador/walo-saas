'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type ProductDetail = {
  id: string
  name: string
  price: number
  description: string | null
  visible: boolean
  storeId: string
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
        storeId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!product) {
      return {
        success: false,
        error: 'Producto no encontrado o no tienes permiso para acceder a él.',
      }
    }

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return {
      success: false,
      error: 'Ocurrió un error al obtener el producto. Por favor intenta nuevamente.',
    }
  }
}
