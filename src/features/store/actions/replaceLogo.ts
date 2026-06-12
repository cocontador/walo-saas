'use server'

import "server-only"

import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

import { prisma } from '@/lib/prisma'
import { buildStoreLogoKey, getR2Client, getR2Bucket, getR2PublicUrlBase } from '@/lib/r2'
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

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, logoKey: true },
  })

  if (!store) {
    return { ok: false, status: 404, error: 'La tienda no existe.' }
  }

  const extension = MIME_EXTENSION_MAP[logoFile.type]
  const newLogoKey = buildStoreLogoKey(storeId, extension)
  const newLogoUrl = getPublicUrl(newLogoKey)
  const body = new Uint8Array(await logoFile.arrayBuffer())

  const client = getR2Client()
  const bucket = getR2Bucket()

  if (!client || !bucket) {
    return { ok: false, status: 500, error: 'R2 no está configurado. Revisa las variables de entorno.' }
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: newLogoKey,
      Body: body,
      ContentType: logoFile.type,
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
    } catch {
      // ignore rollback errors
    }
    throw error
  }

  if (store.logoKey && store.logoKey !== newLogoKey) {
    try {
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
        console.error('[STORE REPLACE LOGO CLEANUP ERROR]', cleanupError)
      }
    } catch (cleanupError) {
      console.error('[STORE REPLACE LOGO CLEANUP ERROR]', cleanupError)
    }
  }

  return { ok: true, storeId, logoUrl: newLogoUrl, logoKey: newLogoKey }
}
