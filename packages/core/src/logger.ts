import kleur from 'kleur'

const noop = () => {}

const prefix = '[astro-link-preview]:'

const Logger = (logStats: boolean) => {
  if (!logStats) {
    return {
      info: noop,
      warn: noop,
      error: noop,
    }
  }
  return {
    info: (message: string) => {
      console.log(kleur.bgGreen(prefix), message)
    },
    warn: (message: string) => {
      console.warn(kleur.bgYellow(prefix), message)
    },
    error: (message: string) => {
      console.error(kleur.bgRed(prefix), message)
    },
  }
}

export type LoggerType = ReturnType<typeof Logger>

export { Logger }
