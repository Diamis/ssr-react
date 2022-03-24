import path from "path";
import { BuildOption } from "lib";
import { mergeWithCustomize, customizeArray } from "webpack-merge";
import nodeExternals from "webpack-node-externals";

import { webpackCommonConfig } from "./config.common";

const merge = mergeWithCustomize({
  customizeArray: customizeArray({ "entry.*": "replace" }),
});

export const webpackServerConfig = (options: BuildOption) => {
  const { rootPath, buildPath, webpackConfig } = options;
  const baseWebpackConfig = merge(
    webpackCommonConfig({ ...options, mode: "server" }),
    {
      name: "server",

      target: "node",
      devtool: "source-map",

      entry: path.resolve(rootPath, "src", "app"),

      output: {
        path: path.join(buildPath, "server"),
        library: { type: "commonjs2" },
        filename: "[name].js",
      },

      externals: ["@loadable/component", nodeExternals()],

      node: {
        __dirname: false,
        __filename: false,
      },
    }
  );

  if (typeof webpackConfig.server === "function") {
    return webpackConfig.server(baseWebpackConfig);
  }

  return merge(baseWebpackConfig, webpackConfig.server);
};
