import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'

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
        const { name, description } = await req.json()

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: 'El nombre debe tener al menos 2 caracteres.' },
                { status: 400 }
            )
        }

        // Verificar que el usuario es OWNER de la tienda
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
            data: {
                name: name.trim(),
                description: description?.trim() ?? null,
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