import { describe, expect, it } from 'vitest'
import { registerSchema } from '../schema/register.schema'

const validPayload = {
  name: 'María',
  storeName: 'Tienda Demo',
  slug: 'tienda-demo',
  whatsappPhone: '+56987654321',
  email: 'maria@example.com',
  password: '123456',
  acceptedTerms: true,
}

describe('registerSchema', () => {
  it('permite un payload completo y válido', () => {
    const result = registerSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('rechaza acceptedTerms false', () => {
    const result = registerSchema.safeParse({ ...validPayload, acceptedTerms: false })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'Debes aceptar los Términos y Condiciones para crear tu tienda.'
    )
  })

  it('rechaza slug con caracteres inválidos', () => {
    const result = registerSchema.safeParse({ ...validPayload, slug: 'Mi Tienda!' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'La URL solo puede tener minúsculas, números y guiones.'
    )
  })

  it('rechaza whatsappPhone con formato incorrecto', () => {
    const result = registerSchema.safeParse({ ...validPayload, whatsappPhone: '123' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('El número de WhatsApp debe tener 8 dígitos (ej: 1234 5678).')
  })
})
