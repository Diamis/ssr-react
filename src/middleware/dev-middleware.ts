import koa from "koa";
import webpack from "webpack";
import devMiddleware, {
  Options,
  IncomingMessage,
  ServerResponse,
} from "webpack-dev-middleware";

export default (
  compiler: webpack.Compiler,
  options?: Options<IncomingMessage, ServerResponse>
) => {
  const expressMiddleware = devMiddleware(compiler, options);

  async function middleware(ctx: koa.Context, next: koa.Next) {
    const res: any = {
      end: (content: any) => {
        ctx.body = content;
      },
      setHeader: (name: string, value: string) => {
        ctx.set(name, value);
      },
    };

    await expressMiddleware(ctx.req, res, next);
  }

  middleware.getFilenameFromUrl = expressMiddleware.getFilenameFromUrl;
  middleware.waitUntilValid = expressMiddleware.waitUntilValid;
  middleware.invalidate = expressMiddleware.invalidate;
  middleware.close = expressMiddleware.close;

  return middleware;
};
