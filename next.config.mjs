import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.instagram.com",
        pathname: "/tomomon1227/**",
      },
      {
        protocol: "https",
        hostname: "tomokiota-photos.s3.ap-northeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "d9h1q21gc2t6n.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-frontmatter",
      "remark-mdx-frontmatter",
    ],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
