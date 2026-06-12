'use server'

import { prisma } from "@/lib/prisma"

export async function trackWhatsappClick(storeId: string) {
    try {
        await prisma.whatsappClickEvent.create({
            data: {
                storeId: storeId
            }
        })
        return { success: true }
    } catch (error) {
        // Si la métrica falla por alguna razón de red, solo lo anotamos en consola 
        // pero no rompemos la experiencia del usuario.
        console.error("Error guardando la métrica de WhatsApp:", error)
        return { success: false }
    }
}