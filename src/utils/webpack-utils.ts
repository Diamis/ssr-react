import webpack from 'webpack'

/**
 * handle error
 * @param {*} message webpack compilers
 * @returns (Error) => void
 */
export function catchError(message: string) {
  return (err: any) => {
    console.log(message)
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

export function runCompilers(compilers: webpack.MultiCompiler) {
  const promises = compilers.compilers.map((compiler) => {
    return new Promise((res, rej) => {
      compiler.run((error, stats) => {
        if (error) return rej(error)
        res(stats)
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
    console.log('Compiling...')
  })

  return new Promise((resolve, reject) => {
    compiler.watch({ ignored: /node_modules/ }, (error, state) => {
      if (error) return reject(error)
      resolve(state)
    })
  })
}
