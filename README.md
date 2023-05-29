# astro-link-preview

This `Astro` integration generates preview images for external links.

![demo](/assets/demo.gif)

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
import linkPreview from "astro-link-preview/integration"
export default defineConfig({
  integrations: [
    linkPreview()
  ],
})
```

## Usage

```astro
---
import { Link } from 'astro-link-preview';
---

<Link href="https://docs.astro.build/en/getting-started/">
  external link
</Link>
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
}
```

## How to use

see [example](./packages/playground/)

## License

MIT &copy; [nemurubaka](https://github.com/cijiugechu)
