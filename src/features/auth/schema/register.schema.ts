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

    slug: z
        .string()
        .min(2, 'La URL debe tener al menos 2 caracteres.')
        .max(30, 'La URL no puede superar los 30 caracteres.')
        .regex(/^[a-z0-9-]+$/, 'La URL solo puede tener minúsculas, números y guiones.'),

    whatsappPhone: z
        .string()
        .regex(/^\+569\d{8}$/, 'El número de WhatsApp debe tener 8 dígitos (ej: 1234 5678).'),

    acceptedTerms: z
        .boolean()
        .refine((value) => value === true, {
            message: 'Debes aceptar los Términos y Condiciones para crear tu tienda.',
        }),
})

export type RegisterInput = z.infer<typeof registerSchema>