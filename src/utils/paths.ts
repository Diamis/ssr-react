'use strict'

import fs from 'fs'
import path from 'path'

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath)

const buildPath = process.env.BUILD_PATH || 'build'
const entryApp = process.env.ENTRY_PATH || 'src/app'

export default {
  entry: resolveApp(entryApp),
  dotenv: resolveApp('.env'),
  tsConfig: resolveApp('tsconfig.json'),
  jsConfig: resolveApp('jsconfig.json'),
  packageJson: resolveApp('package.json'),
  yarnLockFile: resolveApp('yarn.lock'),

  appRoot: resolveApp('.'),
  appSrc: resolveApp('src'),
  appBuild: resolveApp(buildPath),
  appBuildClient: resolveApp(path.resolve(buildPath, 'client')),
  appBuildServer: resolveApp(path.resolve(buildPath, 'server')),
}
