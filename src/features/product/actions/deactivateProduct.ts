'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// El modelo actual solo dispone del campo visible Boolean para el estado del producto.
// Por eso, desactivar se implementa como ocultar el producto sin modificar el esquema Prisma.
async function deactivateProductById(productId: string): Promise<ActionResult<{ id: string; visible: boolean }>> {
  if (!productId) {
    return {
      success: false,
      error: 'Producto inválido. Por favor verifica la selección.',
    }
  }

  try {
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
        error: 'Producto no encontrado o no tienes permiso para desactivarlo.',
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
        error: 'Producto no encontrado o no tienes permiso para desactivarlo.',
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
    console.error('Error deactivating product:', error)
    return {
      success: false,
      error: 'Ocurrió un error al desactivar el producto. Por favor intenta nuevamente.',
    }
  }
}

export async function deactivateProduct(formData: FormData): Promise<void> {
  const productId = String(formData.get('productId'))
  await deactivateProductById(productId)
}

export { deactivateProductById }
