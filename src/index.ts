import rimraf from 'rimraf'

import * as server from './server'
import { Stage } from './types'
import { commands } from './commands'
import { compilers } from './compilers'
import { parsePath } from './utils/parse-path'
import { webpackMake } from './utils/webpack.make'
import { parseEnv } from './utils/parse-env'
import { logMessage } from './utils/message'

export const run = () => {
  const envs = parseEnv('node')
  const paths = parsePath({ srcPath: envs.PATH_SRC, buildPath: envs.PATH_BUILD })
  const serverOptions = { envs, paths }

  // очищаем директорию
  // перед размещением файлов проекта
  rimraf.sync(paths.build)

  commands({
    startDevServer: async (args) => {
      logMessage('Start dev server!', 'true')
      envs.NODE_ENV = JSON.stringify('development')

      const stages = [Stage.devClient, Stage.devServer]
      const configPaths = [args.configClient, args.configServer]
      const webpackConfigs = webpackMake({ envs, paths, stages, configPaths })
      const webpackCompilers = compilers(webpackConfigs)

      if (webpackCompilers.client) {
        server.startDevServer({
          serverOptions,
          clientCompiler: webpackCompilers.client.compiler,
        })
      }
    },

    startProdServer: async (args) => {
      logMessage('Start prod server!', 'true')
      envs.NODE_ENV = JSON.stringify('production')

      const stages = [Stage.client, Stage.server]
      const configPaths = [args.configClient, args.configServer]
      const webpackConfigs = webpackMake({ envs, paths, stages, configPaths })

      console.dir(webpackConfigs, { depth: 2 })
    },

    buildProd: async (args) => {
      logMessage('Build prod!', 'true')
      envs.NODE_ENV = JSON.stringify('production')

      const stages = [Stage.client, Stage.server]
      const configPaths = [args.configClient, args.configServer]
      const webpackConfigs = webpackMake({ envs, paths, stages, configPaths })

      console.dir(webpackConfigs, { depth: 2 })
    },
  })
}
