import chalk from 'chalk';
import webpack from "webpack";
import { BuildOption } from "types";

import { runCompiler } from "./utils";
import { webpackClientConfig } from "./webpack/config.client";
import { webpackServerConfig } from "./webpack/config.server";

export async function buildDev(option: BuildOption) {
  option.isProduction = false;

  const serverCompiler = webpack(webpackServerConfig(option));
  await runCompiler(serverCompiler, true);
  chalk.green('Compilered server!');

  const clientCompiler = webpack(webpackClientConfig(option));
  await runCompiler(clientCompiler, true);

  return [clientCompiler, serverCompiler];
}

export async function buildProd(option: BuildOption) {
  option.isProduction = true;

  const configs = [webpackServerConfig(option), webpackClientConfig(option)];
  const multiCompiler = webpack(configs);

  return multiCompiler;
}
