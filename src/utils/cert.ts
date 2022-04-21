import fs from 'fs'
import path from 'path'
import paths from './paths'

function checkDirecktory() {
  const cert = fs.readFileSync(path.resolve(paths.appRoot, '.certs', 'dev.pem'), 'utf8')
  try {
    if (fs.existsSync(directory)) {
    }
  } catch (error) {}
}
