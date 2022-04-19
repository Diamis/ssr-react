import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import paths from './paths'
import rules from './webpack-rules'
import { getClientEnvironment, getServerEnvironment } from './env'

export default (stage: Stage): webpack.Configuration => {
  const styleOptions = { isProd: Boolean(process.env.PROD) }
  const invalidStage = [Stage.CLIENT, Stage.SERVER, Stage.DEV_CLIENT, Stage.DEV_SERVER].every((key) => key !== stage)

  if (invalidStage) {
    throw Error(`Invalid stage "${stage}"`)
  }

  function getMode() {
    if (process.env.NODE_ENV === 'production') return 'production'
    return 'development'
  }

  function getEntry() {
    const entrys = [require.resolve('@babel/polyfill'), paths.entry]
    if (stage === Stage.DEV_CLIENT) {
      entrys.push('webpack-hot-middleware/client')
    }
    return entrys
  }

  function getOutput() {
    switch (stage) {
      case Stage.CLIENT:
      case Stage.DEV_CLIENT:
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

  return {
    name: stage,
    mode: getMode(),
    target: stage.includes('server') ? 'node' : 'web',
    devtool: stage === Stage.DEV_CLIENT ? 'eval-cheap-module-source-map' : 'source-map',

    entry: getEntry(),
    output: getOutput(),

    module: {
      rules: [
        rules.js({}),
        rules.svg({}, {}),
        rules.raw({}),
        rules.css(styleOptions),
        rules.scss(styleOptions),
        rules.cssModules(styleOptions),
        rules.scssModules(styleOptions),
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
      alias: { '..': paths.appSrc },
    },
  }
}
