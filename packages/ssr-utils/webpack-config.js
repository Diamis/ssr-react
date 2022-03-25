const chalk = require('chalk')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const paths = require('ssr-utils/paths')
const { getClientEnvironment, getServerEnvironment } = require('ssr-utils/env')

const rules = require('./webpack-rules')
const { STAGE_CLIENT, STAGE_SERVER, STAGE_DEV_CLIENT, STAGE_DEV_SERVER } = require('./webpack-utils')

/**
 * @param {String} stage dev-client|dev-server|server|client
 * @returns
 */
module.exports = (stage) => {
  const styleOptions = { isProd: Boolean(process.env.PROD) }
  const invalidStage = [STAGE_CLIENT, STAGE_SERVER, STAGE_DEV_CLIENT, STAGE_DEV_SERVER].every((key) => key !== stage)
  if (invalidStage) {
    throw Error(chalk.red(`Invalid stage "${stage}"`))
  }

  function getEntry() {
    const entrys = [require.resolve('@babel/polyfill'), paths.entry]
    if (stage === STAGE_DEV_CLIENT) {
      entrys.push('webpack-hot-middleware/client')
    }
    return entrys
  }

  function getOutput() {
    switch (stage) {
      case STAGE_CLIENT:
      case STAGE_DEV_CLIENT:
        return {
          path: paths.appBuild,
          filename: '[name].js',
          publicPath: '/',
          library: { type: 'commonjs' },
          chunkFilename: 'chunk-[name].js',
        }
      default:
        return {
          path: paths.appBuild,
          filename: '[name]-[contenthash].js',
          publicPath: 'public/',
          chunkFilename: 'chunk-[name]-[contenthash].js',
        }
    }
  }

  function getPlugins() {
    const plugins = []
    const styleFileName = 'static/css/[name].[contenthash].css'
    const providePlugin = {
      'fetch': require.resolve('node-fetch'),
      'global.fetch': require.resolve('node-fetch'),
    }

    switch (stage) {
      case STAGE_CLIENT:
        plugins.push(new webpack.DefinePlugin(getClientEnvironment().stringified))
        plugins.push(new MiniCssExtractPlugin({ filename: styleFileName }))
        break
      case STAGE_DEV_CLIENT:
        plugins.push(new webpack.DefinePlugin(getClientEnvironment().stringified))
        plugins.push(new MiniCssExtractPlugin({ filename: styleFileName }))
        plugins.push(new webpack.HotModuleReplacementPlugin())
        break
      case STAGE_SERVER:
      case STAGE_DEV_SERVER:
        plugins.push(new webpack.DefinePlugin(getServerEnvironment().stringified))
        plugins.push(new webpack.ProvidePlugin(providePlugin))
        break
    }

    return plugins
  }

  function getOptimization() {
    switch (stage) {
      case STAGE_DEV_SERVER:
        return { minimize: false }
      case STAGE_SERVER:
        return { minimize: true, minimizer: [new TerserPlugin()] }
      default:
        return {
          minimize: false,
          splitChunks: { cacheGroups: { default: false, defaultVendors: false } },
        }
    }
  }

  return {
    name: stage,
    mode: process.env.NODE_ENV,
    target: stage.includes('server') ? 'node' : 'web',
    devtool: stage === STAGE_DEV_CLIENT ? 'eval-cheap-module-source-map' : 'source-map',

    entry: getEntry(),
    output: getOutput(),

    module: {
      rules: [
        rules.js(),
        rules.svg(),
        rules.raw(),
        rules.css(styleOptions),
        rules.scss(styleOptions),
        rules.cssModules(styleOptions),
        rules.scssModules(styleOptions),
        rules.yaml(),
        rules.fonts(),
        rules.media(),
        rules.images(),
        rules.assets(),
      ],
    },

    optimization: getOptimization(),
    plugins: getPlugins(),
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      modules: ['node_modules', paths.appSrc],
      alias: { '@src': paths.appSrc },
    },
  }
}
