'use strict'

import fs from 'fs'
import paths from 'utils/paths'

const NODE_ENV = process.env.NODE_ENV
const DEFAULT_PORT = '3000'
const DEFAULT_HOST = '127.0.0.1'
const REGEX_CLIENT = /^CLIENT_/i

const getDotenvFile = () => {
  if (NODE_ENV === 'development') return `${paths.dotenv}.dev`
  if (NODE_ENV === 'production') return `${paths.dotenv}.prod`
  if (NODE_ENV === 'test') return `${paths.dotenv}.test`
}

const dotenvFiles = [getDotenvFile(), paths.dotenv].filter(Boolean) as string[]

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(require('dotenv').config({ path: dotenvFile }))
  }
})

if (!process.env.HOST) {
  process.env.HOST = DEFAULT_HOST
}

if (!process.env.PORT) {
  process.env.PORT = DEFAULT_PORT
}

export function getClientEnvironment() {
  const defaultCleintEnvs = {
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
  }

  const raw = Object.keys(process.env)
    .filter((key) => REGEX_CLIENT.test(key))
    .reduce((env, key) => {
      env[key] = process.env[key]
      return env
    }, defaultCleintEnvs)

  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {}),
  }

  return { raw, stringified }
}

export function getServerEnvironment() {
  const raw = process.env
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {}),
  }

  return { raw, stringified }
}
