import { Accordion } from "@/components/features/mdxComponents/accordion";
import { BlogImage } from "@/components/features/mdxComponents/blogImage";
import { BlogLink } from "@/components/features/mdxComponents/blogLink";
import { Note } from "@/components/features/mdxComponents/note";
import type { MDXComponents } from "mdx/types";
// import { ExternalOgp } from "./components/feature/blogs/mdxComponents/externalOgp";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 style={{ color: "red", fontSize: "48px" }}>{children}</h1>
    ),
    // BlogCard: BlogCard,
    Accordion: Accordion,
    BlogImage: BlogImage,
    BlogLink: BlogLink,
    Note: Note,
    ...components,
  };
}
