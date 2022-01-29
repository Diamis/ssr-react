import path from "path";
import webpack from "webpack";
import { BuildOption } from "types";
import { mergeWithCustomize, customizeArray } from "webpack-merge";

import { webpackCommonConfig } from "./config.common";

const merge = mergeWithCustomize({
  customizeArray: customizeArray({ "entry.*": "replace" }),
});

export const webpackClientConfig = (options: BuildOption) => {
  const { isProduction, rootPath, buildPath, webpackConfig } = options;
  const entryPaths = [];

  entryPaths.push(path.resolve(rootPath, "src", "index.ts"));
  if (!isProduction) {
    entryPaths.push("webpack-hot-middleware/client");
  }

  return merge(
    webpackCommonConfig(options),
    {
      name: "client",

      target: "web",
      devtool: "source-map",

      entry: entryPaths.filter(Boolean),

      output: {
        path: path.join(buildPath, "client"),
        publicPath: "/",
        filename: "static/js/build.[contenthash].js",
      },

      plugins: [!isProduction && new webpack.HotModuleReplacementPlugin()],

      resolve: {
        fallback: {
          fs: false,
        },
      },
    },
    webpackConfig.client
  );
};
