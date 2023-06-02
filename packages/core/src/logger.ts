import kleur from 'kleur'

const prefix = '[astro-link-preview]:'

const noop = () => {}

const info = (message: string) => {
  console.log(kleur.bgGreen(prefix), message)
}

const warn = (message: string) => {
  console.warn(kleur.bgYellow(prefix), message)
}

const error = (message: string) => {
  console.error(kleur.bgRed(prefix), message)
}

const Logger = (logStats: boolean) => {
  return {
    info: logStats ? info : noop,
    warn: logStats ? warn : noop,
    error: error,
  }
}

export type LoggerType = ReturnType<typeof Logger>

export { Logger }
