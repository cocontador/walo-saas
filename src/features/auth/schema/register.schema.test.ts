import { describe, it, expect } from 'vitest'
import { registerSchema } from './register.schema'

describe('registerSchema - WALO-11: Política de contraseña mínima', () => {

  const validUser = {
    name: 'Maria',
    storeName: 'Mi Tienda',
    email: 'maria@ejemplo.com',
    slug: 'mi-tienda',
    whatsappPhone: '+56912345678', // 8 dígitos tras el prefijo
    acceptedTerms: true,
  }

  it('debería rechazar contraseña con menos de 6 caracteres', () => {
    const result = registerSchema.safeParse({ ...validUser, password: '123' })
    expect(result.success).toBe(false)
  })

  it('debería aceptar contraseña con exactamente 6 caracteres', () => {
    const result = registerSchema.safeParse({ ...validUser, password: '123456' })
    expect(result.success).toBe(true)
  })

  it('debería rechazar contraseña vacía', () => {
    const result = registerSchema.safeParse({ ...validUser, password: '' })
    expect(result.success).toBe(false)
  })

  it('debería aceptar contraseña larga válida', () => {
    const result = registerSchema.safeParse({ ...validUser, password: 'contrasenalargasegura123' })
  
    expect(result.success).toBe(true)
  })
})