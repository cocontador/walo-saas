import { S3Client } from "@aws-sdk/client-s3"

/**
 * Obtiene una variable de entorno obligatoria para inicializar la integración con R2.
 * @param name Nombre de la variable de entorno a resolver.
 * @returns Valor no vacío de la variable solicitada.
 * @throws {Error} Si la variable no existe o está vacía.
 */
function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is not defined`)
  }

  return value
}

const accountId = getRequiredEnv("R2_ACCOUNT_ID")
const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID")
const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY")

export const r2Bucket = getRequiredEnv("R2_BUCKET")

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

/**
 * Construye la key canónica del logo de una tienda en el bucket de R2.
 * @param storeId Identificador de la tienda propietaria del logo.
 * @param extension Extensión del archivo (con o sin punto).
 * @returns Ruta final del objeto en formato `stores/{storeId}/logo.{extension}`.
 * @throws {Error} Si `storeId` o `extension` están vacíos.
 */
export function buildStoreLogoKey(storeId: string, extension: string): string {
  const cleanStoreId = storeId.trim()
  const cleanExtension = extension.trim().replace(/^\./, "").toLowerCase()

  if (!cleanStoreId) {
    throw new Error("storeId is required")
  }

  if (!cleanExtension) {
    throw new Error("extension is required")
  }

  return `stores/${cleanStoreId}/logo.${cleanExtension}`
}
