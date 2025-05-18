import { Accordion } from "@/components/features/mdxComponents/accordion";
import { BlogCard } from "@/components/features/mdxComponents/blogCard";
import { BlogImage } from "@/components/features/mdxComponents/blogImage";
import { BlogLink } from "@/components/features/mdxComponents/blogLink";
import { Note } from "@/components/features/mdxComponents/note";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Accordion: Accordion,
    BlogImage: BlogImage,
    BlogLink: BlogLink,
    BlogCard: BlogCard,
    Note: Note,
    ...components,
  };
}
