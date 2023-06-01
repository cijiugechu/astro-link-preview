import { losslessCompressPng } from '@napi-rs/image'
import { context } from './context'

const optimize = (buf: Buffer) => {
  const { imageFormat } = context.get()

  if (imageFormat === 'png') {
    return losslessCompressPng(buf, {
      force: true,
    })
  }

  return buf
}

export { optimize }
