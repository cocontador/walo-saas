'use server'

import "server-only"

import { PutObjectCommand } from '@aws-sdk/client-s3'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { buildProductImageKey, getR2Client, getR2Bucket, getR2PublicUrlBase } from '@/lib/r2'
import { readAndVerifyImage } from '@/lib/file-signature'
import { logError } from '@/lib/logger'
import { validateProductImageFile } from '@/features/product/schemas/imageSchema'

type ActionResult =
  | { ok: true; productId: string; imageUrl: string; imageKey: string }
  | { ok: false; status: 400 | 401 | 403 | 404 | 500; error: string }

function getPublicUrl(key: string): string {
  const baseUrl = getR2PublicUrlBase()

  if (!baseUrl) {
    throw new Error('R2 is not configured (missing R2_PUBLIC_URL).')
  }

  return `${baseUrl}/${key}`
}

export async function replaceProductImage(
  productId: string,
  imageFile: File
): Promise<ActionResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { ok: false, status: 401, error: 'No autorizado.' }
  }

  const storeId = await getUserStoreId()

  if (!storeId) {
    return { ok: false, status: 403, error: 'No tienes una tienda asociada.' }
  }

  const cleanProductId = productId?.trim()

  if (!cleanProductId) {
    return { ok: false, status: 400, error: 'productId inválido.' }
  }

  if (!(imageFile instanceof File)) {
    return { ok: false, status: 400, error: 'Debes adjuntar un archivo de imagen.' }
  }

  let validatedFile: File
  try {
    validatedFile = validateProductImageFile(imageFile)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Archivo de imagen inválido.'
    return { ok: false, status: 400, error: message }
  }

  const product = await prisma.product.findFirst({
    where: {
      id: cleanProductId,
      storeId,
    },
    select: {
      id: true,
      imageKey: true,
    },
  })

  if (!product) {
    return { ok: false, status: 404, error: 'Producto no encontrado o no tienes permiso para editarlo.' }
  }

  const verified = await readAndVerifyImage(validatedFile)

  if (!verified.ok) {
    return { ok: false, status: 400, error: verified.error }
  }

  const imageKey = buildProductImageKey(storeId, cleanProductId)
  const imageUrl = getPublicUrl(imageKey)
  const body = verified.bytes

  const client = getR2Client()
  const bucket = getR2Bucket()

  if (!client || !bucket) {
    logError({
      event: 'product_image.replace.failed',
      scope: 'media',
      message: 'R2 no configurado para reemplazar imagen de producto',
      storeId,
      errorCode: 'R2_NOT_CONFIGURED',
      meta: { productId: cleanProductId },
    })
    return { ok: false, status: 500, error: 'R2 no está configurado. Revisa las variables de entorno.' }
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: imageKey,
      Body: body,
      ContentType: verified.mime,
    })
  )

  try {
    await prisma.product.updateMany({
      where: {
        id: cleanProductId,
        storeId,
      },
      data: {
        imageUrl,
        imageKey,
      },
    })
  } catch (error) {
    // No se borra el archivo de R2 porque la key es determinística (misma para old y new).
    // Borrarlo dejaría la DB apuntando a un objeto inexistente.
    logError({
      event: 'product_image.replace.db_failed',
      scope: 'media',
      message: 'Fallo actualización de DB tras subir imagen de producto',
      storeId,
      errorCode: 'PRODUCT_IMAGE_DB_UPDATE_FAILED',
      meta: {
        productId: cleanProductId,
        errorName: error instanceof Error ? error.name : 'UnknownError',
      },
    })
    throw error
  }

  return {
    ok: true,
    productId: cleanProductId,
    imageUrl,
    imageKey,
  }
}
