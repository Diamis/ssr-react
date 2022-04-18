const fs = require('fs')
const paths = require('@react-ssr/utils/paths')
const { catchError } = require('@react-ssr/utils/webpack-utils')

const templates = require('../../templates')

try {
  if (!fs.existsSync(paths.appEntryServer)) {
    fs.appendFileSync(paths.appEntryServer, templates.app)
  }

  if (!fs.existsSync(paths.appEntryClient)) {
    fs.appendFileSync(paths.appEntryClient, templates.bootstrap)
  }
} catch (err) {
  catchError('Failed to copy file.')(err)
}
