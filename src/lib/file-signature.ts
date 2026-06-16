import "server-only"

/**
 * Tipos MIME de imagen permitidos, detectables por firma binaria (magic bytes).
 */
export type DetectedImageMime = "image/png" | "image/jpeg" | "image/webp"

/**
 * Detecta el tipo MIME real de una imagen a partir de sus primeros bytes (firma),
 * sin confiar en el `type`/extensión declarados por el cliente.
 * @param bytes Contenido binario del archivo.
 * @returns El MIME detectado o `null` si no coincide con PNG/JPEG/WEBP.
 */
export function detectImageMimeFromBytes(bytes: Uint8Array): DetectedImageMime | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png"
  }

  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg"
  }

  // WEBP: "RIFF" (52 49 46 46) .... "WEBP" (57 45 42 50)
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp"
  }

  return null
}

type VerifyResult =
  | { ok: true; bytes: Uint8Array; mime: DetectedImageMime }
  | { ok: false; error: string }

/**
 * Lee el contenido de un archivo de imagen una sola vez y verifica que su firma
 * binaria real corresponda a una imagen permitida y coincida con el `type` declarado.
 * Devuelve los bytes ya leídos para reutilizarlos como cuerpo del upload (sin doble lectura).
 * @param file Archivo recibido en la Server Action.
 * @returns Bytes y MIME verificado, o un error controlado para responder `400`.
 */
export async function readAndVerifyImage(file: File): Promise<VerifyResult> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const detected = detectImageMimeFromBytes(bytes)

  if (!detected) {
    return {
      ok: false,
      error: "El contenido del archivo no es una imagen PNG, JPEG o WEBP válida.",
    }
  }

  if (detected !== file.type) {
    return {
      ok: false,
      error: "El tipo declarado del archivo no coincide con su contenido real.",
    }
  }

  return { ok: true, bytes, mime: detected }
}
