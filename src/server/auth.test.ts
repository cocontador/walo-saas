import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: { findUnique: vi.fn() },
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import { authOptions } from './auth'

// Hash real de coste mínimo calculado una vez para velocidad en tests
const CORRECT_PASSWORD = 'correcta'
const CORRECT_HASH = bcrypt.hashSync(CORRECT_PASSWORD, 1)

// next-auth's CredentialsProvider keeps the real authorize in `.options.authorize`
// (the top-level `.authorize` is always `() => null`; next-auth uses options internally)
const credentialsProvider = (authOptions.providers[0] as unknown as {
  options: { authorize: (credentials: Record<string, string>) => Promise<unknown> }
}).options

describe('authOptions - authorize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve null si faltan credenciales', async () => {
    const result = await credentialsProvider.authorize({ email: '', password: '' })
    expect(result).toBeNull()
  })

  it('devuelve null si el usuario no existe', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const result = await credentialsProvider.authorize({
      email: 'no-existe@ejemplo.com',
      password: 'cualquiera',
    })

    expect(result).toBeNull()
  })

  it('devuelve null si la contraseña es incorrecta', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1', email: 'ana@ejemplo.com', name: 'Ana', passwordHash: CORRECT_HASH,
    })

    const result = await credentialsProvider.authorize({
      email: 'ana@ejemplo.com',
      password: 'incorrecta',
    })

    expect(result).toBeNull()
  })

  it('normaliza el email a minúsculas antes de buscar en la BD', async () => {
    // Retornar null para llegar solo hasta findUnique y verificar el argumento
    mockPrisma.user.findUnique.mockResolvedValue(null)

    await credentialsProvider.authorize({
      email: 'ANA@EJEMPLO.COM',
      password: CORRECT_PASSWORD,
    })

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'ana@ejemplo.com' } })
    )
  })

  it('devuelve el usuario si las credenciales son correctas', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1', email: 'ana@ejemplo.com', name: 'Ana', passwordHash: CORRECT_HASH,
    })

    // Email en minúscula para aislar el test de éxito de la normalización
    const result = await credentialsProvider.authorize({
      email: 'ana@ejemplo.com',
      password: CORRECT_PASSWORD,
    })

    expect(result).toMatchObject({ id: 'u1', email: 'ana@ejemplo.com' })
  })
})
