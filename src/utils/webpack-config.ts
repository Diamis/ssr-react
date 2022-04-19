import path from 'path'
import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import LoadablePlugin from '@loadable/webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import webpackNodeExternals from 'webpack-node-externals'

import paths from './paths'
import rules from './webpack-rules'
import { Stage, LoaderOptions } from '../types/global'
import { getClientEnvironment, getServerEnvironment } from './env'

export default (stage: Stage): webpack.Configuration => {
  const styleOptions: LoaderOptions = { isProd: Boolean(process.env.PROD), isExtractPlugin: true }
  const invalidStage = [Stage.CLIENT, Stage.SERVER, Stage.DEV_CLIENT, Stage.DEV_SERVER].every((key) => key !== stage)

  if (invalidStage) {
    throw Error(`Invalid stage "${stage}"`)
  }

  function getMode() {
    if (process.env.NODE_ENV === 'production') return 'production'
    return 'development'
  }

  function getEntry() {
    const entrys = []
    switch (stage) {
      case Stage.CLIENT:
        entrys.push(require.resolve('@babel/polyfill'))
        entrys.push(paths.appEntryClient)
        break
      case Stage.DEV_CLIENT:
        entrys.push(require.resolve('@babel/polyfill'))
        entrys.push(require.resolve('webpack-hot-middleware/client'))
        entrys.push(paths.appEntryClient)
        break

      case Stage.SERVER:
      case Stage.DEV_SERVER:
        entrys.push(require.resolve('@babel/polyfill'))
        entrys.push(paths.appEntryServer)
        break
    }
    return entrys
  }

  function getOutput() {
    switch (stage) {
      case Stage.CLIENT:
      case Stage.DEV_CLIENT:
        return {
          path: paths.appBuildClient,
          filename: '[name]-[contenthash].js',
          publicPath: '/',
          chunkFilename: 'chunk-[name]-[contenthash].js',
        }

      case Stage.SERVER:
      case Stage.DEV_SERVER:
        return {
          path: paths.appBuildServer,
          library: { type: 'commonjs' },
          filename: '[name]-[contenthash].js',
          chunkFilename: 'chunk-[name]-[contenthash].js',
        }
    }
  }

  function getPlugins() {
    const plugins: any = []
    const styleFileName = 'css/[name].[contenthash].css'
    const providePlugin = {
      'fetch': require.resolve('node-fetch'),
      'global.fetch': require.resolve('node-fetch'),
      'window': path.resolve(__dirname, '../mock/window.mock'),
      'localStorage': path.resolve(__dirname, '../mock/localStorage.mock'),
    }

    plugins.push(new LoadablePlugin())
    switch (stage) {
      case Stage.CLIENT:
        plugins.push(new webpack.DefinePlugin(getClientEnvironment().stringified))
        plugins.push(new MiniCssExtractPlugin({ filename: styleFileName }))
        break
      case Stage.DEV_CLIENT:
        plugins.push(new webpack.DefinePlugin(getClientEnvironment().stringified))
        plugins.push(new MiniCssExtractPlugin({ filename: styleFileName }))
        plugins.push(new webpack.HotModuleReplacementPlugin())
        break
      case Stage.SERVER:
      case Stage.DEV_SERVER:
        plugins.push(new webpack.DefinePlugin(getServerEnvironment().stringified))
        plugins.push(new webpack.ProvidePlugin(providePlugin))
        plugins.push(new MiniCssExtractPlugin({ filename: styleFileName }))
        break
    }

    return plugins
  }

  function getOptimization() {
    switch (stage) {
      case Stage.DEV_SERVER:
        return { minimize: false }
      case Stage.SERVER:
        return { minimize: true, minimizer: [new TerserPlugin()] }
      default:
        return {
          minimize: false,
          splitChunks: { cacheGroups: { default: false, defaultVendors: false } },
        }
    }
  }

  function getExternals() {
    if (stage.includes('server')) {
      return [webpackNodeExternals()]
    }
    return []
  }

  const hot = [Stage.DEV_CLIENT, Stage.DEV_SERVER].includes(stage)
  console.log('hot', hot)
  return {
    name: stage,
    mode: getMode(),
    target: stage.includes('server') ? 'node' : 'web',
    devtool: stage === Stage.DEV_CLIENT ? 'eval-cheap-module-source-map' : 'source-map',

    entry: getEntry(),
    output: getOutput(),
    externals: getExternals(),

    module: {
      rules: [
        rules.js({}),
        rules.svg({}, {}),
        rules.raw({}),
        rules.css(styleOptions, hot),
        rules.scss(styleOptions, hot),
        rules.cssModules(styleOptions, hot),
        rules.scssModules(styleOptions, hot),
        rules.yaml({}),
        rules.fonts({}),
        rules.media({}),
        rules.images({}),
        rules.assets({}),
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
}
