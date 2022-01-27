import path from "path";
import webpack from "webpack";
import { CustomWebpackConfigProps, CustomWebpackConfigResult } from "types";

type Compiler = webpack.Compiler | webpack.MultiCompiler;

export function runCompiler(compiler: Compiler, watch = false) {
  return new Promise((resolve, reject) => {
    const callback = (error?: any, stats?: any) => {
      if (stats) {
        compiler.close((closeError) => {
          if (closeError) {
            return reject(closeError);
          }
          resolve(stats);
        });
      } else {
        reject(error);
      }
    };

    if (watch) {
      compiler.watch({}, callback);
    } else {
      compiler.run(callback);
    }
  });
}

export function getCustomWebpackConfig({
  rootPath,
  configClient,
  configServer,
}: CustomWebpackConfigProps): CustomWebpackConfigResult {
  let client = {};
  let server = {};

  if (configClient) {
    const webpackConfigPath = path.join(rootPath, configClient);
    client = require(webpackConfigPath).default;
  }

  if (configServer) {
    const webpackConfigPath = path.join(rootPath, configServer);
    server = require(webpackConfigPath).default;
  }

  return { client, server };
}
