import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CommandsOptions } from "types";

export const commands = (commandsOptions: CommandsOptions) => {
  const { startDevServer, startProdServer } = commandsOptions;
  const builder = {
    port: { describe: "порт сервера", default: 3000 },
    host: { describe: "имя хотса", default: "0.0.0.0" },
    config: { describe: "путь для webpack конфигурации" },
  };

  yargs(hideBin(process.argv)).command({
    builder,
    command: "dev",
    describe: "запуск сервера для разработки",
    handler: startDevServer,
  }).argv;

  yargs(hideBin(process.argv)).command({
    builder,
    command: "prod",
    describe: "зупуск сервера для продакшена",
    handler: startProdServer,
  }).argv;
};
