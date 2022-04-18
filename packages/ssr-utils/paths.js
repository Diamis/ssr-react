'use strict'

const fs = require('fs')
const path = require('path')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)

const app = process.env.APP_FILENAME || 'app.tsx'
const appBuild = process.env.APP_BUILD || 'dist'
const bootstrap = process.env.BOOTSTRAP_FILENAME || 'index.tsx'
const buildClient = process.env.BUILD_CLIENT_FOLDER || 'client'
const buildServer = process.env.BUILD_SERVER_FOLDER || 'server'

const clientPublicPath = `/${appBuild}/${buildClient}/`.replace(/\/\//g, '/')
const serverPublicPath = `/${appBuild}/${buildServer}/`.replace(/\/\//g, '/')

module.exports = {
  clientPublic: `/${buildClient}/`.replace(/\/\//g, '/'),
  serverPublic: `/${buildServer}/`.replace(/\/\//g, '/'),

  buildPath: resolveApp(appBuild),
  buildClient,
  buildClientPath: resolveApp(path.join(appBuild, buildClient)),
  buildServer,
  buildServerPath: resolveApp(path.join(appBuild, buildServer)),

  app,
  appBuild,
  bootstrap,
  clientPublicPath,
  serverPublicPath,

  appEntryServer: resolveApp(`src/${app}`),
  appEntryClient: resolveApp(`src/${bootstrap}`),

  dotenv: resolveApp('.env'),
  appSrc: resolveApp('src'),
  appRoot: resolveApp('.'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  appPackageJson: resolveApp('package.json'),
  appModuleFederation: resolveApp('federation.config.js'),
}
