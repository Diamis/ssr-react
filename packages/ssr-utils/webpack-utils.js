'use strict'

const chalk = require('chalk')
const paths = require('./paths')

const STAGE_CLIENT = 'client'
const STAGE_SERVER = 'server'
const STAGE_DEV_CLIENT = 'dev-client'
const STAGE_DEV_SERVER = 'dev-server'

function catchError(message) {
  return (err) => {
    console.log(chalk.red(message))
    console.log(err)
    process.exit(1)
  }
}

/**
 * find webpack compiler
 * @param {*} compilers webpack compilers
 * @param {*} name compiler name
 * @returns webpack compiler
 */
function findCompiler(compilers, name) {
  let result = null
  if (compilers && Array.isArray(compilers.compilers)) {
    result = compilers.compilers.find((compiler) => compiler.name === name)
  } else if (compilers && compilers.name === name) {
    result = compilers
  }

  if (!result) {
    throw new Error(`No webpack compiler found named '${name}', please check your configuration.`)
  }
  return result
}

function runCompiler(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) return reject(error)
      resolve(stats)
    })
  })
}

function allRunCompiler(compilers) {
  const all = compilers.map(runCompiler)
  return Promise.all(all)
}

function watchCompiler(compiler) {
  compiler.hooks.compile.tap('compiling', () => {
    console.log(chalk.green(`Compiling ${paths.buildServer}...`))
    Object.keys(require.cache).forEach(function (key) {
      if (key.includes(paths.buildServer) || key.includes[paths.buildClient]) {
        delete require.cache[key]
      }
    })
  })

  return new Promise((resolve, reject) => {
    compiler.watch(`watch ${paths.buildServer}`, (error, stats) => {
      if (error) return reject(error)
      resolve(stats)
    })
  })
}

/**
 * register webpack 'done' event listener
 * @param {*} compilers webpack compilers
 * @param {*} name compiler name
 */
const listenCompiler = (compiler) => {
  if (!compiler) {
    console.log(chalk.red('Failed to listenCompiler. Not found compiler'))
    throw new Error('Failed to listenCompiler. Not found compiler')
  }

  return new Promise((resolve, reject) => {
    compiler.hooks.compile.tap('compiling', () => {
      console.log(chalk.green('Compiling...'))
    })

    compiler.hooks.invalid.tap('invalid', (err) => {
      console.log(chalk.red('Failed to compile.'))
      reject(err)
    })

    compiler.hooks.done.tap('done', (stats) => {
      const statsData = stats.toJson({ all: false, errors: true, warnings: true })
      const isSuccessful = !statsData.errors.length && !statsData.warnings.length

      if (isSuccessful) {
        console.log(chalk.green('Compiled successfully!'))
        return resolve(compiler)
      }

      if (statsData.errors.length) {
        console.log(chalk.red('Failed to compile.'))
        console.log(statsData.errors.join('\n\n'))
      }

      if (statsData.warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.'))
        console.log(statsData.warnings.join('\n\n'))
      }

      return reject(statsData)
    })
  })
}

module.exports = {
  catchError,
  runCompiler,
  findCompiler,
  watchCompiler,
  allRunCompiler,
  listenCompiler,

  STAGE_CLIENT,
  STAGE_SERVER,
  STAGE_DEV_CLIENT,
  STAGE_DEV_SERVER,
}
