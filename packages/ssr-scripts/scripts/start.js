'use strict'

process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

process.on('unhandledRejection', (err) => {
  throw err
})

require('./utils/clear-build')
require('./utils/create-entry')

const ssrServer = require('@react-ssr/server')
const paths = require('@react-ssr/utils/paths')
const utils = require('@react-ssr/utils/webpack-utils')
const { webpack, makeConfig } = require('@react-ssr/utils/webpack-config')

const PORT = process.env.PORT
const HOST = process.env.HOST
const { STAGE_DEV_SERVER, STAGE_DEV_CLIENT } = utils

const serverConfig = makeConfig(STAGE_DEV_SERVER)
const clientConfig = makeConfig(STAGE_DEV_CLIENT)

async function start() {
  let compilers

  try {
    compilers = webpack([serverConfig, clientConfig])
  } catch (err) {
    utils.catchError('Failed to compile.')(err)
  }

  const compilerClient = utils.findCompiler(compilers, STAGE_DEV_CLIENT)
  const compilerServer = utils.findCompiler(compilers, STAGE_DEV_SERVER)

  await utils.watchCompiler(compilerServer)

  ssrServer({
    paths,
    port: PORT,
    host: HOST,
    compiler: compilerClient,
    watchOptions: {
      writeToDisk: true,
      serverSideRender: true,
      publicPath: '/',
    },
  })
}

start()
