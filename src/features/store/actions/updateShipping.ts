'use server'

import { prisma } from '@/lib/prisma'

export async function updateStoreShipping(storeId: string, data: {
    pickupAddress: string,
    allowPickup: boolean,
    allowDelivery: boolean
}) {
    return await prisma.store.update({
        where: { id: storeId },
        data: {
            pickupAddress: data.pickupAddress,
            allowPickup: data.allowPickup,
            allowDelivery: data.allowDelivery,
        }
    })
}