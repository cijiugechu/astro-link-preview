import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import linkPreview from 'astro-link-preview'

const isCI = !!process.env.CI

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    linkPreview({
      proxy: isCI
        ? undefined
        : {
            server: 'http://127.0.0.1:7890',
          },
    }),
  ],
})
