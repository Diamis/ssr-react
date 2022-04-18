import chalk from 'chalk'
import express from 'express'
import bodyParser from 'body-parser'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import SSRMiddleware from './middlewares/ssr-middleware'

function ssrServer(options) {
  console.log(chalk.green('Started server...'))
  const { paths, host, port, compiler, watchOptions } = options

  let dev
  const app = new express()

  if (compiler) {
    dev = webpackDevMiddleware(compiler, watchOptions)
    app.use(dev)
    app.use(webpackHotMiddleware(compiler))
  }

  app.use(paths.clientPublic, express.static(paths.appBuild))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.get('/', SSRMiddleware)

  if (dev) {
    dev.waitUntilValid(() => {
      app.listen(port, () => {
        console.log(chalk.green('Server listening at'), chalk.yellow(`http://${host}:${port}`))
      })
    })
  } else {
    app.listen(port, () => {
      console.log(chalk.green('Server listening at'), chalk.yellow(`http://${host}:${port}`))
    })
  }

  return app
}

export default ssrServer
