import koa from "koa";
import webpack from "webpack";
import { PassThrough } from "stream";
import hotMiddleware, { MiddlewareOptions } from "webpack-hot-middleware";

export default (compiler: webpack.Compiler, options?: MiddlewareOptions) => {
  const expressMiddleware = hotMiddleware(compiler, options);
  return async (ctx: koa.Context, next: koa.Next) => {
    const stream = new PassThrough();
    ctx.body = stream;

    const res: any = {
      write: stream.write.bind(stream),
      writeHead: (status: any, headers: any) => {
        ctx.status = status;
        ctx.set(headers);
      },
    };

    await expressMiddleware(ctx.req, res, next);
  };
};
