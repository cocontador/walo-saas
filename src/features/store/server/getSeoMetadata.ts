import "server-only"

export type StoreSeoInput = {
  name?: string | null
  description?: string | null
  slug?: string | null
}

export type StoreSeoMetadata = {
  title: string
  description: string
}

const TITLE_MAX_LENGTH = 60
const DESCRIPTION_MAX_LENGTH = 160

export const DEFAULT_SEO_METADATA: StoreSeoMetadata = {
  title: "WALO | Tu catalogo digital",
  description:
    "Crea, personaliza y comparte tu catalogo digital con WALO para vender por internet.",
}

function normalizeText(value?: string | null) {
  return value?.trim().replace(/\s+/g, " ") ?? ""
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

export function getSeoMetadata(store: StoreSeoInput): StoreSeoMetadata {
  const normalizedName = normalizeText(store.name)
  const normalizedDescription = normalizeText(store.description)

  const titleBase = normalizedName
    ? `${normalizedName} | WALO`
    : DEFAULT_SEO_METADATA.title

  const descriptionBase =
    normalizedDescription ||
    (normalizedName
      ? `Explora el catalogo de ${normalizedName} en WALO.`
      : DEFAULT_SEO_METADATA.description)

  return {
    title: truncate(titleBase, TITLE_MAX_LENGTH),
    description: truncate(descriptionBase, DESCRIPTION_MAX_LENGTH),
  }
}
