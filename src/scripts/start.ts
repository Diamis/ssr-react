'use strict'

process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

process.on('unhandledRejection', (error) => {
  throw error
})

import webpack from 'webpack'
import Server from '../server'
import webpackConfig from '../utils/webpack-config'
import { Stage } from '../types/global'
import { catchError, findCompiler, watchCompiler } from '../utils/webpack-utils'

let compilers: webpack.MultiCompiler

const serverConfig = webpackConfig(Stage.DEV_SERVER)
const clientConfig = webpackConfig(Stage.DEV_CLIENT)

try {
  compilers = webpack([serverConfig, clientConfig])
} catch (error) {
  console.error(error)
  catchError('Failed to compile.')(error)
  process.exit(1)
}

watchCompiler(compilers, Stage.DEV_SERVER).then(() => {
  const compiler = findCompiler(compilers, Stage.DEV_CLIENT)
  const server = new Server(clientConfig)
  server.runDev(compiler)
})
