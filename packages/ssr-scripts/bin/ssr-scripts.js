#!/usr/bin/env node
'use strict'

const SCRIPT_START = 'start'
const SCRIPT_BUILD = 'build'

const spawn = require('ssr-utils/cross-spawn')
const args = process.argv.slice(2)

const nodeArgs = []
const scriptIndex = args.findIndex((s) => s === SCRIPT_BUILD || s === SCRIPT_START)
const script = scriptIndex !== -1 ? args[0] : args[scriptIndex]

if ([SCRIPT_BUILD, SCRIPT_START].includes(script)) {
  const result = spawn.sync(
    process.execPath,
    nodeArgs.concat(require.resolve(`../scripts/${script}`)).concat(args.slice(scriptIndex + 1)),
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
