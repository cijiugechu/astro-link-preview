import type { APIRoute } from 'astro'
import { createRequire } from 'node:module'
//@ts-ignore
import config from 'virtual:link-preview-config'
import { cwd } from 'process'
import { join } from 'path'

const cache = new Map<string, Buffer>()

const playwrightPathWithPnpm = join(
  cwd(),
  'node_modules',
  'astro-link-preview',
  'node_modules',
  '@playwright',
  'test',
  'index.js'
)
const playwrightPathWithNpm = join(
  cwd(),
  'node_modules',
  '@playwright',
  'test',
  'index.js'
)

const chromium = (() => {
  try {
    const moduleRequire = createRequire(playwrightPathWithPnpm)
    const { chromium } = moduleRequire('.')
    return chromium
  } catch (e) {
    const moduleRequire = createRequire(playwrightPathWithNpm)
    const { chromium } = moduleRequire('.')
    return chromium
  }
})()

const browser = await chromium.launch({
  proxy: config.proxy,
})

const contentType = config.imageFormat === 'jpg' ? 'image/jpeg' : 'image/png'

//@ts-ignore
export const get: APIRoute = async ({ params }) => {
  const url = params.dynamic

  try {
    if (cache.has(url)) {
      return new Response(cache.get(url), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': contentType,
        },
      })
    }

    const rawHref = atob(url)

    const context = await browser.newContext()

    const page = await context.newPage()

    await page.goto(rawHref)

    const buf = await page.screenshot(
      config.imageFormat === 'jpg'
        ? {
            type: 'jpeg',
            quality: 75,
          }
        : {
            type: 'png',
          }
    )

    if (buf.length === 0) {
      return new Response(buf, {
        status: 404,
        headers: {
          'Content-Type': contentType,
        },
      })
    }

    cache.set(url, buf)

    return new Response(buf, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: e.message,
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
