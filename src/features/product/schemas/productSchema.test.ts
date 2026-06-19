import { describe, it, expect } from 'vitest'
import { createProductSchema, updateProductSchema } from './productSchema'

describe('createProductSchema - WALO-30: Campos obligatorios', () => {
  it('debería rechazar producto sin nombre', () => {
    const result = createProductSchema.safeParse({
      name: '',
      price: 10000,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined()
    }
  })

  it('debería rechazar producto sin precio', () => {
    const result = createProductSchema.safeParse({
      name: 'Camiseta',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.price).toBeDefined()
    }
  })

  it('debería aceptar producto con nombre y precio válidos', () => {
    const result = createProductSchema.safeParse({
      name: 'Camiseta azul',
      price: 15000,
    })

    expect(result.success).toBe(true)
  })

  it('debería aceptar producto sin descripción (campo opcional)', () => {
    const result = createProductSchema.safeParse({
      name: 'Camiseta azul',
      price: 15000,
      description: null,
    })

    expect(result.success).toBe(true)
  })

  it('debería rechazar campos desconocidos (strict)', () => {
    const result = createProductSchema.safeParse({
      name: 'Camiseta',
      price: 10000,
      storeId: 'inyeccion-tenant',
    })

    // strict() evita que el cliente inyecte storeId u otros campos internos
    expect(result.success).toBe(false)
  })
})

describe('updateProductSchema - WALO-30: Campos obligatorios en edición', () => {
  it('debería rechazar nombre vacío al actualizar', () => {
    const result = updateProductSchema.safeParse({ name: '' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined()
    }
  })

  it('debería aceptar actualización parcial (solo nombre)', () => {
    const result = updateProductSchema.safeParse({ name: 'Nuevo nombre' })

    expect(result.success).toBe(true)
  })
})

describe('createProductSchema - WALO-31: Validación de precio', () => {
  it('debería rechazar precio igual a cero', () => {
    const result = createProductSchema.safeParse({
      name: 'Camiseta',
      price: 0,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.price
      expect(errors?.[0]).toContain('mayor a 0')
    }
  })

  it('debería rechazar precio negativo', () => {
    const result = createProductSchema.safeParse({
      name: 'Camiseta',
      price: -500,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.price).toBeDefined()
    }
  })

  it('debería rechazar precio decimal (debe ser entero)', () => {
    const result = createProductSchema.safeParse({
      name: 'Camiseta',
      price: 9999.99,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors.price
      expect(errors?.[0]).toContain('entero')
    }
  })

  it('debería aceptar precio entero positivo', () => {
    const result = createProductSchema.safeParse({
      name: 'Camiseta',
      price: 15000,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.price).toBe(15000)
    }
  })
})
