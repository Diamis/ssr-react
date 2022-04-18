'use strict'

require('@react-ssr/utils/env')

require('@babel/register')({
  only: [/\.(j|t)sx?/],
  ...require('@react-ssr/utils/babel-config'),
})

module.exports = require('./server').default
