import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'

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
    { params }: { params: { storeId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
        }

        const { prisma } = await import('@/lib/prisma')
        const { name, description, slug, whatsappPhone } = await req.json()

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: 'El nombre debe tener al menos 2 caracteres.' },
                { status: 400 }
            )
        }

        const membership = await prisma.storeMember.findFirst({
            where: {
                storeId: params.storeId,
                user: { email: session.user.email! },
                role: 'OWNER',
            },
        })

        if (!membership) {
            return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
        }

        const newSlug = slug ? generateSlug(slug) : generateSlug(name)

        const existingStore = await prisma.store.findFirst({
            where: {
                slug: newSlug,
                NOT: { id: params.storeId },
            },
        })

        if (existingStore) {
            return NextResponse.json(
                { error: 'Ese slug ya está en uso. Elige otro nombre.' },
                { status: 409 }
            )
        }

        const store = await prisma.store.update({
            where: { id: params.storeId },
            data: {
                name: name.trim(),
                description: description?.trim() ?? null,
                slug: newSlug,
                whatsappPhone: whatsappPhone?.trim() ?? null,
            },
        })

        return NextResponse.json({ store }, { status: 200 })
    } catch (error) {
        console.error('[STORE PATCH ERROR]', error)
        return NextResponse.json(
            { error: 'Error interno del servidor.' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { storeId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
        }

        const { prisma } = await import('@/lib/prisma')

        const membership = await prisma.storeMember.findFirst({
            where: {
                storeId: params.storeId,
                user: { email: session.user.email! },
                role: 'OWNER',
            },
        })

        if (!membership) {
            return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
        }

        const store = await prisma.store.update({
            where: { id: params.storeId },
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
    { params }: { params: { storeId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
        }

        const { prisma } = await import('@/lib/prisma')

        const membership = await prisma.storeMember.findFirst({
            where: {
                storeId: params.storeId,
                user: { email: session.user.email! },
                role: 'OWNER',
            },
        })

        if (!membership) {
            return NextResponse.json({ error: 'No tienes permiso.' }, { status: 403 })
        }

        const store = await prisma.store.update({
            where: { id: params.storeId },
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