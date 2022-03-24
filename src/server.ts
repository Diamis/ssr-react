import path from 'path'
import webpack from 'webpack'
import bodyParser from 'body-parser'
import express, { Express } from 'express'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'

import { Stage } from './types'
import { logMessage } from './utils/message'
import { EnvObject } from './utils/parse-env'
import { ParsePath } from './utils/parse-path'
import middlewareRenderSSR from './middleware/ssr-middleware'
import middlewareCrossDev from './middleware/cross-dev-middleware'

type ServerOptions = {
  paths: ParsePath
  envs: EnvObject
}

const startServer = (app: Express, options: ServerOptions) => {
  const {
    paths: { build },
    envs: { HOST, PORT },
  } = options

  const staticPath = path.join(build, 'client', 'static')

  app.use('/favicon.ico', (req, res) => res.send('favicon'))
  app.use('/static', express.static(staticPath))

  app.use(bodyParser.urlencoded())
  app.use(bodyParser.json())

  // app.get('*', middlewareRenderSSR(option))

  app.listen(parseInt(PORT), String(HOST), () => {
    logMessage(`\nRunning on http://${PORT}:${PORT}/\n`, 'true')
  })

  return app
}

export type DevServerOptions = {
  clientCompiler: webpack.Compiler
  serverOptions: ServerOptions
}

export type ProdServerOptions = {
  serverOptions: ServerOptions
}

export const startDevServer = ({ clientCompiler, serverOptions }: DevServerOptions) => {
  const app = express()
  const devServer = devMiddleware(clientCompiler)

  app.use(devServer)
  app.use(hotMiddleware(clientCompiler))
  app.use(middlewareCrossDev)

  devServer.waitUntilValid(() => startServer(app, serverOptions))
}

export const startProdServer = ({ serverOptions }: ProdServerOptions) => {
  const app = express()
  startServer(app, serverOptions)
}
