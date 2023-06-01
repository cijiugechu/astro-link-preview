import { defineConfig } from 'astro/config'
import addClasses from './add-classes.mjs'
import LinkPreview from 'astro-link-preview/integration'

const isCI = !!process.env.CI

// https://astro.build/config
export default defineConfig({
  base: '/astro-link-preview',
  site: 'https://cijiugechu.github.io/',
  // Enable Custom Markdown options, plugins, etc.
  markdown: {
    remarkPlugins: ['remark-code-titles'],
    rehypePlugins: [
      'rehype-slug',
      ['rehype-autolink-headings', { behavior: 'prepend' }],
      ['rehype-toc', { headings: ['h2', 'h3'] }],
      [addClasses, { 'h1,h2,h3': 'title' }],
    ],
  },
  integrations: [LinkPreview({
    proxy: isCI ? undefined : {
      server: 'http://127.0.0.1:7890',
    }
  })],
})
