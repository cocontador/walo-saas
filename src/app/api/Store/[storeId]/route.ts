import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { z } from 'zod'

// 1. Definimos el esquema de Zod fuera de las funciones
const storeUpdateSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    description: z.string().optional().nullable(),
    slug: z.string().optional(),
    whatsappPhone: z.string().optional().nullable(),
})

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ storeId: string }> } // <-- Cambio: params ahora es Promise
) {
    try {
        const { storeId } = await params // <-- Cambio: resolvemos la promesa

        const session = await getServerSession(authOptions)
        // 2. Verificamos directamente el ID
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
        }

        const { prisma } = await import('@/lib/prisma')
        const body = await req.json()

        // 3. Validamos el body con Zod
        const validatedData = storeUpdateSchema.parse(body)

        // 4. Usamos userId en lugar del email anidado
        const membership = await prisma.storeMember.findFirst({
            where: {
                storeId: storeId, // <-- Cambio: usamos la variable ya resuelta
                userId: session.user.id,
                role: 'OWNER',
            },
        })

        if (!membership) {
            return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
        }

        const newSlug = validatedData.slug
            ? generateSlug(validatedData.slug)
            : generateSlug(validatedData.name)

        const existingStore = await prisma.store.findFirst({
            where: {
                slug: newSlug,
                NOT: { id: storeId }, // <-- Cambio: usamos la variable
            },
        })

        if (existingStore) {
            return NextResponse.json(
                { error: 'Ese slug ya está en uso. Elige otro nombre.' },
                { status: 409 }
            )
        }

        const store = await prisma.store.update({
            where: { id: storeId }, // <-- Cambio: usamos la variable
            data: {
                name: validatedData.name.trim(),
                description: validatedData.description?.trim() ?? null,
                slug: newSlug,
                whatsappPhone: validatedData.whatsappPhone?.trim() ?? null,
            },
        })

        return NextResponse.json({ store }, { status: 200 })
    } catch (error) {
        console.error('[STORE PATCH ERROR]', error)

        // 5. Para atrapar errores específicos de validación de Zod
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
    { params }: { params: Promise<{ storeId: string }> } // <-- Cambio: params es Promise
) {
    try {
        const { storeId } = await params // <-- Cambio: resolvemos la promesa

        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
        }

        const { prisma } = await import('@/lib/prisma')

        const membership = await prisma.storeMember.findFirst({
            where: {
                storeId: storeId, // <-- Cambio: usamos la variable
                userId: session.user.id,
                role: 'OWNER',
            },
        })

        if (!membership) {
            return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
        }

        const store = await prisma.store.update({
            where: { id: storeId }, // <-- Cambio: usamos la variable
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
    { params }: { params: Promise<{ storeId: string }> } // <-- Cambio: params es Promise
) {
    try {
        const { storeId } = await params // <-- Cambio: resolvemos la promesa

        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
        }

        const { prisma } = await import('@/lib/prisma')

        const membership = await prisma.storeMember.findFirst({
            where: {
                storeId: storeId, // <-- Cambio: usamos la variable
                userId: session.user.id,
                role: 'OWNER',
            },
        })

        if (!membership) {
            return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
        }

        const store = await prisma.store.update({
            where: { id: storeId }, // <-- Cambio: usamos la variable
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