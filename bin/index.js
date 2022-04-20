#!/usr/bin/env node
'use strict'

const SCRIPT_PROD = 'prod'
const SCRIPT_START = 'start'
const SCRIPT_BUILD = 'build'

const spawn = require('cross-spawn')
const args = process.argv.slice(2)

const nodeArgs = []
const scriptIndex = args.findIndex((s) => s === SCRIPT_PROD || s === SCRIPT_START)
const script = scriptIndex !== -1 ? args[0] : args[scriptIndex]

if ([SCRIPT_PROD, SCRIPT_START].includes(script)) {
  const result = spawn.sync(
    process.execPath,
    nodeArgs
      .concat(require.resolve(`../src/bootstrap`))
      .concat(script)
      .concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  )

  if (result.signal) {
    if (result.signal === 'SIGKILL' || result.signal === 'SIGTERM') {
      console.log('The build failed because the process exited too early. ')
    }

    process.exit(1)
  }

  process.exit(result.status)
} else {
  console.log(`Unknown script "${script}".`)
}
