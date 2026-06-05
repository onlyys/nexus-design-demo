/** @type {import('next').NextConfig} */
const repo = "nexus-design-demo";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // GitHub Pages：静态导出到 out/
  output: "export",
  // 项目站点位于 https://onlyys.github.io/<repo>/ 子路径下
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  trailingSlash: true,
  images: {
    // 静态导出不支持 Next 图片优化
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

module.exports = nextConfig;
