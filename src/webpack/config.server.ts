import path from "path";
import { BuildOption } from "types";
import { mergeWithCustomize, customizeArray } from "webpack-merge";
import nodeExternals from "webpack-node-externals";

import { webpackCommonConfig } from "./config.common";

const merge = mergeWithCustomize({
  customizeArray: customizeArray({ "entry.*": "replace" }),
});

export const webpackServerConfig = (options: BuildOption) => {
  const { rootPath, buildPath, webpackConfig } = options;

  return merge(
    webpackCommonConfig(options),
    {
      name: "server",

      target: "node",
      devtool: "source-map",

      entry: path.resolve(rootPath, "src", "app.tsx"),

      output: {
        path: path.join(buildPath, "server"),
        library: { type: "commonjs" },
        filename: "app.js",
      },

      externals: ["@loadable/component", nodeExternals()],

      node: {
        __dirname: false,
        __filename: false,
      },
    },
    webpackConfig.server
  );
};
