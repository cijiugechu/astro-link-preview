import type { Plugin } from 'vite'
import type { Options } from './types'
import { dataToEsm } from '@rollup/pluginutils'

const routeConfigPlugin = (
  options: Omit<Options, 'enableOnMobile'>
): Plugin => {
  return {
    name: 'vite-plugin-link-preview-route-config',
    enforce: 'pre',
    resolveId(source) {
      if (source === 'virtual:link-preview-config') {
        return 'virtual:link-preview-config'
      }

      return null
    },

    load(id) {
      if (id === 'virtual:link-preview-config') {
        return dataToEsm(options, {
          preferConst: true,
          namedExports: true,
        })
      }

      return null
    },
  }
}

export { routeConfigPlugin }
