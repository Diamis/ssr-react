import chalk from "chalk";
import webpack from "webpack";
import { BuildOption } from "types";

import { runCompiler } from "./utils";
import { webpackClientConfig } from "./webpack/config.client";
import { webpackServerConfig } from "./webpack/config.server";

export async function buildDev(option: BuildOption) {
  option.isProduction = false;

  console.log(chalk.blue("Start build dev server!"));

  const serverCompiler = webpack(webpackServerConfig(option));
  await runCompiler(serverCompiler, true);

  console.log(chalk.green("Development server compiled!\n"));
  console.log(chalk.blue("Start build dev client!"));

  const clientCompiler = webpack(webpackClientConfig(option));
  await runCompiler(clientCompiler, true);

  console.log(chalk.green("Development client compiled!\n"));
  return [clientCompiler, serverCompiler];
}

export async function buildProd(option: BuildOption) {
  option.isProduction = true;

  const configs = [webpackServerConfig(option), webpackClientConfig(option)];
  const multiCompiler = webpack(configs);

  return multiCompiler;
}
