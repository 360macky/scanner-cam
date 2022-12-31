import { test, expect } from '@playwright/test'

test('Home has a user flow to load the model', async ({ page }) => {
  await page.goto('/')

  // Check that there is a button element with the text "Start app"
  expect(await page.textContent('button:has-text("Start app")')).toBeTruthy()

  // Click the button element with the text "Start app"
  await page.click('button:has-text("Start app")')

  // Click button with the title "Turn off object-to-voice":
  await page.click('button[title="Turn off object-to-voice"]')

  // Check that there is a window.alert and accept it
  page.on('dialog', async dialog => await dialog.accept())
})
