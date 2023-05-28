import type { AstroIntegration } from 'astro'
import { parse } from 'parse5'
import type { DefaultTreeAdapterMap } from 'parse5'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import xxhash from 'xxhash-wasm'
import type { Options } from './types'

export function nodeIsElement(
  node: DefaultTreeAdapterMap['node']
): node is DefaultTreeAdapterMap['element'] {
  return node.nodeName[0] !== '#'
}

async function traverseNodes(
  node: DefaultTreeAdapterMap['node'],
  visitor: (node: DefaultTreeAdapterMap['node']) => Promise<void>
) {
  await visitor(node)
  if (
    nodeIsElement(node) ||
    node.nodeName === '#document' ||
    node.nodeName === '#document-fragment'
  ) {
    await Promise.all(
      node.childNodes.map(childNode => traverseNodes(childNode, visitor))
    )
  }
}

const parseHtml = (pathHref: string) => {
  return readFile(fileURLToPath(pathHref), { encoding: 'utf-8' }).then(html =>
    parse(html)
  )
}

const generateImage = async (href: string) => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(href)

  const imageBuf = await page.screenshot()

  return imageBuf
}

const integration = (options: Options): AstroIntegration => {
  return {
    name: 'astro-link-preview',
    hooks: {
      'astro:build:done': async ({ routes, dir }) => {
        const hrefs = routes.map(r => r.distURL.href)

        const documents = await Promise.all(hrefs.map(parseHtml))

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

                const imageBuf = await generateImage(href)
                const hashed = (await xxhash()).h32(href)
                await writeFile(new URL(`./${hashed}.png`, dir), imageBuf)
              }
            })
          })
        )
      },
    },
  }
}

export default integration
