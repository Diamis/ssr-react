import chalk from 'chalk'
import webpack from 'webpack'

import paths from './paths'
import { Stage } from '../types/global'

/**
 * handle error
 * @param {*} message webpack compilers
 * @returns (Error) => void
 */
export function catchError(message: string) {
  return (err: any) => {
    console.log(chalk.red(message))
    if (err && err.message) {
      console.log(err.message)
    } else {
      console.log(err)
    }
  }
}

/**
 * find webpack compiler
 * @param {*} compilers webpack compilers
 * @param {*} name compiler name
 * @returns webpack compiler
 */
export function findCompiler(compilers: webpack.MultiCompiler | webpack.Compiler, name: Stage): webpack.Compiler {
  let result = null
  if (compilers instanceof webpack.MultiCompiler) {
    result = compilers.compilers.find((compiler) => compiler.name === name)
  } else if (compilers instanceof webpack.Compiler && compilers.name === name) {
    result = compilers
  }

  if (!result) {
    throw new Error(`No webpack compiler found named '${name}', please check your configuration.`)
  }

  return result
}

export function runCompilers({ compilers }: webpack.MultiCompiler) {
  const promises = compilers.map((compiler) => {
    return new Promise((resolve, reject) => {
      compiler.hooks.invalid.tap('invalid', (err) => {
        console.log(chalk.red('Failed to compile.'))
        console.log(err)
        reject(err)
      })

      compiler.run((error, stats) => {
        if (error) return reject(error)
        resolve(stats)
      })
    })
  })

  return Promise.all(promises)
}

/**
 * watch webpack compiler
 * @param {*} compilers webpack compilers
 * @param {*} name compiler name
 * @returns webpack compiler
 */
export function watchCompiler(compilers: webpack.MultiCompiler | webpack.Compiler, name: Stage) {
  const compiler = findCompiler(compilers, name)

  compiler.hooks.compile.tap('compiling', () => {
    console.log(chalk.green(`[${name}] Compiling...`))
    Object.keys(require.cache).forEach(function (key) {
      if (key.includes(paths.appBuildServer) || key.includes(paths.appBuildClient)) {
        delete require.cache[key]
      }
    })
  })

  return new Promise((resolve, reject) => {
    compiler.hooks.invalid.tap('invalid', (fileName) => {
      console.log(chalk.red(`[${name}] failed to compile file ${fileName}.`))
      reject(fileName)
    })

    compiler.watch({ ignored: /node_modules/ }, (error, stats) => {
      if (error) {
        return reject(error)
      }

      if (stats) {
        const statsData = stats.toJson({ all: false, errors: true, warnings: true }) as any
        const isSuccessful = !statsData.errors.length && !statsData.warnings.length
        if (isSuccessful) {
          console.log(chalk.green(`[${name}] Compiled successfully!`))
          return resolve(compiler)
        }

        if (statsData.errors.length) {
          console.log(chalk.red(`[${name}] Failed to compile:`))
          console.log(statsData.errors[0])
        }

        if (statsData.warnings.length) {
          console.log(chalk.yellow(`[${name}] Compiled with warnings:`))
          console.log(statsData.warnings[0])
        }
      }

      return reject(stats)
    })
  })
}
