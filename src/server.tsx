import Koa from "koa";
import path from "path";
import React from "react";
import webpack from "webpack";
import koaBody from "koa-body";
import koaStatic from "koa-static";
import koaRouter from "koa-router";
import { BuildOption } from "types";
import { renderToString } from "react-dom/server";
import { ChunkExtractor } from "@loadable/server";
import { StaticRouter } from "react-router-dom/server";

import devMiddleware from "./middleware/dev-middleware";
import hotMiddleware from "./middleware/hot-middleware";

const startServer = (app: Koa, option: BuildOption) => {
  const router = new koaRouter();
  const { buildPath, port, host } = option;

  router.get("*", async (ctx, next) => {
    const serverExtractor = new ChunkExtractor({
      statsFile: path.resolve(buildPath, "server", "loadable-stats.json"),
    });
    const clientExtractor = new ChunkExtractor({
      statsFile: path.resolve(buildPath, "client", "loadable-stats.json"),
    });

    const res = serverExtractor.requireEntrypoint();
    const routerContext = {};

    const App = res.default;
    const view = (
      <StaticRouter location={ctx.url}>
        <App />
      </StaticRouter>
    );

    const jsx = clientExtractor.collectChunks(view);
    const appString = renderToString(jsx);
    const styles = clientExtractor.getStyleTags();
    const scripts = clientExtractor.getScriptTags();

    ctx.status = 200;
    ctx.body = appString;
  });

  app.use(koaBody());
  app.use(router.routes());
  app.listen(port, host);
};

export const startDevServer = (
  compiler: webpack.Compiler,
  option: BuildOption
) => {
  const app = new Koa();
  const devServer = devMiddleware(compiler, { serverSideRender: true });

  app.use(devServer);
  app.use(hotMiddleware(compiler));

  devServer.waitUntilValid(() => startServer(app, option));
};

export const startProdServer = (option: BuildOption) => {
  const app = new Koa();
  app.use(koaStatic(path.join(option.buildPath, "client", "static"), {}));
  startServer(app, option);
};
