'use server'
import "server-only"

import { hideProductById, type ActionResult } from './hideProduct'

function getProductIdFromFormData(formData: FormData): string | null {
  const rawProductId = formData.get('productId')

  if (typeof rawProductId !== 'string') return null

  const productId = rawProductId.trim()
  return productId.length > 0 ? productId : null
}

// Regla de negocio: en el modelo actual desactivar equivale a ocultar (visible=false).
async function deactivateProductById(productId: string): Promise<ActionResult<{ id: string; visible: boolean }>> {
  return hideProductById(productId)
}

export async function deactivateProduct(formData: FormData): Promise<void> {
  const productId = getProductIdFromFormData(formData)

  if (!productId) return
  await deactivateProductById(productId)
}

export { deactivateProductById }
