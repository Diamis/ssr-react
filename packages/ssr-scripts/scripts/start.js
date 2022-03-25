'use strict'

process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

process.on('unhandledRejection', (err) => {
  throw err
})

const chalk = require('chalk')
const webpack = require('webpack')
const ssrServer = require('ssr-server')
const webpackUtils = require('ssr-utils/webpack-utils')
const createWebpackConfig = require('ssr-utils/webpack-config')

const PORT = process.env.PORT
const HOST = process.env.HOST
const { STAGE_DEV_SERVER, STAGE_DEV_CLIENT } = webpackUtils
const { catchError, findCompiler, listenCompiler } = webpackUtils

const serverConfig = createWebpackConfig(STAGE_DEV_SERVER)
const clientConfig = createWebpackConfig(STAGE_DEV_CLIENT)

let compilers

try {
  compilers = webpack([serverConfig, clientConfig])
} catch (err) {
  const funcError = catchError('Failed to compile.')
  funcError(err)
}

const compilerServer = findCompiler(compilers, STAGE_DEV_SERVER)

compilerServer.watch({ ignored: /node_modules/ }, (err) => {
  if (err) throw err
})

listenCompiler(compilerServer)
  .then(() => {
    const compilerClient = findCompiler(compilers, STAGE_DEV_CLIENT)
    const server = ssrServer({
      compiler: compilerClient,
      watchOptions: {
        writeToDisk: true,
        stats: clientConfig.stats,
        publicPath: clientConfig.output.publicPath,
      },
    })

    server.listen(PORT, () => {
      console.log(chalk.green('Server listening at'), chalk.yellow(`http://${HOST}:${PORT}`))
    })
  })
  .catch(catchError('Failed to listenCompiler.'))
