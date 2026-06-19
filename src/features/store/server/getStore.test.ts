/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockStoreFindFirst } = vi.hoisted(() => ({
  mockStoreFindFirst: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { store: { findFirst: mockStoreFindFirst } },
}))

import { getStoreData } from './getStore'

describe('getStoreData - WALO-17: Vista de tienda en dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería retornar la tienda del usuario autenticado', async () => {
    const mockStore = {
      id: 'store-1',
      name: 'Mi Tienda',
      slug: 'mi-tienda',
      whatsappPhone: '+56912345678',
      isActive: true,
    }
    mockStoreFindFirst.mockResolvedValue(mockStore)

    const result = await getStoreData('user-1')

    expect(result).toEqual(mockStore)
    // La consulta siempre filtra por membresía del usuario — nunca expone tiendas ajenas
    expect(mockStoreFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { memberships: { some: { userId: 'user-1' } } },
      })
    )
  })

  it('debería retornar null cuando el usuario no tiene tienda', async () => {
    mockStoreFindFirst.mockResolvedValue(null)

    const result = await getStoreData('user-sin-tienda')

    // Estado vacío: no rompe el dashboard, simplemente no hay tienda
    expect(result).toBeNull()
  })

  it('debería usar el userId recibido para aislar el tenant', async () => {
    mockStoreFindFirst.mockResolvedValue(null)

    await getStoreData('user-xyz')

    const callArg = mockStoreFindFirst.mock.calls[0][0]
    // Nunca consulta sin filtro de usuario
    expect(callArg.where.memberships.some.userId).toBe('user-xyz')
  })
})
