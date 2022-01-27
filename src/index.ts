import rimraf from "rimraf";
import { BuildOption } from "types";

import { buildDev, buildProd } from "./build";
import { commands } from "./commands";
import { getOptions } from "./options";
import { getCustomWebpackConfig } from "./utils";
import { startDevServer, startProdServer } from "./server";

export const run = async () => {
  const options = getOptions();

  rimraf.sync(options.buildPath);

  commands({
    startDevServer: async ({ configClient, configServer, ...args }) => {
      const customWebpackConfig = getCustomWebpackConfig({
        rootPath: options.rootPath,
        configClient,
        configServer,
      });

      const option: BuildOption = { ...options, ...args, customWebpackConfig };
      const [compiler] = await buildDev(option);

      startDevServer(compiler, option);
    },
    startProdServer: async ({ configClient, configServer, ...args }) => {
      const customWebpackConfig = getCustomWebpackConfig({
        rootPath: options.rootPath,
        configClient,
        configServer,
      });

      const option: BuildOption = { ...options, ...args, customWebpackConfig };

      await buildProd(option);

      startProdServer(option);
    },
  });
};
