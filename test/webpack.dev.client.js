import path from "path";

export default {
  entry: [
    "webpack-hot-middleware/client?reload=true",
    path.resolve(process.cwd(), "test", "index.tsx"),
  ],
};
