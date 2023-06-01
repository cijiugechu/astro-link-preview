import type { LoggerType } from './logger'
import type { LaunchOptions } from '@playwright/test'

interface Context {
  logger: LoggerType
  proxy: LaunchOptions['proxy']
}

let context = {} as Context

export { context }
