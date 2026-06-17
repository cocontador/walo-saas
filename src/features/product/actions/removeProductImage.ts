'use server'

import "server-only"

import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { getR2Client, getR2Bucket } from '@/lib/r2'
import { logWarn } from '@/lib/logger'

type ActionResult =
  | { ok: true; productId: string; imageRemoved: boolean }
  | { ok: false; status: 400 | 401 | 403 | 404 | 500; error: string }

export async function removeProductImage(productId: string): Promise<ActionResult> {
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

  if (!product.imageKey) {
    await prisma.product.updateMany({
      where: {
        id: cleanProductId,
        storeId,
      },
      data: {
        imageUrl: null,
        imageKey: null,
      },
    })

    return { ok: true, productId: cleanProductId, imageRemoved: false }
  }

  try {
    const client = getR2Client()
    const bucket = getR2Bucket()
    if (client && bucket) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: product.imageKey,
        })
      )
    }
  } catch (cleanupError) {
    logWarn({
      event: 'product_image.remove.storage_cleanup_failed',
      scope: 'media',
      message: 'Fallo limpieza de imagen de producto en R2',
      storeId,
      errorCode: 'R2_PRODUCT_IMAGE_DELETE_FAILED',
      meta: {
        productId: cleanProductId,
        errorName: cleanupError instanceof Error ? cleanupError.name : 'UnknownError',
      },
    })
  }

  await prisma.product.updateMany({
    where: {
      id: cleanProductId,
      storeId,
    },
    data: {
      imageUrl: null,
      imageKey: null,
    },
  })

  return { ok: true, productId: cleanProductId, imageRemoved: true }
}
