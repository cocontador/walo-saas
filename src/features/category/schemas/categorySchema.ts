import { z } from 'zod'

export const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'El nombre es requerido')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
  })
  .strict()

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'El nombre es requerido')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .optional(),
    visible: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
