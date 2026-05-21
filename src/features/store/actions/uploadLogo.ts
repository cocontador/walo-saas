'use server'

import "server-only"

import { PutObjectCommand } from '@aws-sdk/client-s3'

import { prisma } from '@/lib/prisma'
import { buildStoreLogoKey, r2Bucket, r2Client } from '@/lib/r2'
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
  const baseUrl = process.env.R2_PUBLIC_URL

  if (!baseUrl) {
    throw new Error('R2_PUBLIC_URL is not defined')
  }

  return `${baseUrl.replace(/\/$/, '')}/${key}`
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
  const logoFile = validateLogoFile(logoValue)

  const membership = await prisma.storeMember.findFirst({
    where: {
      storeId,
      userId,
      role: { in: ['OWNER', 'EDITOR'] },
    },
  })

  if (!membership) {
    return { ok: false, status: 403, error: 'No tienes permisos para editar esta tienda.' }
  }

  const existingStore = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true },
  })

  if (!existingStore) {
    return { ok: false, status: 404, error: 'La tienda no existe.' }
  }

  const extension = MIME_EXTENSION_MAP[logoFile.type]
  const logoKey = buildStoreLogoKey(storeId, extension)
  const logoUrl = getPublicUrl(logoKey)
  const body = new Uint8Array(await logoFile.arrayBuffer())

  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2Bucket,
      Key: logoKey,
      Body: body,
      ContentType: logoFile.type,
    })
  )

  await prisma.store.update({
    where: { id: storeId },
    data: {
      logoUrl,
      logoKey,
    },
  })

  return { ok: true, storeId, logoUrl, logoKey }
}
