import { chromium } from '@playwright/test'

const GenerateService = async () => {
  const browser = await chromium.launch()

  return {
    generate: async (href: string) => {
      const context = await browser.newContext()
      const page = await context.newPage()
      await page.goto(href)
      const imageBuf = await page.screenshot()

      return imageBuf
    },

    dispose: async () => {
      await browser.close()
    },
  }
}

export { GenerateService }
