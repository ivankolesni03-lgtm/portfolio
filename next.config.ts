import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
};

export default withNextVideo(nextConfig, { folder: 'public/videos' });