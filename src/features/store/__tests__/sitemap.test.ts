import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('NEXTAUTH_URL', 'https://test.walo.app')
})

const mockPrisma = vi.hoisted(() => ({
  store: {
    findUnique: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

import sitemap from '@/app/[slug]/sitemap'

describe('WALO-035: Sitemap dinámico por tienda', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Sitemap con tienda activa', () => {
    it('retorna entrada de sitemap para tienda activa con slug válido', async () => {
      const now = new Date()
      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_1',
        slug: 'mi-tienda',
        updatedAt: now,
        isActive: true,
        products: [],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'mi-tienda' }) })

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        url: 'https://test.walo.app/mi-tienda',
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      })
    })

    it('usa lastModified del producto si es más reciente que la tienda', async () => {
      const storeDate = new Date('2025-06-01')
      const productDate = new Date('2025-06-03')

      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_1',
        slug: 'tienda-activa',
        updatedAt: storeDate,
        isActive: true,
        products: [
          {
            updatedAt: productDate,
          },
        ],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'tienda-activa' }) })

      expect(result[0].lastModified).toEqual(productDate)
    })

    it('usa lastModified de la tienda si productos son más antiguos', async () => {
      const storeDate = new Date('2025-06-03')
      const productDate = new Date('2025-06-01')

      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_1',
        slug: 'tienda-actualizada',
        updatedAt: storeDate,
        isActive: true,
        products: [
          {
            updatedAt: productDate,
          },
        ],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'tienda-actualizada' }) })

      expect(result[0].lastModified).toEqual(storeDate)
    })

    it('maneja tienda activa sin productos públicos', async () => {
      const storeDate = new Date('2025-06-02')

      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_1',
        slug: 'tienda-sin-productos',
        updatedAt: storeDate,
        isActive: true,
        products: [],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'tienda-sin-productos' }) })

      expect(result).toHaveLength(1)
      expect(result[0].lastModified).toEqual(storeDate)
    })

    it('respeta baseUrl desde NEXTAUTH_URL', async () => {
      const storeDate = new Date()

      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_1',
        slug: 'test-slug',
        updatedAt: storeDate,
        isActive: true,
        products: [],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'test-slug' }) })

      expect(result[0].url).toBe('https://test.walo.app/test-slug')
    })
  })

  describe('Sitemap con tienda inactiva', () => {
    it('retorna array vacío cuando tienda no está activa', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_2',
        slug: 'tienda-inactiva',
        updatedAt: new Date(),
        isActive: false,
        products: [],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'tienda-inactiva' }) })

      expect(result).toEqual([])
    })

    it('no incluye URLs de tienda inactiva en sitemap (no indexable)', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_archived',
        slug: 'archived-store',
        updatedAt: new Date(),
        isActive: false,
        products: [
          {
            updatedAt: new Date(),
          },
        ],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'archived-store' }) })

      expect(result).toHaveLength(0)
      expect(result.some((e) => e.url.includes('archived-store'))).toBe(false)
    })
  })

  describe('Sitemap con slug inexistente', () => {
    it('retorna array vacío cuando slug no existe', async () => {
      mockPrisma.store.findUnique.mockResolvedValue(null)

      const result = await sitemap({ params: Promise.resolve({ slug: 'slug-inexistente' }) })

      expect(result).toEqual([])
    })

    it('no hace throw para slug inexistente', async () => {
      mockPrisma.store.findUnique.mockResolvedValue(null)

      await expect(sitemap({ params: Promise.resolve({ slug: 'invalid-slug' }) })).resolves.not.toThrow()
    })
  })

  describe('Sitemap filtrando productos visibles', () => {
    it('query filtra solo productos con visible: true', async () => {
      const storeDate = new Date()

      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_1',
        slug: 'tienda-filtrada',
        updatedAt: storeDate,
        isActive: true,
        products: [
          {
            updatedAt: new Date(),
          },
        ],
      })

      await sitemap({ params: Promise.resolve({ slug: 'tienda-filtrada' }) })

      expect(mockPrisma.store.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'tienda-filtrada' },
          select: expect.objectContaining({
            products: expect.objectContaining({
              where: {
                visible: true,
              },
            }),
          }),
        })
      )
    })

    it('usa producto más reciente (orderBy updatedAt desc)', async () => {
      const oldDate = new Date('2025-05-01')
      const midDate = new Date('2025-06-01')
      const newestDate = new Date('2025-06-03')
      const storeDate = new Date('2025-05-15')

      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_1',
        slug: 'tienda-multiples',
        updatedAt: storeDate,
        isActive: true,
        products: [
          // Primer elemento es el más reciente (descending)
          { updatedAt: newestDate },
          { updatedAt: midDate },
          { updatedAt: oldDate },
        ],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'tienda-multiples' }) })

      expect(result[0].lastModified).toEqual(newestDate)
    })

    it('mantiene empty products array si no hay productos visibles', async () => {
      const storeDate = new Date()

      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_1',
        slug: 'tienda-sin-visibles',
        updatedAt: storeDate,
        isActive: true,
        products: [],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'tienda-sin-visibles' }) })

      expect(result).toHaveLength(1)
      expect(result[0].lastModified).toEqual(storeDate)
    })
  })

  describe('Cambios de frecuencia y prioridad', () => {
    it('always retorna changeFrequency: daily y priority: 0.8', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_1',
        slug: 'tienda-prioridad',
        updatedAt: new Date(),
        isActive: true,
        products: [],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'tienda-prioridad' }) })

      expect(result[0].changeFrequency).toBe('daily')
      expect(result[0].priority).toBe(0.8)
    })
  })

  describe('Integración: casos fin a fin', () => {
    it('flujo completo: tienda activa con 1+ productos visibles', async () => {
      const storeDate = new Date('2025-06-01')
      const productDate = new Date('2025-06-02')

      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_complete',
        slug: 'tienda-completa',
        updatedAt: storeDate,
        isActive: true,
        products: [{ updatedAt: productDate }],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'tienda-completa' }) })

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        url: 'https://test.walo.app/tienda-completa',
        lastModified: productDate,
        changeFrequency: 'daily',
        priority: 0.8,
      })
    })

    it('flujo: tienda activa pero sin productos públicos', async () => {
      const storeDate = new Date('2025-06-01')

      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_sin_pub',
        slug: 'tienda-privada',
        updatedAt: storeDate,
        isActive: true,
        products: [],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'tienda-privada' }) })

      expect(result).toHaveLength(1)
      expect(result[0].lastModified).toEqual(storeDate)
    })

    it('flujo: tienda no existe → sitemap vacío', async () => {
      mockPrisma.store.findUnique.mockResolvedValue(null)

      const result = await sitemap({ params: Promise.resolve({ slug: 'no-existe' }) })

      expect(result).toEqual([])
    })

    it('flujo: tienda existe pero inactiva → sitemap vacío', async () => {
      mockPrisma.store.findUnique.mockResolvedValue({
        id: 'store_archived',
        slug: 'archived',
        updatedAt: new Date(),
        isActive: false,
        products: [{ updatedAt: new Date() }],
      })

      const result = await sitemap({ params: Promise.resolve({ slug: 'archived' }) })

      expect(result).toEqual([])
    })
  })
})
