import type { NextConfig } from "next";

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const basePath =
  configuredBasePath === "/"
    ? ""
    : configuredBasePath.replace(/\/+$/, "");

if (basePath && !basePath.startsWith("/")) {
  throw new Error(
    "NEXT_PUBLIC_BASE_PATH harus kosong atau diawali dengan '/'.",
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
