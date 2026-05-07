import { z } from 'zod'

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  price: z
    .number()
    .int('El precio debe ser un número entero')
    .min(1, 'El precio debe ser mayor a 0'),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .nullable()
    .optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
