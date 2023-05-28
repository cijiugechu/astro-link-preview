import { chromium } from '@playwright/test'
import type { LaunchOptions } from '@playwright/test'

interface GenerateServiceOptions {
  proxy?: LaunchOptions['proxy']
}
const GenerateService = async (options: GenerateServiceOptions = {}) => {
  const { proxy } = options

  const browser = await chromium.launch({
    proxy,
  })

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
