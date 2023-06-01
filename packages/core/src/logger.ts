import kleur from 'kleur'

const noop = () => {}

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
      console.log(kleur.bgGreen(message))
    },
    warn: (message: string) => {
      console.log(kleur.bgYellow(message))
    },
    error: (message: string) => {
      console.log(kleur.bgRed(message))
    },
  }
}

export type LoggerType = ReturnType<typeof Logger>

export { Logger }
