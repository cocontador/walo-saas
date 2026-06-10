import { describe, it, expect } from 'vitest'
import { registerSchema } from './register.schema'

describe('registerSchema - WALO-11: Política de contraseña mínima', () => {
  it('debería rechazar contraseña con menos de 6 caracteres', () => {
    const result = registerSchema.safeParse({
      name: 'María',
      storeName: 'Mi Tienda',
      email: 'maria@ejemplo.com',
      password: '12345',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.password
      expect(errors?.[0]).toContain('al menos 6 caracteres')
    }
  })

  it('debería aceptar contraseña con exactamente 6 caracteres', () => {
    const result = registerSchema.safeParse({
      name: 'María',
      storeName: 'Mi Tienda',
      email: 'maria@ejemplo.com',
      password: '123456',
    })

    expect(result.success).toBe(true)
  })

  it('debería rechazar contraseña vacía', () => {
    const result = registerSchema.safeParse({
      name: 'María',
      storeName: 'Mi Tienda',
      email: 'maria@ejemplo.com',
      password: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.password
      expect(errors).toBeDefined()
    }
  })

  it('debería aceptar contraseña larga válida', () => {
    const result = registerSchema.safeParse({
      name: 'María',
      storeName: 'Mi Tienda',
      email: 'maria@ejemplo.com',
      password: 'contraseña-segura-123',
    })

    expect(result.success).toBe(true)
  })
})
