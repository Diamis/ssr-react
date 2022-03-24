import path from 'path'
import webpack from 'webpack'

import { logMessage } from './message'

type WebpackConfigFunction = (config: webpack.Configuration) => webpack.Configuration

type ParseWebpackConfigOptions = {
  rootPath: string
  configPath?: string
}

type ParseWebpackConfig = webpack.Configuration | WebpackConfigFunction

export function parseWebpackConfig({ rootPath, configPath }: ParseWebpackConfigOptions): ParseWebpackConfig {
  if (configPath) {
    const webpackClientPath = path.join(rootPath, String(configPath))
    try {
      return require(webpackClientPath)
    } catch (error) {
      console.dir(error, { depth: 2 })
      logMessage(`Error require!!! ${error}`, 'warning')
    }
  }
  return {}
}
