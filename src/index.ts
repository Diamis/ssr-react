import rimraf from "rimraf";
import webpack from "webpack";
import { BuildOption } from "types";

import { commands } from "./commands";
import { getOptions } from "./options";
import { startDevServer, startProdServer } from "./server";
import { getWebpackConfig, logMessage, watchCompiler } from "./utils";
import { webpackClientConfig } from "./webpack/config.client";
import { webpackServerConfig } from "./webpack/config.server";

export const run = async () => {
  const options = getOptions();
  const { rootPath } = options;

  rimraf.sync(options.buildPath);

  commands({
    startDevServer: async ({ configClient, configServer, ...args }) => {
      logMessage("Start dev server!", "true");

      const webpackConfig = getWebpackConfig({
        rootPath,
        configClient,
        configServer,
      });

      const option: BuildOption = { ...args, ...options, webpackConfig };
      const serverConfig = webpackServerConfig(option);
      const clientConfig = webpackClientConfig(option);

      const serverCompiler = webpack(serverConfig);
      const clientCompiler = webpack(clientConfig);

      await watchCompiler("server", serverCompiler);

      option.webpackConfig.server = serverConfig;
      option.webpackConfig.client = clientConfig;

      startDevServer(clientCompiler, option);
    },
    startProdServer: async ({ configClient, configServer, ...args }) => {
      const webpackConfig = getWebpackConfig({
        rootPath,
        configClient,
        configServer,
      });

      const option: BuildOption = { ...args, ...options, webpackConfig };
      const serverConfig = webpackServerConfig(option);
      const clientConfig = webpackClientConfig(option);

      webpack([serverConfig, clientConfig]);

      startProdServer(option);
    },
  });
};
