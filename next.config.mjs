import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";

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
                pathname: "/travel/**",
            },
        ],
    },
};

const withMDX = createMDX({
    options: {
        remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [rehypeSlug],
    },
});

export default withMDX(nextConfig);
