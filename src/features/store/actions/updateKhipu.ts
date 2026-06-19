'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { z } from 'zod'

const schema = z.object({
    khipuReceiverId: z.string().min(1, 'El Receiver ID es obligatorio'),
    khipuSecret: z.string().optional(),
})

export async function updateKhipuSettings(_prev: unknown, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: 'No autenticado' }

    const storeId = await getUserStoreId()
    if (!storeId) return { success: false, error: 'Tienda no encontrada' }

    const parsed = schema.safeParse({
        khipuReceiverId: formData.get('khipuReceiverId'),
        khipuSecret: formData.get('khipuSecret'),
    })

    if (!parsed.success) {
        return { success: false, error: parsed.error.errors[0].message }
    }

    const { prisma } = await import('@/lib/prisma')
    await prisma.store.update({
        where: { id: storeId },
        data: {
            khipuReceiverId: parsed.data.khipuReceiverId,
            ...(parsed.data.khipuSecret ? { khipuSecret: parsed.data.khipuSecret } : {}),
        },
    })

    return { success: true }
}
