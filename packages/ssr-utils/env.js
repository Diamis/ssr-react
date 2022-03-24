'use strict'

const fs = require('fs')
const paths = require('./paths')

const NODE_ENV = process.env.NODE_ENV
const DEFAULT_PORT = 3000
const DEFAULT_HOST = '127.0.0.1'
const REGEX_CLIENT = /^CLIENT_/i

const dotenvFiles = [`${paths.dotenv}.${NODE_ENV}`, paths.dotenv]

if (NODE_ENV !== 'test') {
  dotenvFiles.unshift(`${paths.dotenv}.local`)
}

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

function getClientEnvironment() {
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

function getServerEnvironment() {
  const raw = process.env
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {}),
  }

  return { raw, stringified }
}

module.exports = {
  getClientEnvironment,
  getServerEnvironment,
}
