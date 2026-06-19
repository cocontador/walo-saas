/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/server/auth', () => ({ authOptions: {} }))

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { requireAuth } from './require-auth'

describe('requireAuth - WALO-14: Protección de rutas privadas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería redirigir a /login cuando no hay sesión activa', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    // redirect() lanza internamente en Next.js, se captura para no romper el test
    vi.mocked(redirect).mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('debería redirigir a /login cuando la sesión no tiene usuario', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ expires: '2099-01-01' } as any)
    vi.mocked(redirect).mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('debería retornar la sesión cuando el usuario está autenticado', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@test.com', name: 'Test' },
      expires: '2099-01-01',
    }
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any)

    const result = await requireAuth()

    expect(result).toEqual(mockSession)
    expect(redirect).not.toHaveBeenCalled()
  })

  it('no debería exponer datos del usuario anónimo a rutas protegidas', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    vi.mocked(redirect).mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    let sessionLeaked: unknown = undefined
    try {
      const session = await requireAuth()
      sessionLeaked = session
    } catch {
      // se espera el redirect
    }

    // Nunca debe llegar a retornar datos cuando no hay sesión
    expect(sessionLeaked).toBeUndefined()
  })
})
