import webpack from 'webpack'
import bodyParser from 'body-parser'
import express, { Express } from 'express'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackDevMiddleware from 'webpack-dev-middleware'

import SSRMiddleware from './middlewares/ssr-middleware'

class Server {
  app: Express
  host: string
  port: string
  staticPath: string
  webpackConfig: webpack.Configuration

  constructor(webpackConfig: webpack.Configuration) {
    this.app = express()
    this.host = process.env.HOST || '127.0.0.1'
    this.port = process.env.PORT || '3000'
    this.staticPath = webpackConfig.output?.path as string
    this.webpackConfig = webpackConfig
  }

  private listenServer = (callback: any) => {
    this.app.listen(this.port, () => {
      console.log(`Server listening at http://${this.host}:${this.port}`)
      callback(this.app)
    })
  }

  /**
   * run developer server
   * @param compiler webpack Compiler
   * @returns Promise
   */
  public runDev = async (compiler: webpack.Compiler) => {
    const hotMiddleware = webpackHotMiddleware(compiler)
    const devMiddleware = webpackDevMiddleware(compiler, {
      stats: this.webpackConfig.stats,
      publicPath: '/',
      writeToDisk: true,
    })

    this.app.use(devMiddleware)
    this.app.use(hotMiddleware)

    this.app.use('/', express.static(this.staticPath))
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.get('/', SSRMiddleware)

    return new Promise((resolve) => {
      devMiddleware.waitUntilValid(() => this.listenServer(resolve))
    })
  }

  /**
   * run production server
   * @returns Promise
   */
  public runProd = async () => {
    this.app.use('/', express.static(this.staticPath))
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.get('/', SSRMiddleware)

    return new Promise((resolve) => {
      this.listenServer(resolve)
    })
  }
}

export default Server
