import type { AstroIntegration } from 'astro'
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

const integration = (options: Options = {}): AstroIntegration => {
  const { logStats = true, proxy } = options

  const logger = Logger(logStats)

  context.set({
    logger,
    proxy,
  })

  /**
   * cache links and hashes
   */
  const linkAndHashCache = new Map<string, number>()

  return {
    name: 'astro-link-preview',
    hooks: {
      'astro:config:setup': ({ updateConfig, injectScript }) => {
        injectScript('page', injectedScript)

        updateConfig({
          vite: {
            plugins: [vitePlugin()],
          },
        })
      },

      'astro:build:done': async ({ routes, dir }) => {
        logger.info(`Generating preview images...`)

        const hrefs = routes.map(r => r.distURL.href)

        await Promise.all(
          hrefs.map(href => parseAndWrite(href, linkAndHashCache))
        )

        const generator = await GenerateService()

        const arr = [...linkAndHashCache]

        await Promise.all(
          arr.map(async ([href, hashed]) => {
            const imageBuf = await generator.generate(href).then(optimize)
            await writeFile(new URL(`./${hashed}.png`, dir), imageBuf)
          })
        )

        await generator.dispose()
      },
    },
  }
}

export default integration
