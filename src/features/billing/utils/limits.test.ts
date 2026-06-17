import { describe, it, expect } from 'vitest'
import { evaluateLimit } from './limits'

describe('evaluateLimit', () => {
  it('debe retornar status unlimited para limite null o menor que 0', () => {
    expect(evaluateLimit(10, null)).toEqual({
      status: 'unlimited',
      percentage: 0,
      isNearLimit: false,
      isReached: false,
    })

    expect(evaluateLimit(10, -1)).toEqual({
      status: 'unlimited',
      percentage: 0,
      isNearLimit: false,
      isReached: false,
    })
  })

  it('debe retornar status OK si el uso es menor al 80%', () => {
    expect(evaluateLimit(5, 10)).toEqual({
      status: 'OK',
      percentage: 50,
      isNearLimit: false,
      isReached: false,
    })

    expect(evaluateLimit(7, 10)).toEqual({
      status: 'OK',
      percentage: 70,
      isNearLimit: false,
      isReached: false,
    })
  })

  it('debe retornar status warning si el uso es >= 80% y < 100%', () => {
    expect(evaluateLimit(8, 10)).toEqual({
      status: 'warning',
      percentage: 80,
      isNearLimit: true,
      isReached: false,
    })

    expect(evaluateLimit(9, 10)).toEqual({
      status: 'warning',
      percentage: 90,
      isNearLimit: true,
      isReached: false,
    })
  })

  it('debe retornar status reached si el uso es >= 100%', () => {
    expect(evaluateLimit(10, 10)).toEqual({
      status: 'reached',
      percentage: 100,
      isNearLimit: false,
      isReached: true,
    })

    expect(evaluateLimit(12, 10)).toEqual({
      status: 'reached',
      percentage: 100,
      isNearLimit: false,
      isReached: true,
    })
  })
})
