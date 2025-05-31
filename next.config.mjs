import createMDX from "@next/mdx";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.instagram.com",
        port: "",
        pathname: "/tomomon1227/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "tomokiota-photos.s3.ap-northeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "d9h1q21gc2t6n.cloudfront.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /canvas/,
        contextRegExp: /commonjs$/,
      }),
    );
    return config;
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
    rehypePlugins: [rehypeSlug],
  },
});

export default withMDX(nextConfig);
