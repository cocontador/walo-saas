import { expect, test } from '@playwright/test'

const publicSlug = process.env.PLAYWRIGHT_PUBLIC_SLUG

test.describe('catálogo público', () => {
  // Dato semilla requerido: slug de una tienda activa disponible en local/demo.
  test('slug válido carga correctamente', async ({ page }) => {
    test.skip(
      !publicSlug,
      'Requiere PLAYWRIGHT_PUBLIC_SLUG con el slug de una tienda activa local/demo.'
    )

    await page.goto(`/${publicSlug}`)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/tienda/i).first()).toBeVisible()
  })

  test('slug inexistente muestra estado de error usable', async ({ page }) => {
    await page.goto(`/tienda-e2e-inexistente-${Date.now()}`)

    await expect(
      page.getByRole('heading', { name: /tienda no encontrada/i })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: /volver al inicio/i })).toBeVisible()
  })
})
