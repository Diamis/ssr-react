import webpack from 'webpack'

import { Stage } from './types'
import { promiseCompiler } from './utils/promise-compiler'

export type Compile = {
  compiler: webpack.Compiler
  promise: Promise<unknown>
}

export type Compilers = Partial<Record<Stage, Compile>>

export function compilers(webpackConfigs: webpack.Configuration[]): Compilers {
  const { compilers } = webpack(webpackConfigs)
  return compilers.reduce<Compilers>((prev, compiler) => {
    Object.assign(prev, {
      [compiler.webpack.name]: {
        compiler,
        promise: promiseCompiler(compiler.webpack.name, compiler),
      },
    })

    return prev
  }, {})
}
