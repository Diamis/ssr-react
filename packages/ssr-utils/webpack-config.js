'use strict'

const chalk = require('chalk')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const paths = require('./paths')
const rules = require('./webpack-rules')
const { getClientEnvironment, getServerEnvironment } = require('./env')
const { STAGE_CLIENT, STAGE_SERVER, STAGE_DEV_CLIENT, STAGE_DEV_SERVER } = require('./webpack-utils')

/**
 * @param {String} stage dev-client|dev-server|server|client
 * @returns
 */
module.exports = {
  webpack,
  makeConfig(stage) {
    const styleOptions = { isProd: Boolean(process.env.PROD), isExtractPlugin: true }
    const invalidStage = [STAGE_CLIENT, STAGE_SERVER, STAGE_DEV_CLIENT, STAGE_DEV_SERVER].every((key) => key !== stage)
    if (invalidStage) {
      throw Error(chalk.red(`Invalid stage "${stage}"`))
    }

    function getEntry() {
      const entrys = []
      switch (stage) {
        case STAGE_CLIENT:
          entrys.push(require.resolve('@babel/polyfill'))
          entrys.push(paths.bootstrap)
          break
        case STAGE_DEV_CLIENT:
          entrys.push(require.resolve('@babel/polyfill'))
          entrys.push(require.resolve('react-hot-loader/patch'))
          entrys.push(require.resolve('webpack-hot-middleware/client'))
          entrys.push(paths.bootstrap)
          break

        case STAGE_SERVER:
        case STAGE_DEV_SERVER:
          entrys.push(require.resolve('@babel/polyfill'))
          entrys.push(paths.app)
          break
      }
      return entrys
    }

    function getOutput() {
      switch (stage) {
        case STAGE_CLIENT:
        case STAGE_DEV_CLIENT:
          return {
            path: paths.buildClientPath,
            publicPath: '/',
            filename: `[name].js`,
            chunkFilename: `chunk-[name].js`,
          }

        case STAGE_SERVER:
        case STAGE_DEV_SERVER:
          return {
            path: paths.buildServerPath,
            library: { type: 'commonjs' },
            filename: `[name]-[contenthash].js`,
            chunkFilename: `chunk-[name]-[contenthash].js`,
          }
      }
    }

    function getPlugins() {
      const plugins = [new LoadablePlugin()]
      const styleFileName = 'css/[name].[contenthash].css'
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
          plugins.push(new MiniCssExtractPlugin({ filename: styleFileName }))
          break
      }

      return plugins
    }

    function getOptimization() {
      switch (stage) {
        case STAGE_SERVER:
        case STAGE_DEV_SERVER:
          return {
            minimize: true,
            minimizer: [new TerserPlugin()],
          }
        case STAGE_CLIENT:
        case STAGE_DEV_CLIENT:
          return {
            namedModules: true,
            runtimeChunk: { name: 'runtime' },
            namedChunks: true,
            splitChunks: {
              cacheGroups: {
                vendor: {
                  test: /node_modules/,
                  chunks: 'initial',
                  name: 'vendor',
                  enforce: true,
                },
              },
            },
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
          {
            test: /\.m?js/,
            resolve: { fullySpecified: false },
          },
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

      // optimization: getOptimization(),
      plugins: getPlugins(),
      resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
        modules: ['node_modules', paths.appSrc],
        alias: { '@src': paths.appSrc },
      },
    }
  },
}
