import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

import { isDir } from './is-dir'

export type EnvObject = {
  HOST: string
  PORT: string
  TARGET: string
  NODE_ENV: string
} & Record<string, string>

/**
 * Парсер env окружения проекта для web и node среды.
 * Переменные окружения для web добавляются если назнвание
 * переменной начинается на CLIENT_
 *
 * @param target среда окружения принимет значение node | web
 * @param nodeEnv задаем режим, может принимать значение 'development' | 'production'
 * @returns Record<string, string>
 */
export function parseEnv(target: 'node' | 'web', nodeEnv?: string): EnvObject {
  let configEnv = ''
  const activeEnv = process.env.NODE_ENV || nodeEnv
  const envDefaultObject = {
    HOST: JSON.stringify('localhost'),
    PORT: JSON.stringify(3000),
  }

  switch (activeEnv) {
    case 'development':
      configEnv = '.env.dev'
      break
    case 'production':
      configEnv = '.env.prod'
      break
  }

  const baseEnv = path.join(process.cwd(), '.env')
  const moreEnv = path.join(process.cwd(), configEnv)

  let parsedEnv = {}
  try {
    if (!isDir(baseEnv) && fs.existsSync(baseEnv)) {
      const textBaseEnv = fs.readFileSync(baseEnv, { encoding: 'utf8' })
      parsedEnv = { ...(dotenv.parse(textBaseEnv) || {}) }
    }

    if (configEnv && !isDir(moreEnv) && fs.existsSync(moreEnv)) {
      const textMoreEnv = fs.readFileSync(moreEnv, { encoding: 'utf8' })
      parsedEnv = { ...parsedEnv, ...(dotenv.parse(textMoreEnv) || {}) }
    }
  } catch (error) {
    throw new Error(`There was a problem processing the .env file `)
  }

  const envObject = Object.keys(parsedEnv).reduce((acc, key) => {
    if (/^CLIENT_/.test(key) || target === 'node') {
      acc[key] = JSON.stringify(parsedEnv[key])
    }
    return acc
  }, envDefaultObject) as EnvObject

  envObject.TARGET = JSON.stringify(target)
  envObject.NODE_ENV = JSON.stringify(activeEnv)

  return envObject
}
