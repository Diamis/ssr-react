import { Request, Response, NextFunction } from "express";

export default function crossDevMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.header("Access-Control-Allow-Origin", "*");
  return next();
}
