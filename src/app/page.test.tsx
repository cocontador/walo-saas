import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HomePage from './page'

describe('HomePage', () => {
  it('renderiza el CTA principal de la landing', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('link', { name: /crear mi tienda/i })
    ).toBeInTheDocument()
  })
})
