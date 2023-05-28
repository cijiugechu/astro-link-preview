import { defineConfig } from 'astro/config'
import addClasses from './add-classes.mjs'
import LinkPreview from 'astro-link-preview/integration'

// https://astro.build/config
export default defineConfig({
  base: '/astro-satori',
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
  integrations: [LinkPreview()],
})
