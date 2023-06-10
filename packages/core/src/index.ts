import type { AstroIntegration, AstroConfig } from 'astro'
import { readFile, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { xxh32 } from '@node-rs/xxhash'
import type { Options } from './types'
import { Logger } from './logger'
import { GenerateService } from './generate'
import { optimize } from './optimize'
import { vitePlugin } from './vite-plugin-link-preview'
import { context } from './context'
import path from 'node:path'
import { RewritingStream } from 'parse5-html-rewriting-stream'
import { pipeline } from 'node:stream/promises'
import { isValidURL } from './url'
import { Readable } from 'node:stream'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const injectedScriptPath = path.join(__dirname, 'injected.mjs')
const injectedScript = await readFile(injectedScriptPath, { encoding: 'utf-8' })

const parseAndWrite = async (pathHref: string, cache: Map<string, number>) => {
  const rawHtmlStr = await readFile(pathHref, { encoding: 'utf-8' })
  const readStream = Readable.from([rawHtmlStr])
  const writeStream = createWriteStream(pathHref, {
    encoding: 'utf-8',
  })
  const rewriterStream = new RewritingStream()

  rewriterStream.on('startTag', startTag => {
    if (startTag.tagName === 'a') {
      const href = startTag.attrs.find(attr => attr.name === 'href')?.value

      if (isValidURL(href)) {
        if (cache.has(href)) {
          startTag.attrs.push({
            name: 'data-link-preview',
            value: `${cache.get(href)}`,
          })
        } else {
          const hashed = xxh32(href)
          cache.set(href, hashed)
          startTag.attrs.push({
            name: 'data-link-preview',
            value: `${hashed}`,
          })
        }
      }
    }

    rewriterStream.emitStartTag(startTag)
  })

  await pipeline(readStream, rewriterStream, writeStream)
}

const calcPagePaths = (
  pages: { pathname: string }[],
  buildFormat: 'file' | 'directory'
) => {
  if (buildFormat === 'directory') {
    return pages.map(page => {
      if (page.pathname === '404/') {
        return '404.html'
      }

      return `${page.pathname}index.html`
    })
  }

  return pages.map(page => {
    if (page.pathname === '' || page.pathname.endsWith('/')) {
      return `${page.pathname}index.html`
    }

    if (page.pathname === '404') {
      return '404.html'
    }

    return `${page.pathname}.html`
  })
}

const integration = (options: Options = {}): AstroIntegration => {
  const {
    logStats = true,
    proxy,
    previewImageFormat = 'jpg',
    enableOnMobile = false,
  } = options

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
        const updateScriptByFormat = (script: string) => {
          return previewImageFormat === 'jpg'
            ? script.replace('{hashed}.png', '{hashed}.jpg')
            : script
        }

        const updateScriptByMobile = (script: string) => {
          return enableOnMobile
            ? script.replace('enableOnMobile = false', 'enableOnMobile = true')
            : script
        }

        const scriptUpdater = [
          updateScriptByFormat,
          updateScriptByMobile,
        ].reduce(
          (prev, curr) => (s: string) => curr(prev(s)),
          (s: string) => s
        )

        injectScript('page', scriptUpdater(injectedScript))

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

        const paths = hrefs.map(fileURLToPath)

        await Promise.all(
          paths.map(path => parseAndWrite(path, linkAndHashCache))
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
