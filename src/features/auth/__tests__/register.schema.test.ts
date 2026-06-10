import { describe, expect, it } from 'vitest'
import { registerSchema } from '../schema/register.schema'

describe('registerSchema', () => {
  it('permite acceptedTerms true', () => {
    const result = registerSchema.safeParse({
      name: 'María',
      storeName: 'Tienda Demo',
      email: 'maria@example.com',
      password: '123456',
      acceptedTerms: true,
    })

    expect(result.success).toBe(true)
  })

  it('rechaza acceptedTerms false', () => {
    const result = registerSchema.safeParse({
      name: 'María',
      storeName: 'Tienda Demo',
      email: 'maria@example.com',
      password: '123456',
      acceptedTerms: false,
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'Debes aceptar los Términos y Condiciones para crear tu tienda.'
    )
  })
})
