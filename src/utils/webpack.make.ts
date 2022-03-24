import webpack from 'webpack'
import { mergeWithCustomize, customizeArray } from 'webpack-merge'

import { Stage } from '../types'
import { EnvObject } from './parse-env'
import { ParsePath } from './parse-path'
import { webpackConfig } from './webpack.config'
import { parseWebpackConfig } from './parse-webpack-config'

const merge = mergeWithCustomize({
  customizeArray: customizeArray({ 'entry.*': 'replace', 'output.*': 'replace' }),
})
export type WebpackMakeOptions = {
  envs: EnvObject
  paths: ParsePath
  stages: Stage[]
  configPaths: string[]
}

export function webpackMake({ envs, paths, stages, configPaths }: WebpackMakeOptions) {
  const webpackConfigs: webpack.Configuration[] = []

  const { build, root, src } = paths
  stages.forEach((stage, index) => {
    const rootWebpacConfig = webpackConfig({
      directory: build,
      nodeEnv: envs.NODE_ENV,
      entry: src,
      stage,
    })

    const customWebpackConfig = parseWebpackConfig({
      configPath: configPaths[index],
      rootPath: root,
    })

    if (typeof customWebpackConfig === 'function') {
      webpackConfigs.push(customWebpackConfig(rootWebpacConfig))
    } else {
      webpackConfigs.push(merge(rootWebpacConfig, customWebpackConfig))
    }
  })

  return webpackConfigs
}
