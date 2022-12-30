import { test, expect } from '@playwright/test'

test('Home has page elements of ScannerCam', async ({ page }) => {
  await page.goto('/')

  // Check that there is a section element with the id "about"
  expect(await page.textContent('section#about')).toBeTruthy()
})
