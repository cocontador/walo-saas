import type { MetadataRoute } from "next"

import { getBaseUrl } from "@/lib/getBaseUrl"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function sitemap({ params }: Props): Promise<MetadataRoute.Sitemap> {
  const { slug } = await params
  const baseUrl = getBaseUrl()

  const store = await prisma.store.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
      isActive: true,
      products: {
        where: {
          visible: true,
        },
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  })

  if (!store || !store.isActive) {
    return []
  }

  const latestPublicProductUpdate = store.products[0]?.updatedAt
  const lastModified =
    latestPublicProductUpdate && latestPublicProductUpdate > store.updatedAt
      ? latestPublicProductUpdate
      : store.updatedAt

  return [
    {
      url: `${baseUrl}/${store.slug}`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ]
}
