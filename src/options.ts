import path from "path";
import { ConfigOption } from "types";

export const getOptions = (): ConfigOption => {
  const rootPath = process.cwd();
  const buildPath = path.join(rootPath, "dist");
  const isProduction = process.env.NODE_ENV === "production";

  return {
    rootPath,
    buildPath,
    isProduction,
  };
};
