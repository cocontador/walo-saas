import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { parseDateRange, dateRangeSchema } from '../schemas/dateRange.schema'

const FIXED_NOW = new Date('2026-06-17T12:00:00.000Z')

describe('dateRangeSchema', () => {
    it('acepta fechas válidas', () => {
        const result = dateRangeSchema.safeParse({ from: '2026-06-01', to: '2026-06-17' })
        expect(result.success).toBe(true)
    })

    it('rechaza when from > to', () => {
        const result = dateRangeSchema.safeParse({ from: '2026-06-17', to: '2026-06-01' })
        expect(result.success).toBe(false)
    })

    it('acepta params vacíos (ambos opcionales)', () => {
        const result = dateRangeSchema.safeParse({})
        expect(result.success).toBe(true)
    })

    it('acepta from == to (mismo día)', () => {
        const result = dateRangeSchema.safeParse({ from: '2026-06-17', to: '2026-06-17' })
        expect(result.success).toBe(true)
    })
})

describe('parseDateRange', () => {
    beforeEach(() => {
        vi.setSystemTime(FIXED_NOW)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('retorna fallback de 30 días cuando los params están vacíos', () => {
        const { from, to } = parseDateRange({})

        expect(to.getHours()).toBe(23)
        expect(to.getMinutes()).toBe(59)

        const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate())
        const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate())
        const diffDays = Math.round((toDay.getTime() - fromDay.getTime()) / (1000 * 60 * 60 * 24))
        expect(diffDays).toBe(30)
    })

    it('parsea fechas válidas y normaliza horas', () => {
        const { from, to } = parseDateRange({ from: '2026-06-01', to: '2026-06-17' })

        expect(from.getHours()).toBe(0)
        expect(from.getMinutes()).toBe(0)
        expect(from.getSeconds()).toBe(0)

        expect(to.getHours()).toBe(23)
        expect(to.getMinutes()).toBe(59)
        expect(to.getSeconds()).toBe(59)
    })

    it('retorna fallback cuando from > to', () => {
        const { from, to } = parseDateRange({ from: '2026-06-17', to: '2026-06-01' })

        const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate())
        const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate())
        const diffDays = Math.round((toDay.getTime() - fromDay.getTime()) / (1000 * 60 * 60 * 24))
        expect(diffDays).toBe(30)
    })

    it('retorna fallback cuando la fecha es inválida', () => {
        const { from, to } = parseDateRange({ from: 'no-es-fecha', to: '2026-06-17' })

        const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate())
        const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate())
        const diffDays = Math.round((toDay.getTime() - fromDay.getTime()) / (1000 * 60 * 60 * 24))
        expect(diffDays).toBe(30)
    })

    it('retorna fallback cuando falta uno de los dos params', () => {
        const { from, to } = parseDateRange({ from: '2026-06-01' })

        const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate())
        const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate())
        const diffDays = Math.round((toDay.getTime() - fromDay.getTime()) / (1000 * 60 * 60 * 24))
        expect(diffDays).toBe(30)
    })
})
