import { z } from 'zod'

export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres.')
        .max(20, 'El nombre no puede superar los 20 caracteres.'),

    storeName: z
        .string()
        .min(2, 'El nombre de la tienda debe tener al menos 2 caracteres.')
        .max(20, 'El nombre de la tienda no puede superar los 20 caracteres.'),

    email: z
        .string()
        .email('El correo electrónico no es válido.'),

    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
})

export type RegisterInput = z.infer<typeof registerSchema>