import path from 'path'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'

import { Stage } from '../types'
import { WebpackConfigProps } from './webpack.types'
import { createWebpackUtils } from './webpack.utils'
import { parseEnv } from './parse-env'

export const webpackConfig = ({ nodeEnv, directory, stage, entry }: WebpackConfigProps): webpack.Configuration => {
  const target = stage.includes('server') ? 'node' : 'web'
  const { rules, loaders } = createWebpackUtils(stage)

  function getMode() {
    switch (stage) {
      case Stage.devClient:
      case Stage.devServer:
        return 'development'
      case Stage.client:
      case Stage.server:
      default:
        return 'production'
    }
  }

  function getEntry(): webpack.Entry {
    switch (stage) {
      case Stage.client:
      case Stage.server:
      case Stage.devServer:
        return path.resolve(entry, 'app')
      case Stage.devClient:
        return ['webpack-hot-middleware/client?reload=true', path.resolve(entry, 'app')]
      default:
        throw new Error(`The state requested ${stage} doest't exist.`)
    }
  }

  function getOutput() {
    switch (stage) {
      case Stage.client:
      case Stage.devClient:
        return {
          path: directory,
          publicPath: '/',
          filename: '[name].js',
          chunkFilename: 'chunk-[name].js',
          library: { type: 'commonjs' },
        }
      case Stage.server:
      case Stage.devServer:
        return {
          path: directory,
          filename: '[name]-[contenthash].js',
          chunkFilename: 'chunk-[name]-[contenthash].js',
          publicPath: 'public/',
        }
      default:
        throw new Error(`The state requested ${stage} doest't exist.`)
    }
  }

  function getModule() {
    let configRules = [rules.js(), rules.yaml(), rules.fonts(), rules.images(), rules.media(), rules.assets()]

    switch (stage) {
      case Stage.client:
      case Stage.server:
        configRules = configRules.concat([rules.scssModules(), rules.scss()])
        break
      case Stage.server:
      case Stage.devServer:
        configRules = configRules.concat([rules.scssModules(), { ...rules.scss(), use: [loaders.null()] }])
        break
    }

    return { rules: configRules }
  }

  function getPlugins() {
    const configPlugins = []
    configPlugins.push(new webpack.DefinePlugin(parseEnv(target, nodeEnv)))

    switch (stage) {
      case Stage.devClient:
        configPlugins.push(new webpack.HotModuleReplacementPlugin())
      case Stage.devServer:
        configPlugins.push(
          new MiniCssExtractPlugin({
            filename: 'style/[name].css',
            chunkFilename: 'style/chunk-[name]-[id].css',
          })
        )
      case Stage.server:
        configPlugins.push(
          new MiniCssExtractPlugin({
            filename: 'style/[name]-[contenthash].css',
            chunkFilename: 'style/chunk-[name]-[contenthash].css',
          })
        )
      case Stage.server:
      case Stage.devServer:
        configPlugins.push(
          new webpack.ProvidePlugin({
            'fetch': require.resolve('node-fetch'),
            'global.fetch': require.resolve('node-fetch'),
          })
        )
    }
    return configPlugins.filter(Boolean)
  }

  function getDevtool() {
    if (stage === Stage.devClient) {
      return 'eval-cheap-module-source-map'
    }
    return 'source-map'
  }

  function getOptimization() {
    switch (stage) {
      case Stage.devServer:
        return {
          minimize: false,
        }
      case Stage.server:
        return {
          minimize: true,
          minimizer: [new TerserPlugin()],
        }
      case Stage.client:
      case Stage.devClient:
        return {
          splitChunks: {
            cacheGroups: {
              default: false,
              defaultVendors: false,
            },
          },
          minimize: false,
        }
    }
  }

  return {
    name: stage,
    mode: getMode(),
    devtool: getDevtool(),

    entry: getEntry(),
    output: getOutput(),

    module: getModule(),
    plugins: getPlugins(),

    // optimization: getOptimization(),

    resolveLoader: {},
    resolve: {},
  }
}
