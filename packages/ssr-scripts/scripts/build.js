'use strict'

process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

process.on('unhandledRejection', (err) => {
  throw err
})

const webpackConfig = require('../configs/webpack.config')

console.log(webpackConfig('server'))
console.log(webpackConfig('client'))
