<h1 align="center">
  <code>astro-link-preview</code>
</h1>

<p align="center">
  <a href="https://npmjs.org/package/astro-link-preview">
    <img src="https://img.shields.io/npm/v/astro-link-preview.svg" alt="version">
  </a>
</p>

<p align="center">
  <strong>
  This <code>Astro</code> integration generates preview images for external links.
  </strong>
</p>

<br>

![demo](/assets/demo.gif)

## Features

- Supports both Static Site Generation (`SSG`) and Server-Side Rendering (`SSR`) modes. 
- Automatically optimizes images to improve loading performance.
- Provides customizable styles for preview images. 

## Installation

```shell
# Using NPM
npm install astro-link-preview
# Using Yarn
yarn add astro-link-preview
# Using PNPM
pnpm add astro-link-preview
```

## Config

```js
// astro.config.mjs
import {defineConfig} from "astro/config"
import linkPreview from "astro-link-preview"
export default defineConfig({
  integrations: [
    linkPreview()
  ],
})
```


## Options

```ts
import type { LaunchOptions } from '@playwright/test'

export interface Options {
  /**
   * Whether to log stats
   * @default true
   */
  logStats?: boolean
  /**
   * proxy settings
   */
  proxy?: LaunchOptions['proxy']
  /**
   * preview image format
   * @default 'jpg'
   */
  previewImageFormat?: 'png' | 'jpg'
  /**
   * whether to allow image previews on mobile devices
   * @default false
   */
  enableOnMobile?: boolean
}
```

## How to use

see [example](./packages/playground/)

## License

MIT &copy; [nemurubaka](https://github.com/cijiugechu)
