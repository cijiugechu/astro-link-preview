# astro-link-preview

This `Astro` integration generates preview images for your links.

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

## How to use

see [example](../playground/)

## License

MIT &copy; [nemurubaka](https://github.com/cijiugechu)