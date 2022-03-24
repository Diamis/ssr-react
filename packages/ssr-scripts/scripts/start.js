'use strict'

process.env.NODE_ENV = 'development'
process.env.BABEL_ENV = 'development'

process.on('unhandledRejection', (err) => {
  throw err
})

require('ssr-utils/env')

const chalk = require('chalk')
const webpack = require('webpack')
const ssrServer = require('ssr-server')
const webpackUtils = require('ssr-utils/webpack-utils')
const createWebpackConfig = require('ssr-utils/webpack-config')

const PORT = process.env.PORT
const HOST = process.env.HOST
const { catchError, findCompiler, listenCompiler } = webpackUtils

const serverConfig = createWebpackConfig(webpackUtils.STAGE_DEV_SERVER)
const clientConfig = createWebpackConfig(webpackUtils.STAGE_DEV_CLIENT)

let compilers

try {
  compilers = webpack([serverConfig, clientConfig])
} catch (err) {
  const funcError = catchError('Failed to compile.')
  funcError(err)
}

const compilerServer = findCompiler(compilers, stages.STAGE_DEV_SERVER)

compilerServer.watch({ ignored: /node_modules/ }, (err) => {
  if (err) throw err
})

listenCompiler(compilerServer)
  .then(() => {
    const app = ssrServer({
      compiler: findCompiler(compilers, stages.STAGE_DEV_CLIENT),
      watchOptions: {
        stats: clientConfig.stats,
        publicPath: clientConfig.output.publicPath,
      },
    })

    app.listen(PORT, () => {
      console.log(chalk.green('Server listening at'), chalk.yellow(`http://${HOST}:${PORT}`))
    })
  })
  .catch(catchError('Failed to listenCompiler.'))
