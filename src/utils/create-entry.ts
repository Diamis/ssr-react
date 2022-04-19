import fs from 'fs'
import paths from './paths'
import { catchError } from './webpack-utils'

import * as templates from './templates'

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
