'use strict'

const fs = require('fs')
const path = require('path')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)

const buildPath = process.env.BUILD_PATH || 'build'
const entryPath = process.env.ENTRY_PATH || 'src/index'

module.exports = {
  entry: resolveApp(entryPath),
  dotenv: resolveApp('.env'),
  appSrc: resolveApp('src'),
  appRoot: resolveApp('.'),
  appBuild: resolveApp(buildPath),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  appPackageJson: resolveApp('package.json'),
}
