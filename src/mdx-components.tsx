import type { MDXComponents } from "mdx/types";
// import { ExternalOgp } from "./components/feature/blogs/mdxComponents/externalOgp";

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        h1: ({ children }) => (
            <h1 style={{ color: "red", fontSize: "48px" }}>{children}</h1>
        ),
        ...components,
    };
}
