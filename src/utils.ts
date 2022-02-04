import path from "path";
import chalk from "chalk";
import webpack from "webpack";
import { WebpackConfigProps, WebpackConfigResult } from "types";

export function promiseCompiler(name: string, compiler: webpack.Compiler) {
  return new Promise((res, rej) => {
    compiler.hooks.compile.tap(name, () => {
      logMessage(`[${name}] Compiling`, "info");
    });

    compiler.hooks.done.tap(name, (stats) => {
      if (!stats.hasErrors()) {
        logMessage(`[${name}] Done`, "info");
        return res(undefined);
      }

      logMessage(`[${name}] Failed to compile!\n${stats.toString()}`, "error");
      return rej(undefined);
    });
  });
}

export function watchCompiler(name: string, compiler: webpack.Compiler) {
  compiler.watch({}, (error, stats) => {
    Object.keys(require.cache).forEach(function (id) {
      if (/[\/\\]server[\/\\]/.test(id)) {
        const filePath = id.split(/[\/\\]server[\/\\]/)[1];
        delete require.cache[id];
        logMessage(`[${name}] Clearing /server/${filePath}`, "info");
      } else if (/[\/\\]client[\/\\]/.test(id)) {
        const filePath = id.split(/[\/\\]client[\/\\]/)[1];
        delete require.cache[id];
        logMessage(`[${name}] Clearing /client/${filePath}`, "info");
      }
    });

    if (stats && !stats.hasErrors()) {
      return;
    }

    if (error) {
      logMessage(String(error), "error");
    }
  });

  return promiseCompiler(name, compiler);
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
