'use server'
import "server-only"

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function getProductIdFromFormData(formData: FormData): string | null {
  const rawProductId = formData.get('productId')

  if (typeof rawProductId !== 'string') return null

  const productId = rawProductId.trim()
  return productId.length > 0 ? productId : null
}

async function hideProductById(productId: string): Promise<ActionResult<{ id: string; visible: boolean }>> {
  if (!productId) {
    return {
      success: false,
      error: 'Producto inválido. Por favor verifica la selección.',
    }
  }

  try {
    // Get user session
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
        error: 'Producto no encontrado o no tienes permiso para ocultarlo.',
      }
    }

    const updateResult = await prisma.product.updateMany({
      where: {
        id: productId,
        storeId,
      },
      data: {
        visible: false,
      },
    })

    if (updateResult.count === 0) {
      return {
        success: false,
        error: 'Producto no encontrado o no tienes permiso para ocultarlo.',
      }
    }

    revalidatePath('/dashboard/products')
    revalidatePath(`/dashboard/products/${productId}`)

    return {
      success: true,
      data: {
        id: productId,
        visible: false,
      },
    }
  } catch (error) {
    console.error('Error hiding product:', error)
    return {
      success: false,
      error: 'Ocurrió un error al ocultar el producto. Por favor intenta nuevamente.',
    }
  }
}

export async function hideProduct(formData: FormData): Promise<void> {
  const productId = getProductIdFromFormData(formData)

  if (!productId) return
  await hideProductById(productId)
}

export { hideProductById }
