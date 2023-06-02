import { chromium } from '@playwright/test'
import { context } from './context'

const GenerateService = async () => {
  const { proxy, logger, imageFormat } = context.get()

  const browser = await chromium.launch({
    proxy,
  })

  return {
    generate: async (href: string) => {
      const context = await browser.newContext()
      const page = await context.newPage()
      try {
        await page.goto(href)
        const imageBuf = await page.screenshot(
          imageFormat === 'jpg'
            ? {
                type: 'jpeg',
                quality: 75,
              }
            : {
                type: 'png',
              }
        )

        await context.close()

        return imageBuf
      } catch (e) {
        logger.error(
          `Crashed while trying to generate the screenshot of ${href}\n${e.message}`
        )

        await context.close()

        return Buffer.from([])
      }
    },

    dispose: async () => {
      await browser.close()
    },
  }
}

export { GenerateService }
