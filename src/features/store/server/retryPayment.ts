'use server'

import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { logError } from "@/lib/logger"
import { createPaymentIntent } from "./createPayment"

interface Item {
    id: string
    name: string
    price: number
    quantity: number
}

function isItemRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function retryPayment(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        })

        if (!order || !order.store) {
            return { success: false, error: "Pedido o tienda no encontrados." }
        }

        if (order.status !== OrderStatus.FAILED) {
            return { success: false, error: "Este pedido no es elegible para reintento." }
        }

        const rawItems = order.itemsSnapshot

        if (!Array.isArray(rawItems)) {
            return { success: false, error: "Formato de items inválido." }
        }

        const cartItems: Item[] = rawItems.map((item) => {
            if (!isItemRecord(item)) {
                return {
                    id: '',
                    name: '',
                    price: 0,
                    quantity: 0,
                }
            }

            return {
                id: String(item.id),
                name: String(item.name),
                price: Number(item.price),
                quantity: Number(item.quantity)
            }
        })

        return await createPaymentIntent({
            storeId: order.storeId,
            storeName: order.store.name,
            items: cartItems,
            totalAmount: Number(order.totalAmount),
            customerNotes: order.customerNotes ? String(order.customerNotes) : undefined,
            shippingMethod: (order.shippingMethod as 'pickup' | 'delivery') ?? 'pickup',
        })

    } catch {
        logError({
            event: 'payment.retry.error',
            scope: 'payment',
            message: 'Error al reintentar pago',
        })
        return { success: false, error: "Error interno al reintentar." }
    }
}
