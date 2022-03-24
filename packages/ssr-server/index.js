require('ssr-utils/env')

const chalk = require('chalk')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const koaCompress = require('koa-compress')
const koaBodyParser = require('koa-bodyparser')
const devMiddleware = require('ssr-utils/koa-dev-middleware')
const hotMiddleware = require('ssr-utils/koa-hot-middleware')

function server(options) {
  const { compiler, watchOptions, middlewares } = options

  const koaApp = new Koa()
  const koaRouter = new KoaRouter()

  if (compiler) {
    console.log(chalk.green('Started dev server!'))
    koaApp.use(devMiddleware(compiler, watchOptions))
    koaApp.use(hotMiddleware(compiler))
  }

  koaApp.use(koaCompress())
  koaApp.use(koaBodyParser())

  if (Array.isArray(middlewares)) {
    middlewares.forEach((middleware) => koaApp.use(middleware))
  }

  koaApp.use(koaRouter.routes())
  koaApp.use(koaRouter.allowedMethods())

  return koaApp
}

module.exports = server
