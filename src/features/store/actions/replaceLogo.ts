'use server'

import "server-only"

import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

import { logError, logInfo, logWarn } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { buildStoreLogoKey, getR2Client, getR2Bucket, getR2PublicUrlBase } from '@/lib/r2'
import { readAndVerifyImage } from '@/lib/file-signature'
import { requireAuth } from '@/server/require-auth'

import { validateLogoFile } from '../schema/logo.schema'

type ActionResult =
  | { ok: true; storeId: string; logoUrl: string; logoKey: string }
  | { ok: false; status: 400 | 401 | 403 | 404 | 500; error: string }

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

function getPublicUrl(key: string): string {
  const baseUrl = getR2PublicUrlBase()

  if (!baseUrl) {
    throw new Error('R2 is not configured (missing R2_PUBLIC_URL).')
  }

  return `${baseUrl}/${key}`
}

/**
 * Reemplaza el logo de una tienda con rollback de storage si falla la actualización en base de datos.
 * @param formData FormData con `storeId` y `logo` (File) para ejecutar el reemplazo.
 * @returns Resultado estructurado con referencia final del logo o error controlado.
 * @throws {Error} Si ocurre una falla no recuperable en infraestructura.
 */
export async function replaceLogo(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth()
  const userId = session.user?.id

  if (!userId) {
    return { ok: false, status: 401, error: 'No autorizado.' }
  }

  const storeIdValue = formData.get('storeId')
  const logoValue = formData.get('logo')

  if (typeof storeIdValue !== 'string' || !storeIdValue.trim()) {
    return { ok: false, status: 400, error: 'storeId inválido.' }
  }

  if (!(logoValue instanceof File)) {
    return { ok: false, status: 400, error: 'Debes adjuntar un archivo de logo.' }
  }

  const storeId = storeIdValue.trim()

  let logoFile: File
  try {
    logoFile = validateLogoFile(logoValue)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Archivo de logo inválido.'
    return { ok: false, status: 400, error: message }
  }

  const membership = await prisma.storeMember.findFirst({
    where: {
      storeId,
      userId,
      role: { in: ['OWNER', 'EDITOR'] },
    },
  })

  if (!membership) {
    logWarn({
      event: 'authz.membership.denied',
      scope: 'store',
      message: 'Usuario sin permisos para reemplazar logo',
      storeId,
      userId,
    })
    return { ok: false, status: 403, error: 'No tienes permisos para editar esta tienda.' }
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, logoKey: true },
  })

  if (!store) {
    return { ok: false, status: 404, error: 'La tienda no existe.' }
  }

  const verified = await readAndVerifyImage(logoFile)

  if (!verified.ok) {
    return { ok: false, status: 400, error: verified.error }
  }

  const extension = MIME_EXTENSION_MAP[verified.mime]
  const newLogoKey = buildStoreLogoKey(storeId, extension)
  const newLogoUrl = getPublicUrl(newLogoKey)
  const body = verified.bytes

  const client = getR2Client()
  const bucket = getR2Bucket()

  if (!client || !bucket) {
    logError({
      event: 'store_logo.upload.failed',
      scope: 'media',
      message: 'R2 no configurado para reemplazar logo',
      storeId,
      errorCode: 'R2_NOT_CONFIGURED',
    })
    return { ok: false, status: 500, error: 'R2 no está configurado. Revisa las variables de entorno.' }
  }

  logInfo({
    event: 'store_logo.replace.started',
    scope: 'media',
    message: 'Iniciando reemplazo de logo en R2',
    storeId,
    meta: {
      newKey: newLogoKey,
      previousKey: store.logoKey,
      contentType: verified.mime,
      size: logoFile.size,
    },
  })

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: newLogoKey,
      Body: body,
      ContentType: verified.mime,
    })
  )

  try {
    await prisma.store.update({
      where: { id: storeId },
      data: {
        logoUrl: newLogoUrl,
        logoKey: newLogoKey,
      },
    })
  } catch (error) {
    try {
      const client2 = getR2Client()
      const bucket2 = getR2Bucket()
      if (client2 && bucket2) {
        await client2.send(
          new DeleteObjectCommand({
            Bucket: bucket2,
            Key: newLogoKey,
          })
        )
      }
    } catch (rollbackError) {
      logError({
        event: 'store_logo.replace.rollback',
        scope: 'media',
        message: 'Fallo rollback de logo nuevo tras error de base de datos',
        storeId,
        errorCode: 'R2_ROLLBACK_FAILED',
        meta: {
          key: newLogoKey,
          errorName: rollbackError instanceof Error ? rollbackError.name : 'UnknownError',
        },
      })
    }
    logError({
      event: 'store_logo.upload.failed',
      scope: 'media',
      message: 'Fallo actualizacion de base de datos despues de subir logo',
      storeId,
      errorCode: 'STORE_LOGO_DB_UPDATE_FAILED',
      meta: {
        key: newLogoKey,
        errorName: error instanceof Error ? error.name : 'UnknownError',
      },
    })
    throw error
  }

  if (store.logoKey && store.logoKey !== newLogoKey) {
    try {
      const client3 = getR2Client()
      const bucket3 = getR2Bucket()
      if (client3 && bucket3) {
        await client3.send(
          new DeleteObjectCommand({
            Bucket: bucket3,
            Key: store.logoKey,
          })
        )
      }
    } catch (cleanupError) {
      logWarn({
        event: 'store_logo.remove.storage_cleanup_failed',
        scope: 'media',
        message: 'Fallo limpieza de logo anterior tras reemplazo',
        storeId,
        errorCode: 'R2_OLD_LOGO_DELETE_FAILED',
        meta: {
          key: store.logoKey,
          errorName: cleanupError instanceof Error ? cleanupError.name : 'UnknownError',
        },
      })
    }
  }

  logInfo({
    event: 'store_logo.replace.succeeded',
    scope: 'media',
    message: 'Logo de tienda reemplazado correctamente',
    storeId,
    meta: {
      key: newLogoKey,
    },
  })

  return { ok: true, storeId, logoUrl: newLogoUrl, logoKey: newLogoKey }
}
