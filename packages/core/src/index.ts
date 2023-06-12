import type { AstroIntegration, AstroConfig } from 'astro'
import { readFile, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { xxh32 } from '@node-rs/xxhash'
import type { Options } from './types'
import { createLogger } from './logger'
import { GenerateService } from './generate'
import { optimize } from './optimize'
import { vitePlugin } from './vite-plugin-link-preview'
import { context } from './context'
import path from 'node:path'
import { RewritingStream } from 'parse5-html-rewriting-stream'
import { pipeline } from 'node:stream/promises'
import { isValidURL } from './url'
import { Readable } from 'node:stream'
import { routeConfigPlugin } from './vite-plugin-config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const injectedScriptPath = path.join(__dirname, 'script.mjs')
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

  const logger = createLogger(logStats)

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
      'astro:config:setup': ({
        updateConfig,
        injectScript,
        config,
        injectRoute,
      }) => {
        const isSSR = config.output === 'server'

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

        const updateScriptByMode = (script: string) => {
          return isSSR
            ? script.replace('const isSsr = false', 'const isSsr = true')
            : script
        }

        const scriptUpdater = [
          updateScriptByFormat,
          updateScriptByMobile,
          updateScriptByMode,
        ].reduce((prev, curr) => (s: string) => curr(prev(s)))

        injectScript('page', scriptUpdater(injectedScript))

        updateConfig({
          vite: {
            plugins: [
              vitePlugin(),
              isSSR &&
                routeConfigPlugin({
                  proxy: proxy,
                  logStats: logStats,
                  previewImageFormat: previewImageFormat,
                }),
            ].filter(Boolean),
          },
        })

        if (isSSR) {
          injectRoute({
            pattern: '/_astro-link-preview/[dynamic]',
            entryPoint: 'astro-link-preview/route',
          })
        }
      },

      'astro:config:done': ({ config }) => {
        astroConfig = config
      },

      'astro:build:done': async ({ dir, pages }) => {
        if (astroConfig.output === 'server') {
          return
        }

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
