import "server-only"
import { prisma } from "@/lib/prisma"

export async function getStoreBySlug(slug: string) {
    const store = await prisma.store.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            logoUrl: true,
            whatsappPhone: true,
            isActive: true,
        },
    })

    if (!store || !store.isActive) return null

    return store
}

export async function getVisibleProducts(storeId: string) {
    return prisma.product.findMany({
        where: {
            storeId,
            visible: true,
        },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })
}

export async function canManageStoreByUser(storeId: string, userId: string) {
    const membership = await prisma.storeMember.findFirst({
        where: {
            storeId,
            userId,
            role: "OWNER",
        },
        select: { id: true },
    })

    return Boolean(membership)
}
