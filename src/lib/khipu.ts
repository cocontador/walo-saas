// src/lib/khipu.ts

export const khipuConfig = {
    receiverId: process.env.KHIPU_RECEIVER_ID || '',
    secret: process.env.KHIPU_SECRET || '',
    // Usamos la versión 2.0 de la API de Khipu
    apiUrl: 'https://khipu.com/api/2.0',
}

// Pequeña validación para evitar que la app falle silenciosamente 
// si se nos olvida poner las variables en Vercel más adelante.
export function validateKhipuConfig() {
    if (!khipuConfig.receiverId || !khipuConfig.secret) {
        throw new Error("Faltan las credenciales de Khipu en las variables de entorno.")
    }
}