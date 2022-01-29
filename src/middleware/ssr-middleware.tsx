import { Request, Response } from "express";
import path from "path";
import React from "react";
import { BuildOption } from "types";
import { renderToString } from "react-dom/server";
import { ChunkExtractor } from "@loadable/server";
import { StaticRouter } from "react-router-dom/server";

type Html = {
  links: string;
  styles: string;
  scripts: string;
  content: string;
};

export default (option: BuildOption) => {
  const { buildPath } = option;
  const fileServer = path.resolve(buildPath, "server", "loadable-stats.json");
  const fileClient = path.resolve(buildPath, "client", "loadable-stats.json");

  return async (request: Request, response: Response) => {
    const serverExtractor = new ChunkExtractor({ statsFile: fileServer });
    const { default: App } = serverExtractor.requireEntrypoint();

    // @ts-ignore
    App.test();
    const clientExtractor = new ChunkExtractor({ statsFile: fileClient });
    const view = (
      <StaticRouter location={request.url}>
        <App />
      </StaticRouter>
    );

    const jsx = clientExtractor.collectChunks(view);

    const content = renderToString(jsx);

    const links = clientExtractor.getLinkTags();
    const styles = clientExtractor.getStyleTags();
    const scripts = clientExtractor.getScriptTags();

    const htmlString = HTMLString({ links, styles, scripts, content });

    response.set("content-type", "text/html");
    response.status(200).send(htmlString);
  };
};

const HTMLString = ({
  links,
  styles,
  scripts,
  content,
}: Html) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App</title>
    ${links}
    ${styles}
  </head>
  <body>
    <div id="root">${content}</div>
    ${scripts}
  </body>
</html>`;
