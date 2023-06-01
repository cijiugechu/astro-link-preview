import type { LoggerType } from './logger'
import type { LaunchOptions } from '@playwright/test'

interface Context {
  logger: LoggerType
  proxy: LaunchOptions['proxy']
}

const createContext = () => {
  let __ctx: Context

  return {
    set: (ctx: Context) => {
      __ctx = ctx
    },
    get: () => __ctx,
  }
}

const context = createContext()

export { context }
