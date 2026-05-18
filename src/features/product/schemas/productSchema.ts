import { z } from 'zod'

// Base schema with common product validations
const baseProductSchema = z.object({
  name: z
    .string()
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

// Schema for creating products (visible defaults to true in the action)
export const createProductSchema = baseProductSchema

// Schema for updating products (all fields optional, can include visible)
export const updateProductSchema = baseProductSchema
  .extend({
    visible: z.boolean().optional(),
  })
  .partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
