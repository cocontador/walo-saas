import { expect, test } from '@playwright/test'

test('dashboard sin sesion redirige a login', async ({ page }) => {
  await page.goto('/dashboard')

  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.locator('form').getByRole('button', { name: /iniciar sesi/i })
  ).toBeVisible()
})
