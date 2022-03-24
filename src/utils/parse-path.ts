import path from 'path'

export type ParsePathOptions = {
  srcPath?: string
  buildPath?: string
}

export type ParsePath = {
  src: string
  root: string
  build: string
}

export const parsePath = (options: ParsePathOptions = {}): ParsePath => {
  const { srcPath = 'src', buildPath = 'dist' } = options

  const root = process.cwd()
  const src = path.join(root, srcPath)
  const build = path.join(root, buildPath)

  return {
    src,
    root,
    build,
  }
}
