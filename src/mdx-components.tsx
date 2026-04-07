import type { MDXComponents } from "mdx/types";
import { Accordion } from "@/components/features/mdxComponents/accordion";
import { BlogCard } from "@/components/features/mdxComponents/blogCard";
import { BlogImage } from "@/components/features/mdxComponents/blogImage";
import { BlogLink } from "@/components/features/mdxComponents/blogLink";
import { Note } from "@/components/features/mdxComponents/note";
import { Paid } from "@/components/features/mdxComponents/paid";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Accordion: Accordion,
    BlogImage: BlogImage,
    BlogLink: BlogLink,
    BlogCard: BlogCard,
    Note: Note,
    Paid: Paid,
    ...components,
  };
}
