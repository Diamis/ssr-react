'use strict'

process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

process.on('unhandledRejection', (error) => {
  throw error
})

import webpack from 'webpack'
import Server from '../server'
import webpackConfig from '../utils/webpack-config'
import { catchError, runCompilers } from '../utils/webpack-utils'

let compilers: webpack.MultiCompiler

const serverConfig = webpackConfig(Stage.DEV_SERVER)
const clientConfig = webpackConfig(Stage.DEV_CLIENT)

try {
  compilers = webpack([serverConfig, clientConfig])
} catch (error) {
  catchError('Failed to compile.')(error)
  process.exit(1)
}

runCompilers(compilers).then(() => {
  const server = new Server(clientConfig)
  server.runProd()
})
