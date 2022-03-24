import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { CommandsOptions } from 'lib'

export const commands = (commandsOptions: CommandsOptions) => {
  const { startDevServer, startProdServer, buildProd } = commandsOptions
  const builder = {
    port: { describe: 'порт сервера', default: 3000 },
    host: { describe: 'имя хотса', default: '127.0.0.1' },
    configClient: { describe: 'путь к webpack.config для сборки в режиме web' },
    configServer: { describe: 'путь к webpack.config для сборки в режиме node' },
  }

  yargs(hideBin(process.argv)).command({
    builder,
    command: 'dev',
    describe: 'Запуск сервера в режиме разработка',
    handler: startDevServer,
  }).argv

  yargs(hideBin(process.argv)).command({
    builder,
    command: 'prod',
    describe: 'Зупуск сервера в режиме продакшен',
    handler: startProdServer,
  }).argv

  yargs(hideBin(process.argv)).command({
    builder,
    command: 'build',
    describe: 'Компилирует проект',
    handler: buildProd,
  }).argv
}
