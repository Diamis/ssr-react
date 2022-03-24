import path from "path";
import webpack from "webpack";
import { BuildOption } from "lib";
import { mergeWithCustomize, customizeArray } from "webpack-merge";

import { webpackCommonConfig } from "./config.common";

const merge = mergeWithCustomize({
  customizeArray: customizeArray({ "entry.*": "replace" }),
});

export const webpackClientConfig = (options: BuildOption) => {
  const { isProduction, rootPath, buildPath, webpackConfig } = options;
  const entryPaths = [];

  entryPaths.push(path.resolve(rootPath, "src", "index"));
  if (!isProduction) {
    entryPaths.push("webpack-hot-middleware/client?reload=true");
  }

  const baseWebpackConfig = merge(
    webpackCommonConfig({ ...options, mode: "client" }),
    {
      name: "client",

      target: "web",
      devtool: "source-map",

      entry: entryPaths.filter(Boolean),

      output: {
        path: path.join(buildPath, "client"),
        publicPath: "/",
        filename: "static/js/build.[name].[contenthash].js",
      },

      plugins: [
        !isProduction && new webpack.HotModuleReplacementPlugin(),
      ].filter(Boolean),

      resolve: {
        fallback: {
          fs: false,
        },
      },
    }
  );

  if (typeof webpackConfig.client === "function") {
    return webpackConfig.client(baseWebpackConfig);
  }

  return merge(baseWebpackConfig, webpackConfig.client);
};
