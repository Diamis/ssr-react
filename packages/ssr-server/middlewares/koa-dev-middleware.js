'use strict'

const webpackDevMiddleware = require('webpack-dev-middleware')

module.exports = (compiler, options = {}) => {
  const instance = webpackDevMiddleware(compiler, options)

  function waitMiddleware() {
    return new Promise((resolve, reject) => {
      instance.waitUntilValid(() => resolve(true))
      compiler.plugin('failed', (error) => reject(error))
    })
  }

  function webpackKoaMiddleware(ctx, next) {
    return waitMiddleware().then(() => {
      const res = {
        locals: ctx.state,
        send(content) {
          if (ctx.status === 404) {
            ctx.status = 200
          }
          ctx.body = content
        },
        setHeader(field, value) {
          ctx.set(field, value)
        },
        get statusCode() {
          return ctx.status
        },
        set statusCode(code) {
          ctx.status = code
        },
      }
      return instance(ctx.req, res, next)
    })
  }

  webpackKoaMiddleware.getFilenameFromUrl = instance.getFilenameFromUrl
  webpackKoaMiddleware.waitUntilValid = instance.waitUntilValid
  webpackKoaMiddleware.invalidate = instance.invalidate
  webpackKoaMiddleware.close = instance.close
  webpackKoaMiddleware.fileSystem = instance.fileSystem

  return webpackKoaMiddleware
}
