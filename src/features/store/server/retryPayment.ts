'use server'

import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { createPaymentIntent } from "./createPayment"

interface Item {
    id: string;
    name: string;
    price: number;
    quantity: number;
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

        // CAMBIO AQUÍ: Usamos 'as any' primero para liberar la restricción de tipo JsonValue
        const rawItems = (order as any)?.items;

        if (!Array.isArray(rawItems)) {
            return { success: false, error: "Formato de items inválido." }
        }

        // Mapeo seguro
        const cartItems: Item[] = rawItems.map((item: any) => ({
            id: String(item.id),
            name: String(item.name),
            price: Number(item.price),
            quantity: Number(item.quantity)
        }));

        const retryResult = await createPaymentIntent({
            storeId: order.storeId,
            storeName: order.store.name,
            items: cartItems,
            totalAmount: Number(order.totalAmount),
            customerNotes: order.customerNotes ? String(order.customerNotes) : undefined,
        })

        return retryResult

    } catch (error) {
        console.error("Error al reintentar:", error)
        return { success: false, error: "Error interno al reintentar." }
    }
}