import { beforeEach, describe, expect, it, vi } from "vitest"
import { revalidatePath } from "next/cache"
import type { Store } from "@prisma/client"

import { setStoreActive } from "@/features/admin/actions/setStoreActive"
import { prisma } from "@/lib/prisma"
import {
  PlatformAdminAccessError,
  requirePlatformAdmin,
} from "@/lib/requirePlatformAdmin"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}))

vi.mock("@/lib/requirePlatformAdmin", () => ({
  PlatformAdminAccessError: class PlatformAdminAccessError extends Error {},
  requirePlatformAdmin: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    storeAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

const adminUser = {
  id: "admin-1",
  email: "admin@walo.local",
  name: "Admin",
  platformRole: "PLATFORM_ADMIN" as const,
}

const store: Store = {
  id: "store-1",
  slug: "mariatienda",
  name: "Maria Tienda",
  description: null,
  whatsappPhone: null,
  logoUrl: null,
  logoKey: null,
  isActive: false,
  acceptedTermsAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe("setStoreActive", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requirePlatformAdmin).mockResolvedValue(adminUser)
    vi.mocked(prisma.store.findUnique).mockResolvedValue(store)
    vi.mocked(prisma.store.update).mockResolvedValue(store)
    vi.mocked(prisma.storeAuditLog.create).mockResolvedValue({
      id: "audit-1",
      storeId: "store-1",
      actorId: "admin-1",
      action: "STORE_DEACTIVATED",
      reason: "Incumplimiento",
      createdAt: new Date(),
    })
    vi.mocked(prisma.$transaction).mockResolvedValue([])
  })

  it("bloquea usuarios que no son admin de plataforma", async () => {
    vi.mocked(requirePlatformAdmin).mockRejectedValue(new PlatformAdminAccessError())

    const result = await setStoreActive("store-1", false, "Incumplimiento")

    expect(result).toEqual({
      success: false,
      error: "No tienes permisos para moderar tiendas.",
    })
    expect(prisma.store.update).not.toHaveBeenCalled()
  })

  it("exige reason obligatorio", async () => {
    const result = await setStoreActive("store-1", false, "   ")

    expect(result).toEqual({
      success: false,
      error: "Debes indicar un motivo de moderación.",
    })
    expect(prisma.store.update).not.toHaveBeenCalled()
  })

  it("retorna error claro si la tienda no existe", async () => {
    vi.mocked(prisma.store.findUnique).mockResolvedValue(null)

    const result = await setStoreActive("store-missing", false, "Incumplimiento")

    expect(result).toEqual({
      success: false,
      error: "La tienda indicada no existe.",
    })
    expect(prisma.store.update).not.toHaveBeenCalled()
  })

  it("desactiva tienda y crea auditoría", async () => {
    const result = await setStoreActive("store-1", false, "Productos prohibidos")

    expect(result).toEqual({
      success: true,
      data: {
        storeId: "store-1",
        isActive: false,
        action: "STORE_DEACTIVATED",
      },
    })
    expect(prisma.store.update).toHaveBeenCalledWith({
      where: { id: "store-1" },
      data: { isActive: false },
    })
    expect(prisma.storeAuditLog.create).toHaveBeenCalledWith({
      data: {
        storeId: "store-1",
        actorId: "admin-1",
        action: "STORE_DEACTIVATED",
        reason: "Productos prohibidos",
      },
    })
    expect(revalidatePath).toHaveBeenCalledWith("/admin/stores")
    expect(revalidatePath).toHaveBeenCalledWith("/mariatienda")
  })

  it("reactiva tienda y crea auditoría", async () => {
    const result = await setStoreActive("store-1", true, "Revisión aprobada")

    expect(result).toEqual({
      success: true,
      data: {
        storeId: "store-1",
        isActive: true,
        action: "STORE_ACTIVATED",
      },
    })
    expect(prisma.store.update).toHaveBeenCalledWith({
      where: { id: "store-1" },
      data: { isActive: true },
    })
    expect(prisma.storeAuditLog.create).toHaveBeenCalledWith({
      data: {
        storeId: "store-1",
        actorId: "admin-1",
        action: "STORE_ACTIVATED",
        reason: "Revisión aprobada",
      },
    })
  })
})
