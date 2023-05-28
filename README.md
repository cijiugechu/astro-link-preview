# astro-satori

This `Astro` integration brings open graph images to your project, powered by [satori](https://github.com/vercel/satori)

See [example](/packages/playground/)

## Install

```shell
# Using NPM
npx astro add astro-satori
# Using Yarn
yarn astro add astro-satori
# Using PNPM
pnpx astro add astro-satori
```

## Config

```js
// astro.config.mjs
import {defineConfig} from "astro/config"
import satori from "astro-satori"
export default defineConfig({
  integrations: [
    satori({})
  ],
})
```

#### satoriOptionsFactory

Generate your own `satori` options by passing a function, if you do not provide this option, `astro-satori` will provide you with a default option.

`astro.config.mjs`

```js
import {defineConfig} from "astro/config"
import satori from "astro-satori"
export default defineConfig({
  integrations: [
    satori({
      satoriOptionsFactory: async () => {
        const fontFileRegular = await fetch(
          'https://www.1001fonts.com/download/font/ibm-plex-mono.regular.ttf'
        )
        const fontRegular: ArrayBuffer = await fontFileRegular.arrayBuffer()

        const fontFileBold = await fetch(
          'https://www.1001fonts.com/download/font/ibm-plex-mono.bold.ttf'
        )
        const fontBold: ArrayBuffer = await fontFileBold.arrayBuffer()

        const options = {
          width: 1200,
          height: 630,
          embedFont: true,
          fonts: [
            {
              name: 'IBM Plex Mono',
              data: fontRegular,
              weight: 400,
              style: 'normal',
            },
            {
              name: 'IBM Plex Mono',
              data: fontBold,
              weight: 600,
              style: 'normal',
            },
          ],
        }

        return options
      }
    })
  ],
})
```

#### satoriElement

Generate your own satori Element, if you do not provide this option, `astro-satori` will provide you with a default element.

`astro.config.mjs`

```js
import {defineConfig} from "astro/config"
import satori from "astro-satori"
export default defineConfig({
  integrations: [
    satori({
      satoriElement: ({ title, author, description }) => {
        return {
          type: 'div',
          props: {
            children: [
              title,
              author,
              description
            ]
          }
        }
      }
    })
  ],
})
```

## How to use

see [example](/packages/playground/)

## License

MIT &copy; [nemurubaka](https://github.com/cijiugechu)
