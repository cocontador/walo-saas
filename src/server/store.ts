import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { prisma } from '@/lib/prisma'

export async function getUserStore() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  // Get the user's store membership
  const membership = await prisma.storeMember.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      store: true,
    },
  })

  if (!membership) {
    return null
  }

  return membership.store
}

export async function getUserStoreId() {
  const store = await getUserStore()
  return store?.id ?? null
}
