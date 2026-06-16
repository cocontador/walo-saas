import { expect, test } from '@playwright/test'

test('home carga correctamente', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('link', { name: /crear mi tienda/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /ya tengo cuenta/i })).toBeVisible()
})
