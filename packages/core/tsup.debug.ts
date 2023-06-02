import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
  outExtension: () => {
    return {
      js: '.mjs',
    }
  },
  publicDir: 'inject',
})
