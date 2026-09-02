import type { MDXComponents } from "mdx/types";
import { Accordion } from "@/components/features/mdxComponents/accordion";
import { BlogCard } from "@/components/features/mdxComponents/blogCard";
import { BlogImage } from "@/components/features/mdxComponents/blogImage";
import { BlogLink } from "@/components/features/mdxComponents/blogLink";
import { Center } from "@/components/features/mdxComponents/center";
import { Pre } from "@/components/features/mdxComponents/codeBlock";
import { Note } from "@/components/features/mdxComponents/note";
import { Paid } from "@/components/features/mdxComponents/paid";
import { AnchorLink } from "@/components/features/mdxComponents/anchorLink";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: AnchorLink,
    Accordion: Accordion,
    BlogImage: BlogImage,
    BlogLink: BlogLink,
    BlogCard: BlogCard,
    Center: Center,
    Note: Note,
    Paid: Paid,
    pre: Pre,
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="table-wrapper">
        <table style={{ minWidth: "700px" }}>{children}</table>
      </div>
    ),
    ...components,
  };
}
