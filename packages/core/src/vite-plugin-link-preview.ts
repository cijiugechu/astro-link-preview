import type { Plugin } from 'vite'
import type { VitePluginOptions } from './types'
import { GenerateService } from './generate'

const vitePlugin = (options: VitePluginOptions = {}): Plugin => {
  const { proxy } = options

  let generator: Awaited<ReturnType<typeof GenerateService>>

  return {
    name: 'vite-plugin-link-preview',
    enforce: 'post',
    apply: 'serve',

    async buildStart() {
      generator = await GenerateService({
        proxy,
      })
    },

    configureServer(server) {
      const urlCache = new Set<string>()

      server.middlewares.use((req, res, next) => {
        const url = req.url

        if (url.startsWith('/_astro-link-preview')) {
          
          if (urlCache.has(url)) {
            res.statusCode = 503
            res.end()
          }

          urlCache.add(url)

          const rawHref = atob(url.replace('/_astro-link-preview/', ''))

          generator.generate(rawHref).then(buf => {
            res.setHeader('Content-Type', `application/octet-stream`)
            res.setHeader('Cache-Control', 'max-age=360000')
            res.end(buf)
          })
        } else {
          next()
        }
      })
    },

    async buildEnd() {
      await generator.dispose()
    },
  }
}

export { vitePlugin }
