import fs from 'fs'
import paths from './paths'
import { catchError } from './webpack-utils'

try {
  if (fs.existsSync(paths.appBuild)) {
    fs.rmSync(paths.appBuild, { recursive: true })
  }
} catch (err) {
  catchError(`Error while deleting ${paths.appBuild}.`)(err)
}
