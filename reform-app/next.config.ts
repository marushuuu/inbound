import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  // 親リポジトリの lockfile に引きずられず、常にこのディレクトリを基点にする
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
