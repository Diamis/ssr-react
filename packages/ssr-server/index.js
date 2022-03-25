'use strict'

require('ssr-utils/env')

require('@babel/register')({
  only: [/\.(j|t)sx?/],
  ...require('ssr-utils/babel-config'),
})

module.exports = require('./server').default
