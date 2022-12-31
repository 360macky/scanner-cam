import { test, expect } from '@playwright/test'

test('Home has page elements of ScannerCam', async ({ page }) => {
  await page.goto('/about')

  // Check that there is a b element with the text content "Scanner Cam"
  expect(await page.textContent('b')).toBe('Scanner Cam')
})
