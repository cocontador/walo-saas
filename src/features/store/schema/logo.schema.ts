import { z } from "zod"

export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024

export const ALLOWED_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

export const logoFileSchema = z
  .instanceof(File, { message: "Debes seleccionar un archivo válido." })
  .refine((file) => file.size > 0, {
    message: "El archivo está vacío. Selecciona una imagen válida.",
  })
  .refine((file) => file.size <= MAX_LOGO_SIZE_BYTES, {
    message: "El logo supera el límite de 2MB permitido.",
  })
  .refine(
    (file) =>
      ALLOWED_LOGO_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_LOGO_MIME_TYPES)[number]
      ),
    {
      message: "Formato no permitido. Usa PNG, JPEG o WEBP.",
    }
  )

/**
 * Valida un archivo de logo de tienda aplicando restricciones de seguridad perimetral.
 * Estas reglas reducen riesgo de subida de archivos no permitidos y controlan payloads excesivos.
 * @param file Archivo recibido desde FormData en una Server Action o Route Handler.
 * @returns Archivo validado y tipado de forma segura para continuar el flujo de upload.
 * @throws {z.ZodError} Si el archivo no cumple tipo MIME, tamaño máximo o estructura esperada.
 */
export function validateLogoFile(file: File): File {
  return logoFileSchema.parse(file)
}
