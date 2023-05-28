import { losslessCompressPng } from '@napi-rs/image'

const optimize = (buf: Buffer) => losslessCompressPng(buf)

export { optimize }
