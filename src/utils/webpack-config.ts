import path from 'path'
import webpack from 'webpack'
import CssnanoPlugin from 'cssnano-webpack-plugin'
import LoadablePlugin from '@loadable/webpack-plugin'
import webpackNodeExternals from 'webpack-node-externals'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'

import paths from './paths'
import rules from './webpack-rules'
import { Stage, LoaderOptions } from '../types/global'
import { getClientEnvironment, getServerEnvironment } from './env'

export default (stage: Stage): webpack.Configuration => {
  const isProd = stage === Stage.CLIENT || stage === Stage.SERVER
  const invalidStage = [Stage.CLIENT, Stage.SERVER, Stage.DEV_CLIENT, Stage.DEV_SERVER].every((key) => key !== stage)
  const options: LoaderOptions = { stage, isProd }

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
        entrys.push(paths.appEntryClient)
        break
      case Stage.DEV_CLIENT:
        entrys.push(require.resolve('webpack-hot-middleware/client'))
        entrys.push(paths.appEntryClient)
        break

      case Stage.SERVER:
      case Stage.DEV_SERVER:
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
          clean: true,
          publicPath: paths.publicPathClient,
          filename: isProd ? '[name]-[contenthash].js' : '[name].js',
          chunkFilename: isProd ? 'chunk-[name]-[contenthash].js' : 'chunk-[name].js',
        }

      case Stage.SERVER:
      case Stage.DEV_SERVER:
        return {
          path: paths.appBuildServer,
          clean: true,
          library: { type: 'commonjs2' },
          publicPath: paths.publicPathServer,
          filename: isProd ? '[name]-[contenthash].js' : '[name].js',
          chunkFilename: isProd ? 'chunk-[name]-[contenthash].js' : 'chunk-[name].js',
        }
    }
  }

  function getPlugins() {
    const plugins: any = []
    const cssExtractOptions = {
      filename: isProd ? 'css/[name].[contenthash].css' : 'css/[name].css',
      chunkFilename: isProd ? 'css/[id].[contenthash].css' : 'css/[id].css',
    }
    const providePlugin = {
      'fetch': require.resolve('node-fetch'),
      'global.fetch': require.resolve('node-fetch'),
      'window': path.resolve(__dirname, '../mock/window.mock'),
      'localStorage': path.resolve(__dirname, '../mock/localStorage.mock'),
    }

    plugins.push(new LoadablePlugin())
    switch (stage) {
      case Stage.CLIENT:
        plugins.push(new MiniCssExtractPlugin(cssExtractOptions))
        plugins.push(new webpack.DefinePlugin(getClientEnvironment().stringified))
        break
      case Stage.DEV_CLIENT:
        plugins.push(new MiniCssExtractPlugin(cssExtractOptions))
        plugins.push(new webpack.DefinePlugin(getClientEnvironment().stringified))
        plugins.push(new webpack.HotModuleReplacementPlugin())
        plugins.push(new ReactRefreshWebpackPlugin())
        break
      case Stage.SERVER:
      case Stage.DEV_SERVER:
        plugins.push(new MiniCssExtractPlugin(cssExtractOptions))
        plugins.push(new webpack.DefinePlugin(getServerEnvironment().stringified))
        plugins.push(new webpack.ProvidePlugin(providePlugin))
        break
    }

    return plugins
  }

  function getOptimization() {
    switch (stage) {
      case Stage.DEV_CLIENT:
      case Stage.DEV_SERVER:
        return { minimize: false }
      case Stage.SERVER:
      case Stage.CLIENT:
        return {
          minimize: true,
          minimizer: [new CssnanoPlugin()],
        }
    }
  }

  function getExternals() {
    if (stage.includes('server')) {
      return ['@loadable/component', webpackNodeExternals()]
    }
    return undefined
  }

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
        rules.js(options),
        rules.svg({}, {}),
        rules.raw({}),
        rules.css(options),
        rules.scss(options),
        rules.cssModules(options),
        rules.scssModules(options),
        rules.yaml({}),
        rules.fonts({}),
        rules.media({}),
        rules.images({}),
        rules.assets({}),
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
