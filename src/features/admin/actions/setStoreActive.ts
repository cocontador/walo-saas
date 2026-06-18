"use server"

import "server-only"

import { revalidatePath } from "next/cache"

import { logError } from "@/lib/logger"
import {
  PlatformAdminAccessError,
  requirePlatformAdmin,
} from "@/lib/requirePlatformAdmin"
import { prisma } from "@/lib/prisma"

export type SetStoreActiveResult =
  | {
      success: true
      data: {
        storeId: string
        isActive: boolean
        action: "STORE_ACTIVATED" | "STORE_DEACTIVATED"
      }
    }
  | {
      success: false
      error: string
    }

export type SetStoreActiveFormState = {
  status: "idle" | "success" | "error"
  message: string
}

export async function setStoreActive(
  storeId: string,
  isActive: boolean,
  reason: string
): Promise<SetStoreActiveResult> {
  try {
    const actor = await requirePlatformAdmin()
    const normalizedStoreId = storeId.trim()
    const normalizedReason = reason.trim()

    if (!normalizedStoreId) {
      return { success: false, error: "Selecciona una tienda válida." }
    }

    if (!normalizedReason) {
      return { success: false, error: "Debes indicar un motivo de moderación." }
    }

    const store = await prisma.store.findUnique({
      where: { id: normalizedStoreId },
      select: { id: true, slug: true },
    })

    if (!store) {
      return { success: false, error: "La tienda indicada no existe." }
    }

    const action = isActive ? "STORE_ACTIVATED" : "STORE_DEACTIVATED"

    await prisma.$transaction([
      prisma.store.update({
        where: { id: store.id },
        data: { isActive },
      }),
      prisma.storeAuditLog.create({
        data: {
          storeId: store.id,
          actorId: actor.id,
          action,
          reason: normalizedReason,
        },
      }),
    ])

    revalidatePath("/admin/stores")
    revalidatePath(`/${store.slug}`)

    return {
      success: true,
      data: {
        storeId: store.id,
        isActive,
        action,
      },
    }
  } catch (error) {
    if (error instanceof PlatformAdminAccessError) {
      return {
        success: false,
        error: "No tienes permisos para moderar tiendas.",
      }
    }

    logError({
      event: "admin.store_moderation.failed",
      scope: "admin",
      message: "Fallo al moderar estado de tienda",
      meta: {
        errorName: error instanceof Error ? error.name : "UnknownError",
      },
    })

    return {
      success: false,
      error: "No pudimos actualizar el estado de la tienda.",
    }
  }
}

export async function setStoreActiveFromForm(
  _previousState: SetStoreActiveFormState,
  formData: FormData
): Promise<SetStoreActiveFormState> {
  const storeId = String(formData.get("storeId") ?? "")
  const reason = String(formData.get("reason") ?? "")
  const isActive = String(formData.get("isActive") ?? "") === "true"

  const result = await setStoreActive(storeId, isActive, reason)

  if (!result.success) {
    return {
      status: "error",
      message: result.error,
    }
  }

  return {
    status: "success",
    message: isActive ? "Tienda reactivada correctamente." : "Tienda desactivada correctamente.",
  }
}
