import path from "path";
import chalk from "chalk";
import webpack from "webpack";
import { WebpackConfigProps, WebpackConfigResult } from "types";

export function watchCompiler(name: string, compiler: webpack.Compiler) {
  return new Promise((res, rej) => {
    compiler.hooks.compile.tap(name, () => {
      logMessage(`[${name}] Compiling`, "info");
    });

    compiler.hooks.failed.tap(name, (error) => {
      console.log("error", error);
    });

    compiler.hooks.done.tap(name, (stats) => {
      if (!stats.hasErrors()) {
        logMessage(`[${name}] Done`, "info");
        return res(undefined);
      }

      logMessage(`[${name}] Failed to compile!\n${stats.toString()}`, "error");
      return rej(undefined);
    });

    compiler.watch({}, (error, stats) => {
      if (stats && !stats.hasErrors()) {
        return;
      }

      if (error) {
        logMessage(String(error), "error");
      }
    });
  });
}

export function getWebpackConfig({
  rootPath,
  configClient,
  configServer,
}: WebpackConfigProps): WebpackConfigResult {
  let client = {};
  let server = {};

  try {
    if (configClient) {
      const webpackConfigPath = path.join(rootPath, configClient);
      client = require(webpackConfigPath).default as webpack.Configuration;
    }
  } catch {
    logMessage("Not found wepback client config", "warning");
  }

  try {
    if (configServer) {
      const webpackConfigPath = path.join(rootPath, configServer);
      server = require(webpackConfigPath).default as webpack.Configuration;
    }
  } catch {
    logMessage("Not found wepback server config", "warning");
  }

  return { client, server };
}

export const logMessage = (message: string, level = "log") => {
  const colors = {
    log: "white",
    info: "blue",
    true: "green",
    error: "red",
    warning: "yellow",
  };
  const color = colors?.[level] || colors.log;
  console.log(`[${new Date().toISOString()}]`, chalk[color](message));
};
