import path from "path";
import { BuildOption } from "types";
import { merge } from "webpack-merge";
import nodeExternals from "webpack-node-externals";

import { webpackCommonConfig } from "./config.common";

export const webpackServerConfig = (options: BuildOption) => {
  const { rootPath, buildPath, customWebpackConfig } = options;

  return merge(
    webpackCommonConfig(options),
    {
      name: "server",

      target: "node",
      devtool: "source-map",

      entry: path.resolve(rootPath, "src", "index.ts"),

      output: {
        path: path.join(buildPath, "server"),
        library: { type: "commonjs" },
        filename: "server.js",
      },

      externals: [nodeExternals(), "@loadable/component"],

      node: {
        __dirname: false,
        __filename: false,
      },
    },
    customWebpackConfig
  );
};
