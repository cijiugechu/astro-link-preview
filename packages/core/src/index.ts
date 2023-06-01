import type { AstroIntegration } from 'astro'
import { parse } from 'parse5'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import xxhash from 'xxhash-wasm'
import type { Options } from './types'
import { Logger } from './logger'
import { GenerateService } from './generate'
import { optimize } from './optimize'
import { nodeIsElement, traverseNodes } from './traverse'
import { vitePlugin } from './vite-plugin-link-preview'
import { context } from './context'

const parseHtml = (pathHref: string) => {
  return readFile(fileURLToPath(pathHref), { encoding: 'utf-8' }).then(parse)
}

const integration = (options: Options = {}): AstroIntegration => {
  const { logStats = true, proxy } = options

  const logger = Logger(logStats)

  context.logger = logger
  context.proxy = proxy

  /**
   * cached links
   */
  const linkCache = new Set<string>()

  return {
    name: 'astro-link-preview',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [vitePlugin()],
          },
        })
      },

      'astro:build:done': async ({ routes, dir }) => {
        logger.info(`Generating preview images...`)

        const hrefs = routes.map(r => r.distURL.href)

        const documents = await Promise.all(hrefs.map(parseHtml))

        const generator = await GenerateService()

        await Promise.all(
          documents.map(doc => {
            return traverseNodes(doc, async node => {
              if (!nodeIsElement(node)) {
                return
              }

              if (
                node.tagName === 'a' &&
                node.attrs.some(attr => attr.name === 'data-link-preview')
              ) {
                const linkPreview = node.attrs.find(
                  attr => attr.name === 'data-link-preview'
                )?.value

                if (linkPreview === '0') {
                  return
                }

                const href = node.attrs.find(
                  attr => attr.name === 'href'
                )?.value

                if (linkCache.has(href)) {
                  return
                }

                linkCache.add(href)

                const imageBuf = await generator.generate(href).then(optimize)
                const hashed = (await xxhash()).h32(href)
                await writeFile(new URL(`./${hashed}.png`, dir), imageBuf)
              }
            })
          })
        )

        await generator.dispose()
      },
    },
  }
}

export default integration
