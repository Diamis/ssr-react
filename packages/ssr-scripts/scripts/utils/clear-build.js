const fs = require('fs')
const { appBuild } = require('@react-ssr/utils/paths')
const { catchError } = require('@react-ssr/utils/webpack-utils')

try {
  if (fs.existsSync(appBuild)) {
    fs.rmSync(appBuild, { recursive: true })
  }
} catch (err) {
  catchError(`Error while deleting ${appBuild}.`)(err)
}
