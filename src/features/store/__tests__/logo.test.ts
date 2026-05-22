import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('R2_ACCOUNT_ID', 'mock-account-id-12345')
  vi.stubEnv('R2_ACCESS_KEY_ID', 'mock-access-key-id')
  vi.stubEnv('R2_SECRET_ACCESS_KEY', 'mock-secret-access-key')
  vi.stubEnv('R2_BUCKET', 'walo-test-bucket')
  vi.stubEnv('R2_PUBLIC_URL', 'https://pub-test.r2.dev')
})

const { mockSend, mockPrisma, mockRequireAuth } = vi.hoisted(() => ({
  mockSend: vi.fn(),
  mockPrisma: {
    storeMember: { findFirst: vi.fn() },
    store: { findUnique: vi.fn(), update: vi.fn() },
  },
  mockRequireAuth: vi.fn(),
}))

vi.mock('@aws-sdk/client-s3', () => {
  class PutObjectCommand {
    input: unknown
    constructor(input: unknown) {
      this.input = input
    }
  }

  class DeleteObjectCommand {
    input: unknown
    constructor(input: unknown) {
      this.input = input
    }
  }

  class S3Client {
    send = mockSend
  }

  return { PutObjectCommand, DeleteObjectCommand, S3Client }
})

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('@/server/require-auth', () => ({
  requireAuth: mockRequireAuth,
}))

import { removeLogo, replaceLogo, uploadLogo } from '@/features/store/actions'

function createLogoFormData() {
  const formData = new FormData()
  const file = new File(['binary-content'], 'logo.png', { type: 'image/png' })
  formData.append('storeId', 'store_1')
  formData.append('logo', file)
  return formData
}

describe('Store logo actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSend.mockResolvedValue({})
    mockRequireAuth.mockResolvedValue({ user: { id: 'user_1' } })
  })

  it('uploadLogo exitoso retorna ok true y URL', async () => {
    mockPrisma.storeMember.findFirst.mockResolvedValue({ id: 'member_1', role: 'OWNER' })
    mockPrisma.store.findUnique.mockResolvedValue({ id: 'store_1' })
    mockPrisma.store.update.mockResolvedValue({
      id: 'store_1',
      logoUrl: 'https://pub-test.r2.dev/stores/store_1/logo',
      logoKey: 'stores/store_1/logo',
    })

    const result = await uploadLogo(createLogoFormData())

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.logoUrl).toContain('https://pub-test.r2.dev/stores/store_1/logo')
    }
    expect(mockPrisma.storeMember.findFirst).toHaveBeenCalledOnce()
    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockPrisma.store.update).toHaveBeenCalledOnce()
  })

  it('uploadLogo bloquea intento sin membresía (anti-IDOR)', async () => {
    mockPrisma.storeMember.findFirst.mockResolvedValue(null)

    const result = await uploadLogo(createLogoFormData())

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(403)
      expect(result.error).toContain('permisos')
    }
    expect(mockSend).not.toHaveBeenCalled()
    expect(mockPrisma.store.update).not.toHaveBeenCalled()
  })

  it('replaceLogo ejecuta rollback en R2 si falla update de Prisma', async () => {
    mockPrisma.storeMember.findFirst.mockResolvedValue({ id: 'member_1', role: 'OWNER' })
    mockPrisma.store.findUnique.mockResolvedValue({ id: 'store_1', logoKey: 'stores/store_1/logo' })
    mockPrisma.store.update.mockRejectedValue(new Error('DB update failed'))

    await expect(replaceLogo(createLogoFormData())).rejects.toThrow('DB update failed')

    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('removeLogo idempotente no llama delete en R2 si no hay logoKey', async () => {
    mockPrisma.storeMember.findFirst.mockResolvedValue({ id: 'member_1', role: 'OWNER' })
    mockPrisma.store.findUnique.mockResolvedValue({ id: 'store_1', logoKey: null })
    mockPrisma.store.update.mockResolvedValue({ id: 'store_1', logoKey: null, logoUrl: null })

    const result = await removeLogo('store_1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.logoRemoved).toBe(false)
    }
    expect(mockSend).not.toHaveBeenCalled()
    expect(mockPrisma.store.update).toHaveBeenCalledOnce()
  })
})