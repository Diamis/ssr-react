'use strict'

process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

process.on('unhandledRejection', (err) => {
  throw err
})

require('./utils/clear-build')
require('./utils/create-entry')

const { webpack, makeConfig } = require('@react-ssr/utils/webpack-config')
const { STAGE_SERVER, STAGE_CLIENT, catchError } = require('@react-ssr/utils/webpack-utils')

const serverConfig = makeConfig(STAGE_SERVER)
const clientConfig = makeConfig(STAGE_CLIENT)

let compilers

try {
  compilers = webpack([serverConfig, clientConfig])
} catch (err) {
  catchError('Failed to compile.')(err)
}

compilers.run((error, stats) => {
  console.log('error', error)
  console.log('stats', stats)
})
