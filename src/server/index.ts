import fs from 'fs'
import path from 'path'
import https from 'https'
import webpack from 'webpack'
import bodyParser from 'body-parser'
import express, { Express } from 'express'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackDevMiddleware from 'webpack-dev-middleware'

import paths from '../utils/paths'
import SSRMiddleware from './middlewares/ssr-middleware'

class Server {
  app: Express
  host: string
  port: string
  publicPath: string
  staticPath: string
  webpackConfig: webpack.Configuration

  constructor(webpackConfig: webpack.Configuration) {
    this.app = express()
    this.host = process.env.HOST || '127.0.0.1'
    this.port = process.env.PORT || '3000'
    this.staticPath = webpackConfig.output?.path as string
    this.publicPath = webpackConfig.output?.publicPath as string
    this.webpackConfig = webpackConfig
  }

  private listenServer = (server: Express | https.Server, callback: any, protocol = 'http') => {
    server.listen(this.port, () => {
      console.log(`Server listening at ${protocol}://${this.host}:${this.port}`)
      callback(server)
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
      publicPath: this.publicPath,
      writeToDisk: true,
    })

    this.app.use(devMiddleware)
    this.app.use(hotMiddleware)

    this.app.use(this.publicPath, express.static(this.staticPath))
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.get('/', SSRMiddleware)

    return new Promise((resolve) => {
      devMiddleware.waitUntilValid(() => {
        let key, cert
        try {
          key = fs.readFileSync(path.resolve(paths.appRoot, '.certs', 'dev.key'), 'utf8')
          cert = fs.readFileSync(path.resolve(paths.appRoot, '.certs', 'dev.crt'), 'utf8')
        } catch {}

        if (key && cert) {
          const server = https.createServer({ key, cert }, this.app)
          this.listenServer(server, resolve, 'https')
        } else {
          this.listenServer(this.app, resolve)
        }
      })
    })
  }

  /**
   * run production server
   * @returns Promise
   */
  public runProd = async () => {
    this.app.use(this.publicPath, express.static(this.staticPath))
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.get('/', SSRMiddleware)

    return new Promise((resolve) => {
      this.listenServer(this.app, resolve)
    })
  }
}

export default Server
