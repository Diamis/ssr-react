import path from "path";
import webpack from "webpack";
import { WebpackOption } from "lib";
import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import LoadablePlugin from "@loadable/webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

export const webpackCommonConfig = (options: WebpackOption) => {
  const { isProduction, rootPath, mode } = options;
  const styleLoader = (isModule = false) => {
    return [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: !isProduction,
          reloadAll: true,
        },
      },
      {
        loader: "css-loader",
        options: {
          sourceMap: !isProduction,
          importLoaders: 2,
          modules: isModule && {
            localIdentName: "[name]_[local]_[contenthash:base64:5]",
          },
        },
      },
      {
        loader: "postcss-loader",
        options: {
          sourceMap: !isProduction,
          postcssOptions: { plugings: [postcssImport, autoprefixer] },
        },
      },
      {
        loader: "sass-loader",
      },
    ];
  };

  return {
    target: "web",
    context: rootPath,

    mode: isProduction ? "production" : "development",

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "@src/*": path.join(rootPath, "src"),
      },
    },

    optimization: {
      minimize: isProduction,
      minimizer: [new CssMinimizerPlugin()],
    },

    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                require("@babel/preset-env"),
                require("@babel/preset-react"),
                require("@babel/preset-typescript"),
              ],
              plugins: [
                require("@loadable/babel-plugin"),
                require("@babel/plugin-transform-runtime"),
              ],
            },
          },
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                memo: true,
                svgoConfig: { plugins: { removeViewBox: false } },
              },
            },
            {
              loader: "url-loader",
              options: {
                limit: 8192,
                publicPath: "/static/",
                outputPath: "static/",
                name: "images/[name].[contenthash].[ext]",
              },
            },
          ],
        },
        {
          test: /\.(jpe?g|png|webp)$/i,
          generator: {
            filename: "static/images/[name].[contenthash].[ext]",
          },
          use: {
            loader: "responsive-loader",
            options: { adapter: require("responsive-loader/sharp") },
          },
        },
        {
          test: /\.(eot|woff2|woff|ttf?)$/,
          generator: {
            filename: "static/fonts/[name].[contenthash].[ext]",
          },
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.s?css$/,
          use: styleLoader(false),
        },
        {
          test: /\.module\.s?css$/,
          use: styleLoader(true),
        },
      ],
    },

    plugins: [
      new webpack.DefinePlugin({
        isServer: mode === "server",
        isClient: mode === "client",
        isProduction,
      }),
      new MiniCssExtractPlugin({
        filename: "static/style/build.[name].[contenthash:4].css",
        chunkFilename: "static/style/build.chunk.[name].[contenthash:4].css",
      }),
      new LoadablePlugin({
        filename: "loadable-stats.json",
        writeToDisk: true,
      }),
    ].filter(Boolean),
  };
};
