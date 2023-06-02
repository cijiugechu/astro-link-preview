import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,
  target: ['node16'],
  outExtension: () => {
    return {
      js: '.mjs',
    }
  },
  publicDir: 'inject',
})
