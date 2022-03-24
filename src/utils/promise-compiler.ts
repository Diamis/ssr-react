import webpack from 'webpack'

import { logMessage } from './message'

export function promiseCompiler(name: string, compiler: webpack.Compiler) {
  return new Promise((res, rej) => {
    compiler.hooks.compile.tap(name, () => {
      logMessage(`[${name}] Compiling`, 'info')
    })

    compiler.hooks.done.tap(name, (stats) => {
      if (!stats.hasErrors()) {
        logMessage(`[${name}] Done`, 'info')
        return res(undefined)
      }

      logMessage(`[${name}] Failed to compile!\n${stats.toString()}`, 'error')
      return rej(undefined)
    })
  })
}
