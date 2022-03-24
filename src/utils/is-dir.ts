import fs from 'fs'

export function isDir(path: string) {
  try {
    var stat = fs.lstatSync(path)
    return stat.isDirectory()
  } catch {
    return false
  }
}
