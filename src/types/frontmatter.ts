import type Category from "@/types/category";

export type Frontmatter = {
  title: string;
  country?: string;
  category: Category;
  date: string;
  description: string;
  tags: string[];
  ogpImage?: URL;
  galleryImage?: URL;
};
