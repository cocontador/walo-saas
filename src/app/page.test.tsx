import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from './page'

describe('HomePage', () => {
  it('renderiza el título principal', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', { name: 'WALO' })
    ).toBeInTheDocument()
  })
})
