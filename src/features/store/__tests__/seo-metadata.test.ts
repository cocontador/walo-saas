import { describe, expect, it } from 'vitest'

import {
  DEFAULT_SEO_METADATA,
  getSeoMetadata,
  type StoreSeoInput,
} from '@/features/store/server/getSeoMetadata'

describe('WALO-034: SEO Metadata', () => {
  describe('getSeoMetadata - metadata con nombre y descripción completa', () => {
    it('genera title y description normalizados cuando están presentes', () => {
      const input: StoreSeoInput = {
        name: 'Mi Tienda',
        description: 'Vendo productos de excelente calidad a precios competitivos',
        slug: 'mi-tienda',
      }

      const result = getSeoMetadata(input)

      expect(result.title).toBe('Mi Tienda | WALO')
      expect(result.description).toBe('Vendo productos de excelente calidad a precios competitivos')
    })

    it('normaliza espacios múltiples en nombre y descripción', () => {
      const input: StoreSeoInput = {
        name: '  Mi   Tienda   Especial  ',
        description: '  Tienda   con   espacios   múltiples  ',
      }

      const result = getSeoMetadata(input)

      expect(result.title).toBe('Mi Tienda Especial | WALO')
      expect(result.description).toBe('Tienda con espacios múltiples')
    })

    it('trunca title a 60 caracteres máximo', () => {
      const longName = 'A'.repeat(70)
      const input: StoreSeoInput = {
        name: longName,
        description: 'Description corta',
      }

      const result = getSeoMetadata(input)

      expect(result.title.length).toBeLessThanOrEqual(60)
      expect(result.title).toContain('…')
      expect(result.title).toMatch(/A+…$/)
    })

    it('trunca description a 160 caracteres máximo', () => {
      const longDescription = 'Lorem ipsum dolor sit amet, '.repeat(10)
      const input: StoreSeoInput = {
        name: 'Tienda',
        description: longDescription,
      }

      const result = getSeoMetadata(input)

      expect(result.description.length).toBeLessThanOrEqual(160)
      expect(result.description).toContain('…')
    })

    it('trimEnd preserva formato cuando trunca', () => {
      const input: StoreSeoInput = {
        name: 'Tienda',
        description: 'A'.repeat(165),
      }

      const result = getSeoMetadata(input)

      // El truncate hace trimEnd antes de agregar …
      expect(result.description).not.toMatch(/\s+…/)
    })
  })

  describe('getSeoMetadata - fallbacks y casos vacíos', () => {
    it('retorna title default cuando name está vacío', () => {
      const input: StoreSeoInput = {
        name: '',
        description: 'Description aquí',
      }

      const result = getSeoMetadata(input)

      expect(result.title).toBe(DEFAULT_SEO_METADATA.title)
      expect(result.title).toBe('WALO | Tu catalogo digital')
    })

    it('retorna title default cuando name es null', () => {
      const input: StoreSeoInput = {
        name: null,
        description: 'Description aquí',
      }

      const result = getSeoMetadata(input)

      expect(result.title).toBe(DEFAULT_SEO_METADATA.title)
    })

    it('retorna title default cuando name es undefined', () => {
      const input: StoreSeoInput = {
        description: 'Description aquí',
      }

      const result = getSeoMetadata(input)

      expect(result.title).toBe(DEFAULT_SEO_METADATA.title)
    })

    it('genera description genérica con fallback cuando no hay description pero sí name', () => {
      const input: StoreSeoInput = {
        name: 'Mi Negocio',
        description: '',
      }

      const result = getSeoMetadata(input)

      expect(result.description).toBe('Explora el catalogo de Mi Negocio en WALO.')
      expect(result.description).not.toBe(DEFAULT_SEO_METADATA.description)
    })

    it('retorna description default cuando ambos name y description están vacíos', () => {
      const input: StoreSeoInput = {
        name: '',
        description: '',
      }

      const result = getSeoMetadata(input)

      expect(result.description).toBe(DEFAULT_SEO_METADATA.description)
    })

    it('retorna description default cuando ambos son null', () => {
      const input: StoreSeoInput = {
        name: null,
        description: null,
      }

      const result = getSeoMetadata(input)

      expect(result.description).toBe(DEFAULT_SEO_METADATA.description)
    })

    it('maneja input completamente vacío', () => {
      const input: StoreSeoInput = {}

      const result = getSeoMetadata(input)

      expect(result).toEqual(DEFAULT_SEO_METADATA)
    })

    it('ignora slug (no es usado en generación de metadata)', () => {
      const input1: StoreSeoInput = {
        name: 'Tienda A',
        description: 'Desc A',
        slug: 'tienda-a',
      }

      const input2: StoreSeoInput = {
        name: 'Tienda A',
        description: 'Desc A',
        slug: 'slug-diferente',
      }

      const result1 = getSeoMetadata(input1)
      const result2 = getSeoMetadata(input2)

      expect(result1).toEqual(result2)
    })
  })

  describe('getSeoMetadata - casos edge', () => {
    it('maneja whitespace-only strings como vacíos', () => {
      const input: StoreSeoInput = {
        name: '   ',
        description: '\t\n',
      }

      const result = getSeoMetadata(input)

      expect(result.title).toBe(DEFAULT_SEO_METADATA.title)
      expect(result.description).toBe(DEFAULT_SEO_METADATA.description)
    })

    it('preserva caracteres especiales en name y description', () => {
      const input: StoreSeoInput = {
        name: 'Tienda & Cia.',
        description: 'Productos 100% orgánicos™',
      }

      const result = getSeoMetadata(input)

      expect(result.title).toContain('&')
      expect(result.title).toContain('Cia.')
      expect(result.description).toContain('™')
      expect(result.description).toContain('orgánicos')
    })

    it('maneja unicode sin problemas', () => {
      const input: StoreSeoInput = {
        name: '日本製品 Tienda',
        description: 'Vendemos 🎁 regalos especiales',
      }

      const result = getSeoMetadata(input)

      expect(result.title).toContain('日本製品')
      expect(result.description).toContain('🎁')
    })

    it('truncate añade … solo si es necesario', () => {
      const input1: StoreSeoInput = {
        name: 'Short',
        description: 'Short description',
      }

      const result1 = getSeoMetadata(input1)

      expect(result1.title).not.toContain('…')
      expect(result1.description).not.toContain('…')
    })

    it('DEFAULT_SEO_METADATA es constante invariante', () => {
      const originalTitle = DEFAULT_SEO_METADATA.title
      const originalDesc = DEFAULT_SEO_METADATA.description

      getSeoMetadata({})
      getSeoMetadata({ name: 'Test' })

      expect(DEFAULT_SEO_METADATA.title).toBe(originalTitle)
      expect(DEFAULT_SEO_METADATA.description).toBe(originalDesc)
    })
  })
})
