import path from "path";
import webpack from "webpack";
import { ConfigOption } from "types";
import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import LoadablePlugin from "@loadable/webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

export const webpackCommonConfig = (options: ConfigOption) => {
  const { isProduction, rootPath } = options;
  const styleLoader = (isModule = false) => [
    MiniCssExtractPlugin.loader,
    {
      loader: "css-loader",
      options: {
        importLoaders: 2,
        modules: isModule && {
          localIdentName: "[name]_[local]_[contenthash:base64:5]",
        },
      },
    },
    {
      loader: "postcss-loader",
      options: { postcssOptions: { plugings: [postcssImport, autoprefixer] } },
    },
    {
      loader: "sass-loader",
    },
  ];

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
        "process.env": { NODE_ENV: JSON.stringify(process.env.NODE_ENV) },
        isProduction: JSON.stringify(isProduction),
      }),
      new LoadablePlugin({
        filename: "loadable-stats.json",
        writeToDisk: true,
      }),
    ].filter(Boolean),
  };
};
