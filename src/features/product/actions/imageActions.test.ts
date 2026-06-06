import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  vi.stubEnv('R2_ACCOUNT_ID', 'mock-account-id-12345')
  vi.stubEnv('R2_ACCESS_KEY_ID', 'mock-access-key-id')
  vi.stubEnv('R2_SECRET_ACCESS_KEY', 'mock-secret-access-key')
  vi.stubEnv('R2_BUCKET', 'walo-test-bucket')
  vi.stubEnv('R2_PUBLIC_URL', 'https://pub-test.r2.dev')
})

const { mockSend, mockPrisma } = vi.hoisted(() => ({
  mockSend: vi.fn(),
  mockPrisma: {
    product: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  } as const,
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

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/server/store', () => ({
  getUserStoreId: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

import { getServerSession } from 'next-auth'
import { getUserStoreId } from '@/server/store'
import type { Session } from 'next-auth'
import { uploadProductImage } from './uploadProductImage'
import { replaceProductImage } from './replaceProductImage'
import { removeProductImage } from './removeProductImage'

function createImageFile() {
  return new File(['fake-image'], 'photo.png', { type: 'image/png' })
}

describe('product image actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSend.mockResolvedValue({})
  })

  it('uploadProductImage succeeds and returns public URL', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    mockPrisma.product.findFirst.mockResolvedValue({ id: 'prod-1' } as unknown)
    mockPrisma.product.updateMany.mockResolvedValue({ count: 1 } as unknown)

    const result = await uploadProductImage('prod-1', createImageFile())

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.imageUrl).toBe('https://pub-test.r2.dev/stores/store-1/products/prod-1/image')
      expect(result.imageKey).toBe('stores/store-1/products/prod-1/image')
    }
    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockPrisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'prod-1',
          storeId: 'store-1',
        },
      })
    )
  })

  it('replaceProductImage succeeds and overwrites existing image key', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    mockPrisma.product.findFirst.mockResolvedValue({ id: 'prod-1', imageKey: 'stores/store-1/products/prod-1/image' } as unknown)
    mockPrisma.product.updateMany.mockResolvedValue({ count: 1 } as unknown)

    const result = await replaceProductImage('prod-1', createImageFile())

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.imageKey).toBe('stores/store-1/products/prod-1/image')
      expect(result.imageUrl).toBe('https://pub-test.r2.dev/stores/store-1/products/prod-1/image')
    }
    expect(mockSend).toHaveBeenCalledOnce()
  })

  it('replaceProductImage performs rollback on database failure', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    mockPrisma.product.findFirst.mockResolvedValue({ id: 'prod-1', imageKey: 'stores/store-1/products/prod-1/image' } as unknown)
    mockPrisma.product.updateMany.mockRejectedValue(new Error('DB update failed'))

    await expect(replaceProductImage('prod-1', createImageFile())).rejects.toThrow('DB update failed')

    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('removeProductImage deletes product image when imageKey exists', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    mockPrisma.product.findFirst.mockResolvedValue({ id: 'prod-1', imageKey: 'stores/store-1/products/prod-1/image' } as unknown)
    mockPrisma.product.updateMany.mockResolvedValue({ count: 1 } as unknown)

    const result = await removeProductImage('prod-1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.imageRemoved).toBe(true)
    }
    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockPrisma.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'prod-1',
          storeId: 'store-1',
        },
        data: {
          imageUrl: null,
          imageKey: null,
        },
      })
    )
  })

  it('removeProductImage is idempotent when no imageKey present', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } } as unknown as Session)
    vi.mocked(getUserStoreId).mockResolvedValue('store-1')

    mockPrisma.product.findFirst.mockResolvedValue({ id: 'prod-1', imageKey: null } as unknown)
    mockPrisma.product.updateMany.mockResolvedValue({ count: 1 } as unknown)

    const result = await removeProductImage('prod-1')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.imageRemoved).toBe(false)
    }
    expect(mockSend).not.toHaveBeenCalled()
    expect(mockPrisma.product.updateMany).toHaveBeenCalledOnce()
  })
})
