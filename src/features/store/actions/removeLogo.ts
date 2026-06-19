'use server'

import "server-only"

import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import { logInfo, logWarn } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { getR2Client, getR2Bucket } from '@/lib/r2'
import { requireAuth } from '@/server/require-auth'

type ActionResult =
  | { ok: true; storeId: string; logoRemoved: boolean }
  | { ok: false; status: 401 | 403 | 404 | 500; error: string }

/**
 * Elimina el logo de una tienda de forma idempotente, limpiando storage y base de datos.
 * @param storeId Identificador de tienda a modificar.
 * @returns Resultado estructurado indicando si existía logo para remover.
 * @throws {Error} Si ocurre una falla no controlada de infraestructura.
 */
export async function removeLogo(storeId: string): Promise<ActionResult> {
  const session = await requireAuth()
  const userId = session.user?.id

  if (!userId) {
    return { ok: false, status: 401, error: 'No autorizado.' }
  }

  const cleanStoreId = storeId.trim()

  const membership = await prisma.storeMember.findFirst({
    where: {
      storeId: cleanStoreId,
      userId,
      role: { in: ['OWNER', 'EDITOR'] },
    },
  })

  if (!membership) {
    logWarn({
      event: 'authz.membership.denied',
      scope: 'store',
      message: 'Usuario sin permisos para eliminar logo',
      storeId: cleanStoreId,
      userId,
    })
    return { ok: false, status: 403, error: 'No tienes permisos para editar esta tienda.' }
  }

  const store = await prisma.store.findUnique({
    where: { id: cleanStoreId },
    select: { id: true, logoKey: true },
  })

  if (!store) {
    return { ok: false, status: 404, error: 'La tienda no existe.' }
  }

  if (!store.logoKey) {
    await prisma.store.update({
      where: { id: cleanStoreId },
      data: {
        logoUrl: null,
        logoKey: null,
      },
    })

    logInfo({
      event: 'store_logo.remove.succeeded',
      scope: 'media',
      message: 'Remocion idempotente de logo sin objeto previo',
      storeId: cleanStoreId,
      meta: {
        logoRemoved: false,
      },
    })

    return { ok: true, storeId: cleanStoreId, logoRemoved: false }
  }

  logInfo({
    event: 'store_logo.remove.started',
    scope: 'media',
    message: 'Iniciando eliminacion de logo en R2',
    storeId: cleanStoreId,
    meta: {
      key: store.logoKey,
    },
  })

  try {
    const client = getR2Client()
    const bucket = getR2Bucket()
    if (client && bucket) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: store.logoKey,
        })
      )
    }
  } catch (cleanupError) {
    logWarn({
      event: 'store_logo.remove.storage_cleanup_failed',
      scope: 'media',
      message: 'Fallo limpieza de logo en R2',
      storeId: cleanStoreId,
      errorCode: 'R2_LOGO_DELETE_FAILED',
      meta: {
        key: store.logoKey,
        errorName: cleanupError instanceof Error ? cleanupError.name : 'UnknownError',
      },
    })
  }

  await prisma.store.update({
    where: { id: cleanStoreId },
    data: {
      logoUrl: null,
      logoKey: null,
    },
  })

  logInfo({
    event: 'store_logo.remove.succeeded',
    scope: 'media',
    message: 'Logo de tienda removido correctamente',
    storeId: cleanStoreId,
    meta: {
      logoRemoved: true,
    },
  })

  return { ok: true, storeId: cleanStoreId, logoRemoved: true }
}
