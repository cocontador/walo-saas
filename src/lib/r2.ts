import "server-only"
import { S3Client } from "@aws-sdk/client-s3"

type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicUrl: string
}

/**
 * Devuelve la configuración de R2 si está completamente definida.
 * No lanza durante el import; devuelve `null` si faltan variables de entorno.
 */
export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  const bucket = process.env.R2_BUCKET?.trim()
  const publicUrl = process.env.R2_PUBLIC_URL?.trim()

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return null
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl }
}

/**
 * Construye un cliente S3 (Cloudflare R2) en tiempo de ejecución.
 * Devuelve `null` si la configuración no está disponible.
 */
export function getR2Client(): S3Client | null {
  const cfg = getR2Config()

  if (!cfg) return null

  return new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  })
}

export function getR2Bucket(): string | null {
  const cfg = getR2Config()
  return cfg ? cfg.bucket : null
}

export function getR2PublicUrlBase(): string | null {
  const cfg = getR2Config()
  return cfg ? cfg.publicUrl.replace(/\/$/, '') : null
}

/**
 * Construye la key canónica del logo de una tienda en el bucket de R2.
 */
export function buildStoreLogoKey(storeId: string, extension: string): string {
  const ALLOWED = ["jpg", "jpeg", "png", "webp"]
  const cleanStoreId = storeId.trim()
  const cleanExtension = extension.trim().replace(/^\./, "").toLowerCase()

  if (!cleanStoreId) {
    throw new Error("storeId is required")
  }

  if (!cleanExtension) {
    throw new Error("extension is required")
  }

  if (!ALLOWED.includes(cleanExtension)) {
    throw new Error(`Extension not allowed: ${cleanExtension}`)
  }

  return `stores/${cleanStoreId}/logo`
}

export function buildProductImageKey(storeId: string, productId: string): string {
  const cleanStoreId = storeId.trim()
  const cleanProductId = productId.trim()

  if (!cleanStoreId) {
    throw new Error('storeId is required')
  }

  if (!cleanProductId) {
    throw new Error('productId is required')
  }

  return `stores/${cleanStoreId}/products/${cleanProductId}/image`
}
