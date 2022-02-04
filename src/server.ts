import path from "path";
import chalk from "chalk";
import webpack from "webpack";
import bodyParser from "body-parser";
import express, { Express } from "express";
import devMiddleware from "webpack-dev-middleware";
import hotMiddleware from "webpack-hot-middleware";

import { BuildOption } from "types";
import { logMessage } from "./utils";
import middlewareRenderSSR from "./middleware/ssr-middleware";
import middlewareCrossDev from "./middleware/cross-dev-middleware";

export const startDevServer = (
  compiler: webpack.Compiler,
  option: BuildOption
) => {
  const app = express();
  const devServer = devMiddleware(compiler);

  app.use(devServer);
  app.use(hotMiddleware(compiler));
  app.use(middlewareCrossDev);

  devServer.waitUntilValid(() => startServer(app, option));
};

export const startProdServer = (option: BuildOption) => {
  const app = express();
  startServer(app, option);
};

const startServer = (app: Express, option: BuildOption) => {
  const { port, host } = option;

  const staticPath = path.join(option.buildPath, "client", "static");

  app.use("/favicon.ico", (req, res) => res.send("favicon"));
  app.use("/static", express.static(staticPath));

  app.use(bodyParser.urlencoded());
  app.use(bodyParser.json());

  app.get("*", middlewareRenderSSR(option));

  app.listen(port, host, () => {
    logMessage(`\nRunning on http://${host}:${port}/\n`, "true");
  });

  return app;
};
