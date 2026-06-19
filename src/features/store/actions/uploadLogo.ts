'use server'

import "server-only"

import { PutObjectCommand } from '@aws-sdk/client-s3'

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
 * Sube el logo de una tienda validando autenticación y pertenencia del usuario a la tienda.
 * @param formData FormData con `storeId` y `logo` (File) para la operación de upload.
 * @returns Resultado estructurado con estado, metadata del logo y errores controlados.
 * @throws {Error} Si falla infraestructura crítica (R2/env/DB) fuera de errores manejados.
 */
export async function uploadLogo(formData: FormData): Promise<ActionResult> {
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
      message: 'Usuario sin permisos para subir logo',
      storeId,
      userId,
    })
    return { ok: false, status: 403, error: 'No tienes permisos para editar esta tienda.' }
  }

  const existingStore = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  })

  if (!existingStore) {
    return { ok: false, status: 404, error: 'La tienda no existe.' }
  }

  const verified = await readAndVerifyImage(logoFile)

  if (!verified.ok) {
    return { ok: false, status: 400, error: verified.error }
  }

  const extension = MIME_EXTENSION_MAP[verified.mime]
  const logoKey = buildStoreLogoKey(storeId, extension)
  const logoUrl = getPublicUrl(logoKey)
  const body = verified.bytes

  const client = getR2Client()
  const bucket = getR2Bucket()

  if (!client || !bucket) {
    logError({
      event: 'store_logo.upload.failed',
      scope: 'media',
      message: 'R2 no configurado para subir logo',
      storeId,
      errorCode: 'R2_NOT_CONFIGURED',
    })
    return { ok: false, status: 500, error: 'R2 no está configurado. Revisa las variables de entorno.' }
  }

  logInfo({
    event: 'store_logo.upload.started',
    scope: 'media',
    message: 'Iniciando subida de logo a R2',
    storeId,
    meta: {
      key: logoKey,
      contentType: verified.mime,
      size: logoFile.size,
    },
  })

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: logoKey,
      Body: body,
      ContentType: verified.mime,
    })
  )

  await prisma.store.update({
    where: { id: storeId },
    data: {
      logoUrl,
      logoKey,
    },
  })

  logInfo({
    event: 'store_logo.upload.succeeded',
    scope: 'media',
    message: 'Logo de tienda subido correctamente',
    storeId,
    meta: {
      key: logoKey,
    },
  })

  return { ok: true, storeId, logoUrl, logoKey }
}
