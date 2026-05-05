// src/features/store/actions/getStore.ts
import { prisma } from "@/lib/prisma";

export async function getStoreData(userId: string) {
    //  lógica del dashboard 
    const store = await prisma.store.findFirst({
        where: { memberships: { some: { userId } } },
    });

    return store;
}