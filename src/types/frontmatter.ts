import type Category from "@/types/category";

export type Frontmatter = {
  title: string;
  timezone: string;
  country?: string;
  region?: string;
  city?: string;
  category: Category;
  date: string;
  description: string;
  tags: string[];
  ogpImage?: URL;
  galleryImage?: URL;
  paid?: "none" | "partial" | "full";
};
