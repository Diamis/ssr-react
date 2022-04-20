'use strict'

import fs from 'fs'
import path from 'path'

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath)

const bootstrap = process.env.BOOTSTRAP_FILENAME || 'index.tsx' /** точка входа client  */
const buildPath = process.env.BUILD_PATH || 'build' /** дириктория сборки приложения */
const app = process.env.APP_FILENAME || 'app.tsx' /** точка входа server */

const paths = {
  dotenv: resolveApp('.env'),
  tsConfig: resolveApp('tsconfig.json'),
  jsConfig: resolveApp('jsconfig.json'),
  packageJson: resolveApp('package.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  publicPathClient: ['/', buildPath, 'client/'].join('/').replace(/\/\//g, '/'),
  publicPathServer: ['/', buildPath, 'server/'].join('/').replace(/\/\//g, '/'),

  appEntryClient: '',
  appEntryServer: '',

  appRoot: resolveApp('.'),
  appSrc: resolveApp('src'),
  appBuild: resolveApp(buildPath),
  appBuildClient: resolveApp(path.resolve(buildPath, 'client')),
  appBuildServer: resolveApp(path.resolve(buildPath, 'server')),
}

paths.appEntryServer = path.resolve(paths.appSrc, app)
paths.appEntryClient = path.resolve(paths.appSrc, bootstrap)

export default paths
