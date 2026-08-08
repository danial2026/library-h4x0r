/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: process.env.BUILD_OUTPUT === "export" ? "export" : "standalone",
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;