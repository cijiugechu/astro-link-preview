import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  minify: false,
  outExtension: () => {
    return {
      js: '.mjs',
    }
  },
  publicDir: 'inject',
})
