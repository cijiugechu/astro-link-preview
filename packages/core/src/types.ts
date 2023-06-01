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
}
