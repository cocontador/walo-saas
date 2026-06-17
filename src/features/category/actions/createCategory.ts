'use server'

import "server-only"

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { getUserStoreId } from '@/server/store'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'
import { createCategorySchema, type CreateCategoryInput } from '@/features/category/schemas'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { ActionResult, CategoryListItem } from '@/features/category/types'

export async function createCategory(
  input: CreateCategoryInput
): Promise<ActionResult<CategoryListItem>> {
  try {
    const validatedData = createCategorySchema.parse(input)

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'No autenticado. Por favor inicia sesión.',
      }
    }

    const storeId = await getUserStoreId()

    if (!storeId) {
      return {
        success: false,
        error: 'No tienes una tienda asociada. Contacta a soporte.',
      }
    }

    const category = await prisma.category.create({
      data: {
        storeId,
        name: validatedData.name,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        visible: true,
      },
    })

    revalidatePath('/dashboard/categories')
    revalidatePath('/dashboard/products')

    return {
      success: true,
      data: category,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return {
        success: false,
        error: firstError.message || 'Datos inválidos. Por favor verifica los campos.',
      }
    }

    if (
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') ||
      (error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as Record<string, unknown>).code === 'P2002')
    ) {
      return {
        success: false,
        error: 'Ya existe una categoría con ese nombre en tu tienda.',
      }
    }

    logError({
      event: 'category.create.failed',
      scope: 'category',
      message: 'Fallo al crear categoría',
      errorCode: 'CATEGORY_CREATE_FAILED',
      meta: { errorName: error instanceof Error ? error.name : 'UnknownError' },
    })
    return {
      success: false,
      error: 'Ocurrió un error al crear la categoría. Por favor intenta nuevamente.',
    }
  }
}
