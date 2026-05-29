import { z } from 'zod'

const baseProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  price: z
    .number()
    .int('El precio debe ser un número entero')
    .positive('El precio debe ser mayor a 0'),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .nullable()
    .optional(),
})

export const createProductSchema = baseProductSchema
  .extend({
    categoryId: z.string().trim().optional(),
  })
  .strict()

export const updateProductSchema = baseProductSchema
  .extend({
    visible: z.boolean().optional(),
    categoryId: z.string().trim().optional().nullable(),
  })
  .partial()
  .strict()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
