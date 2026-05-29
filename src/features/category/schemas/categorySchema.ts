import { z } from 'zod'

export const categoryBaseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'El nombre es requerido')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    const extraKeys = Object.keys(data).filter((key) => key !== 'name')

    if (extraKeys.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Campo no permitido',
        path: extraKeys,
      })
    }
  })

export const createCategorySchema = categoryBaseSchema

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
