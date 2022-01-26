import { BuildOption } from "types";

import { buildDev, buildProd } from "./build";
import { commands } from "./commands";
import { getOptions } from "./options";
import { getCustomWebpackConfig } from "./utils";
import { startDevServer, startProdServer } from "./server";

export const run = async () => {
  const options = getOptions();

  commands({
    startDevServer: async ({ config, ...args }) => {
      const customWebpackConfig = getCustomWebpackConfig(config);
      const option: BuildOption = { ...options, ...args, customWebpackConfig };
      const [compiler] = await buildDev(option);

      startDevServer(compiler, option);
    },
    startProdServer: async ({ config, ...args }) => {
      const customWebpackConfig = getCustomWebpackConfig(config);
      const option: BuildOption = { ...options, ...args, customWebpackConfig };

      await buildProd(option);

      startProdServer(option);
    },
  });
};

run();
