import path from "path";
import webpack from "webpack";
import { CustomWebpackConfigProps } from "types";

// @ts-ignore
type MultiStats = webpack.compilation.MultiStats;
type Compiler = webpack.Compiler | webpack.MultiCompiler;

export function runCompiler(compiler: Compiler, watch = false) {
  return new Promise((resolve, reject) => {
    const cb = (error?: Error, stats?: MultiStats) => {
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
      compiler.watch({}, cb);
    } else {
      compiler.run(cb);
    }
  });
}

export function getCustomWebpackConfig({
  rootPath,
  configPath,
}: CustomWebpackConfigProps): Record<string, unknown> {
  let customWebpackConfig = {};
  if (configPath) {
    const webpackConfigPath = path.join(rootPath, configPath);
    customWebpackConfig = require(webpackConfigPath).default;
  }

  return customWebpackConfig;
}
