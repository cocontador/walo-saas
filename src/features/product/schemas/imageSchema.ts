import { z } from 'zod'

export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

export const ALLOWED_PRODUCT_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export const productImageFileSchema = z
  .instanceof(File, { message: 'Debes seleccionar un archivo válido.' })
  .refine((file) => file.size > 0, {
    message: 'El archivo está vacío. Selecciona una imagen válida.',
  })
  .refine((file) => file.size <= MAX_PRODUCT_IMAGE_SIZE_BYTES, {
    message: 'La imagen supera el límite de 2MB permitido.',
  })
  .refine(
    (file) =>
      ALLOWED_PRODUCT_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_PRODUCT_IMAGE_MIME_TYPES)[number]
      ),
    {
      message: 'Formato no permitido. Usa PNG, JPEG o WEBP.',
    }
  )

export function validateProductImageFile(file: File): File {
  return productImageFileSchema.parse(file)
}
