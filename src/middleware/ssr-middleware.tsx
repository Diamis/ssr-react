import { Request, Response } from "express";
import path from "path";
import React from "react";
import { BuildOption } from "types";
import { renderToString } from "react-dom/server";
import { ChunkExtractor } from "@loadable/server";
import { StaticRouter } from "react-router-dom/server";

type Html = {
  styles: string;
  scripts: string;
  content: string;
};

export default (option: BuildOption) => {
  const { buildPath } = option;
  return async (request: Request, response: Response) => {
    const fileServer = path.resolve(buildPath, "server", "loadable-stats.json");
    const serverExtractor = new ChunkExtractor({ statsFile: fileServer });

    const fileClient = path.resolve(buildPath, "client", "loadable-stats.json");
    const clientExtractor = new ChunkExtractor({ statsFile: fileClient });

    const res = serverExtractor.requireEntrypoint();
    const RootApp = res.default;

    const view = (
      <StaticRouter location={request.url}>
        <RootApp />
      </StaticRouter>
    );

    const jsx = clientExtractor.collectChunks(view);

    const content = renderToString(jsx);
    const styles = clientExtractor.getStyleTags();
    const scripts = clientExtractor.getScriptTags();

    const htmlString = HTMLString({ styles, scripts, content });

    return response.status(200).send(htmlString);
  };
};

const HTMLString = ({ styles, scripts, content }: Html) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App</title>
    ${styles}
  </head>
  <body>
    <div id="root">${content}</div>
    ${scripts}
  </body>
</html>`;
