import type { AstroIntegration, AstroConfig } from 'astro'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import xxhash from 'xxhash-wasm'
import type { Options } from './types'
import { Logger } from './logger'
import { GenerateService } from './generate'
import { optimize } from './optimize'
import { vitePlugin } from './vite-plugin-link-preview'
import { context } from './context'
import path from 'node:path'
import { HTMLRewriter } from 'html-rewriter-wasm'
import { isValidURL } from './url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const injectedScriptPath = path.join(__dirname, 'injected.mjs')
const injectedScript = await readFile(injectedScriptPath, { encoding: 'utf-8' })

const hash = async (href: string) => {
  return (await xxhash()).h32(href)
}

const parseAndWrite = async (pathHref: string, cache: Map<string, number>) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let output = ''

  const rawHtml = await readFile(fileURLToPath(pathHref), { encoding: 'utf-8' })

  const rewriter = new HTMLRewriter(outputChunk => {
    output += decoder.decode(outputChunk)
  })

  rewriter.on('a', {
    async element(element) {
      const href = element.getAttribute('href')
      if (!isValidURL(href)) {
        return
      }

      if (cache.has(href)) {
        element.setAttribute('data-link-preview', `${cache.get(href)}`)
      } else {
        const hashed = await hash(href)
        cache.set(href, hashed)
        element.setAttribute('data-link-preview', `${hashed}`)
      }
    },
  })

  try {
    await rewriter.write(encoder.encode(rawHtml))
    await rewriter.end()
    await writeFile(fileURLToPath(pathHref), output, { encoding: 'utf-8' })
  } finally {
    rewriter.free() // Remember to free memory
  }
}

const calcPagePaths = (
  pages: { pathname: string }[],
  buildFormat: 'file' | 'directory'
) => {
  
  if (buildFormat === 'directory') {
    return pages.map(page => `${page.pathname}index.html`)
  }

  return pages.map(page => {
    if (page.pathname === '' || page.pathname.endsWith('/')) {
      return `${page.pathname}index.html`
    }
    return `${page.pathname}.html`
  })
}

const integration = (options: Options = {}): AstroIntegration => {
  const { logStats = true, proxy, previewImageFormat = 'jpg' } = options

  if (!['jpg', 'png'].includes(previewImageFormat)) {
    throw new Error(`Invalid preview image format: ${previewImageFormat}`)
  }

  const logger = Logger(logStats)

  context.set({
    logger,
    proxy,
    imageFormat: previewImageFormat,
  })

  /**
   * cache links and hashes
   */
  const linkAndHashCache = new Map<string, number>()

  let astroConfig: AstroConfig

  return {
    name: 'astro-link-preview',
    hooks: {
      'astro:config:setup': ({ updateConfig, injectScript }) => {
        if (previewImageFormat === 'jpg') {
          injectScript(
            'page',
            injectedScript.replace('{hashed}.png', '{hashed}.jpg')
          )
        } else {
          injectScript('page', injectedScript)
        }

        updateConfig({
          vite: {
            plugins: [vitePlugin()],
          },
        })
      },

      'astro:config:done': ({ config }) => {
        astroConfig = config
      },

      'astro:build:done': async ({ dir, pages }) => {
        logger.info(`Generating preview images...`)

        const hrefs = calcPagePaths(pages, astroConfig.build.format)
          .map(path => new URL(path, dir).href)
          .filter(h => h.endsWith('.html'))

        await Promise.all(
          hrefs.map(href => parseAndWrite(href, linkAndHashCache))
        )

        const generator = await GenerateService()

        const arr = [...linkAndHashCache]

        await Promise.all(
          arr.map(async ([href, hashed]) => {
            const imageBuf = await generator.generate(href).then(optimize)
            await writeFile(
              new URL(`./${hashed}.${previewImageFormat}`, dir),
              imageBuf
            )
          })
        )

        await generator.dispose()
      },
    },
  }
}

export default integration
