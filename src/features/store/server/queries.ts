import "server-only"
import { logInfo, logWarn } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

export async function getStoreBySlug(slug: string) {
    logInfo({
        event: "public_catalog.request",
        scope: "store",
        message: "Resolviendo tienda publica por slug",
        slug,
    })

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
            allowPickup: true,
            allowDelivery: true,
            deliveryCost: true,
            khipuReceiverId: true,
        },
    })

    if (!store) {
        logWarn({
            event: "public_catalog.store_not_found",
            scope: "store",
            message: "Tienda publica no encontrada",
            slug,
        })
        return null
    }

    if (!store.isActive) {
        logWarn({
            event: "public_catalog.store_inactive",
            scope: "store",
            message: "Tienda publica inactiva",
            slug,
            storeId: store.id,
        })
        return null
    }

    return store
}

export async function getVisibleProducts(storeId: string) {
    const products = await prisma.product.findMany({
        where: {
            storeId,
            visible: true,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            imageUrl: true,
            categories: {
                select: {
                    category: {
                        select: { name: true, visible: true },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    logInfo({
        event: "public_catalog.products_loaded",
        scope: "store",
        message: "Productos visibles cargados para catalogo publico",
        storeId,
        meta: {
            visibleProducts: products.length,
        },
    })

    return products
}

export async function getPublicProductBySlug(slugOrId: string, storeId: string) {
    return await prisma.product.findFirst({
        where: {
            storeId,
            visible: true,
            OR: [{ slug: slugOrId }, { id: slugOrId }],
        },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            imageUrl: true,
            categories: {
                select: {
                    category: {
                        select: { name: true, visible: true },
                    },
                },
            },
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
