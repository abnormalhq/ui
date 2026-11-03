import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is a file in out/, so a request never depends on Worker code or a runtime cache read.
  output: "export",
};

export default nextConfig;
