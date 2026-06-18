import { beforeEach, describe, expect, it, vi } from "vitest"
import { getServerSession } from "next-auth"
import type { PlatformRole, User } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import {
  PlatformAdminAccessError,
  requirePlatformAdmin,
} from "@/lib/requirePlatformAdmin"

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

describe("requirePlatformAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("permite usuarios PLATFORM_ADMIN", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-admin", email: "admin@walo.local" },
      expires: new Date(Date.now() + 60_000).toISOString(),
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(createUser("PLATFORM_ADMIN"))

    const result = await requirePlatformAdmin()

    expect(result.id).toBe("user-admin")
    expect(result.platformRole).toBe("PLATFORM_ADMIN")
  })

  it("bloquea usuarios sin sesión", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    await expect(requirePlatformAdmin()).rejects.toBeInstanceOf(PlatformAdminAccessError)
    expect(prisma.user.findUnique).not.toHaveBeenCalled()
  })

  it("bloquea usuarios USER", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", email: "user@walo.local" },
      expires: new Date(Date.now() + 60_000).toISOString(),
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(createUser("USER"))

    await expect(requirePlatformAdmin()).rejects.toBeInstanceOf(PlatformAdminAccessError)
  })
})

function createUser(platformRole: PlatformRole): User {
  return {
    id: platformRole === "PLATFORM_ADMIN" ? "user-admin" : "user-1",
    email: platformRole === "PLATFORM_ADMIN" ? "admin@walo.local" : "user@walo.local",
    name: platformRole === "PLATFORM_ADMIN" ? "Admin" : "Usuario",
    passwordHash: "hash",
    platformRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
