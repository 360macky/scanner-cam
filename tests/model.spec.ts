import { test, expect } from '@playwright/test'

test('Home has a user flow to load the model', async ({ page }) => {
  await page.goto('/')

  // Check that there is a button element with the text "Start app"
  expect(await page.textContent('button:has-text("Start app")')).toBeTruthy()

  // Click the button element with the text "Start app"
  await page.click('button:has-text("Start app")')

  // Check that there is a p element with the text "Loading Computer Vision model" OR "Cargando modelo de visión artificial"
  expect(await page.textContent('p:has-text("Loading Computer Vision model")') || await page.textContent('p:has-text("Cargando modelo de visión artificial")')).toBeTruthy()

  // Wait until there is no div with the button with the text "Start app"
  await page.waitForSelector('button:has-text("Start app")', { state: 'hidden' })
})
