'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['PENDING', 'PAID', 'FAILED', 'CANCELED'] as const
type OrderStatus = typeof VALID_STATUSES[number]

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { success: false, error: 'No autorizado' }

    const storeId = await getUserStoreId()
    if (!storeId) return { success: false, error: 'Tienda no encontrada' }

    if (!VALID_STATUSES.includes(newStatus)) {
        return { success: false, error: 'Estado inválido' }
    }

    const order = await prisma.order.findFirst({ where: { id: orderId, storeId }, select: { id: true } })
    if (!order) return { success: false, error: 'Pedido no encontrado' }

    await prisma.order.update({ where: { id: orderId }, data: { status: newStatus } })

    revalidatePath(`/dashboard/orders/${orderId}`)
    revalidatePath('/dashboard/orders')

    return { success: true }
}
