import { losslessCompressPng } from '@napi-rs/image'

const optimize = (buf: Buffer) =>
  losslessCompressPng(buf, {
    force: true,
  })

export { optimize }
