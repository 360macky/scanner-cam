import { test, expect } from '@playwright/test'

test('Home has basic information about ScannerCam', async ({ page }) => {
  await page.goto('/')

  // Check that the page title is correct
  expect(await page.title()).toBe('ScannerCam')

  // Check that the page has a h2 element with the text "Welcome to ScannerCam"
  expect(await page.textContent('h2')).toBe('Welcome to ScannerCam')

  // Check that the page has a p element with the text "Turn on your camera and the AI will recognize things in display"
  expect(await page.textContent('p')).toBe(
    'Turn on your camera and the AI will recognize things in display'
  )

  // Check that the page has a button element with the text "Start app"
  expect(await page.textContent('button')).toBe('Start app')
})
