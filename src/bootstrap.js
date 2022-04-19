'use strict'

require('@babel/register')({
  only: [/\.(j|t)sx?/],
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  plugins: [
    require.resolve('@loadable/babel-plugin'),
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('@babel/plugin-proposal-class-properties'),
  ],
  presets: [
    require.resolve('@babel/preset-env'),
    require.resolve('@babel/preset-react'),
    require.resolve('@babel/preset-typescript'),
  ],
})

require('./utils/clear-build')
require('./utils/create-entry')

require(`./scripts/${process.argv[2]}`)
