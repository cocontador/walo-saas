import "server-only"

import { getServerSession } from "next-auth"
import type { PlatformRole } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { authOptions } from "@/server/auth"

export class PlatformAdminAccessError extends Error {
  constructor(message = "Platform admin access required") {
    super(message)
    this.name = "PlatformAdminAccessError"
  }
}

export type PlatformAdminUser = {
  id: string
  email: string
  name: string | null
  platformRole: PlatformRole
}

export async function requirePlatformAdmin(): Promise<PlatformAdminUser> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new PlatformAdminAccessError("No authenticated user")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      platformRole: true,
    },
  })

  if (!user || user.platformRole !== "PLATFORM_ADMIN") {
    throw new PlatformAdminAccessError("User is not a platform admin")
  }

  return user
}
