import path from "path";
import webpack from "webpack";
import { BuildOption } from "types";
import { mergeWithCustomize, customizeArray } from "webpack-merge";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import { webpackCommonConfig } from "./config.common";

export const webpackClientConfig = (options: BuildOption) => {
  const { isProduction, rootPath, buildPath, customWebpackConfig } = options;
  const entryPaths = [];

  entryPaths.push(path.resolve(rootPath, "src", "index.ts"));
  if (!isProduction) {
    entryPaths.push("webpack-hot-middleware/client");
  }

  return mergeWithCustomize({
    customizeArray: customizeArray({ "entry.*": "replace" }),
  })(
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

      plugins: [
        new MiniCssExtractPlugin({
          filename: "static/style/build.[name].[contenthash].css",
        }),
        !isProduction && new webpack.HotModuleReplacementPlugin(),
      ],

      resolve: {
        fallback: {
          fs: false,
        },
      },
    },
    customWebpackConfig.client
  );
};
