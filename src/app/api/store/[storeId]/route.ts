import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/server/auth'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const storeUpdateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres.')
    .regex(
      slugPattern,
      'El slug solo permite minúsculas, números y guiones (sin espacios).'
    ),
  description: z.string().optional().nullable(),
  whatsappPhone: z.string().optional().nullable(),
})

/**
 * Actualiza los datos de una tienda validando sesión, membresía y unicidad de slug.
 * @param req Request HTTP con payload de actualización.
 * @param params Parámetro dinámico de ruta con `storeId`.
 * @returns Respuesta JSON con la tienda actualizada o error controlado.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    const { prisma } = await import('@/lib/prisma')
    const body = await req.json()
    const validatedData = storeUpdateSchema.parse(body)

    const membership = await prisma.storeMember.findFirst({
      where: {
        storeId,
        userId: session.user.id,
        role: 'OWNER',
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
    }

    const normalizedSlug = validatedData.slug.trim().toLowerCase()

    const existingStore = await prisma.store.findFirst({
      where: {
        slug: normalizedSlug,
        NOT: { id: storeId },
      },
      select: { id: true },
    })

    if (existingStore) {
      return NextResponse.json(
        { error: 'Ese slug ya está en uso. Elige otro slug.' },
        { status: 409 }
      )
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        name: validatedData.name.trim(),
        slug: normalizedSlug,
        description: validatedData.description?.trim() ?? null,
        whatsappPhone: validatedData.whatsappPhone?.trim() ?? null,
      },
    })

    return NextResponse.json({ store }, { status: 200 })
  } catch (error) {
    console.error('[STORE PATCH ERROR]', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalles: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    const { prisma } = await import('@/lib/prisma')

    const membership = await prisma.storeMember.findFirst({
      where: {
        storeId,
        userId: session.user.id,
        role: 'OWNER',
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: { isActive: false },
    })

    return NextResponse.json({ store }, { status: 200 })
  } catch (error) {
    console.error('[STORE DELETE ERROR]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    const { prisma } = await import('@/lib/prisma')

    const membership = await prisma.storeMember.findFirst({
      where: {
        storeId,
        userId: session.user.id,
        role: 'OWNER',
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: { isActive: true },
    })

    return NextResponse.json({ store }, { status: 200 })
  } catch (error) {
    console.error('[STORE PUT ERROR]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
