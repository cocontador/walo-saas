/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockBcryptCompare, mockUserFindUnique } = vi.hoisted(() => ({
  mockBcryptCompare: vi.fn(),
  mockUserFindUnique: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
  default: { compare: mockBcryptCompare },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: mockUserFindUnique } },
}))

import { authOptions } from './auth'

// Extrae la función authorize del provider de credenciales
const credentialsProvider = authOptions.providers[0] as any
const authorize = credentialsProvider.authorize as (
  credentials: { email: string; password: string } | undefined
) => Promise<unknown>

describe('authOptions - WALO-13: Logout y control de acceso', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería retornar null para usuario inexistente en DB', async () => {
    mockUserFindUnique.mockResolvedValue(null)

    const result = await authorize({ email: 'noexiste@test.com', password: '123456' })

    expect(result).toBeNull()
  })

  it('debería retornar null cuando la contraseña es incorrecta', async () => {
    mockUserFindUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      passwordHash: 'hash-stored',
      name: 'Test',
    })
    mockBcryptCompare.mockResolvedValue(false)

    const result = await authorize({ email: 'test@test.com', password: 'wrong' })

    expect(result).toBeNull()
  })

  it('debería retornar null cuando no se proveen credenciales', async () => {
    const result = await authorize(undefined)

    expect(result).toBeNull()
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })

  it('debería retornar null cuando el email está vacío (sin llegar a DB)', async () => {
    // Un email vacío es bloqueado antes de consultar la base de datos
    const result = await authorize({ email: '', password: 'pass' })

    expect(result).toBeNull()
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })
})

describe('authOptions - WALO-15: Persistencia de sesión JWT', () => {
  it('debería usar estrategia JWT', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
  })

  it('debería inyectar el id del token en la sesión (callback session)', async () => {
    const sessionCallback = authOptions.callbacks?.session as any

    const mockSession = {
      user: { email: 'test@test.com', name: 'Test' },
      expires: '2099-01-01',
    }
    const mockToken = { sub: 'user-123' }

    const result = await sessionCallback({ session: mockSession, token: mockToken })

    // El id del usuario queda en la sesión para identificarlo en server actions
    expect(result.user.id).toBe('user-123')
  })

  it('debería tener /login configurado como página de inicio de sesión', () => {
    expect(authOptions.pages?.signIn).toBe('/login')
  })
})
