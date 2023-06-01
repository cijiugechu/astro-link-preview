import { chromium } from '@playwright/test'
import { context } from './context'

const GenerateService = async () => {
  const { proxy, logger } = context

  const browser = await chromium.launch({
    proxy,
  })

  return {
    generate: async (href: string) => {
      const context = await browser.newContext()
      const page = await context.newPage()
      try {
        await page.goto(href)
        const imageBuf = await page.screenshot()

        return imageBuf
      } catch (e) {
        logger.error(
          `Crashed while trying to generate the screenshot of ${href}\n${e.message}`
        )
        return Buffer.from([])
      }
    },

    dispose: async () => {
      await browser.close()
    },
  }
}

export { GenerateService }
