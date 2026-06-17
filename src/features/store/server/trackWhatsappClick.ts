'use server'

import { prisma } from "@/lib/prisma"
import { logError } from "@/lib/logger"

export async function trackWhatsappClick(storeId: string) {
    try {
        await prisma.whatsappClickEvent.create({
            data: {
                storeId: storeId
            }
        })
        return { success: true }
    } catch {
        logError({ event: 'store.whatsapp.click.error', scope: 'analytics', message: 'Error guardando métrica de WhatsApp' })
        return { success: false }
    }
}