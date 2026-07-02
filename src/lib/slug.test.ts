import { describe, it, expect } from 'vitest'
import { generateSlug } from './slug'

describe('generateSlug', () => {
    it('convierte espacios en guiones y pasa a minúsculas', () => {
        expect(generateSlug('Camiseta Azul Marino')).toBe('camiseta-azul-marino')
    })

    it('elimina tildes y caracteres acentuados', () => {
        expect(generateSlug('Zapátillas Ñoño')).toBe('zapatillas-nono')
    })

    it('elimina caracteres especiales manteniendo letras y números', () => {
        expect(generateSlug('Producto (Talla M) ¡Nuevo!')).toBe('producto-talla-m-nuevo')
    })

    it('colapsa múltiples espacios y guiones en uno solo', () => {
        expect(generateSlug('pan   de   molde')).toBe('pan-de-molde')
    })

    it('trunca a 100 caracteres', () => {
        const largo = 'a'.repeat(120)
        expect(generateSlug(largo).length).toBeLessThanOrEqual(100)
    })

    it('maneja strings vacíos sin lanzar error', () => {
        expect(generateSlug('')).toBe('')
    })
})
