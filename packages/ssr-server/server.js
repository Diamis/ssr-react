'use strict'

import chalk from 'chalk'
import Koa from 'koa'
import KoaRouter from 'koa-router'
import koaCompress from 'koa-compress'
import koaBodyParser from 'koa-bodyparser'

import devMiddleware from './middlewares/koa-dev-middleware'
import hotMiddleware from './middlewares/koa-hot-middleware'
import ssrMiddleware from './middlewares/koa-ssr-middleware'

function server(options) {
  console.log(chalk.green('Started server...'))
  const { compiler, watchOptions, middlewares } = options

  const koaApp = new Koa()
  const koaRouter = new KoaRouter()

  // if (compiler) {
  //   koaApp.use(devMiddleware(compiler, watchOptions))
  //   koaApp.use(hotMiddleware(compiler))
  // }

  koaApp.use(koaCompress())
  koaApp.use(koaBodyParser())

  if (Array.isArray(middlewares)) {
    middlewares.forEach((middleware) => koaApp.use(middleware))
  }

  koaApp.use(ssrMiddleware)

  koaApp.use(koaRouter.routes())
  koaApp.use(koaRouter.allowedMethods())

  return koaApp
}

export default server
