import fs from "node:fs";
import path, { join } from "node:path";
import matter from "gray-matter";
import type Category from "@/types/category";
import type { Frontmatter } from "@/types/frontmatter";
import type Locale from "@/types/locale";

type dateOrder = "desc" | "asc";

type GalleryFilterOption = {
  dateOrder?: dateOrder;
  locale?: Locale;
  category?: Category;
  tag?: string;
  country?: string;
};

type TagFilterOptions = {
  dateOrder?: dateOrder;
  locale?: Locale;
  category?: Category;
  country?: string;
};

type CountryFilterOptions = {
  dateOrder?: dateOrder;
  locale?: Locale;
  category?: Category;
  tag?: string;
};

const galleryBaseDir = (locale: Locale = "ja") =>
  join(process.cwd(), "src/_galleries/", locale);

function getAllMdxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getAllMdxFiles(fullPath);
    }
    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      return fullPath;
    }
    return [];
  });
}

const getAllGalleries = async ({ locale = "ja" }: GalleryFilterOption = {}) => {
  const baseDir = galleryBaseDir(locale);
  const filePathList = getAllMdxFiles(baseDir);

  const contentsPromise = filePathList.map(async (fullPath) => {
    const file = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(file);
    const slug = path.basename(fullPath, ".mdx");

    return {
      frontmatter: data as Frontmatter,
      slug,
      content,
    };
  });
  const contents = await Promise.all(contentsPromise);
  return contents;
};
export const getFilteredPosts = async ({
  dateOrder = "desc",
  locale = "ja",
  category,
  tag,
  country,
}: GalleryFilterOption = {}) => {
  const contents = await getAllGalleries({ locale });

  const filteredContents = contents.filter(({ frontmatter }) => {
    const matchesTag = tag ? frontmatter.tags?.includes(tag) : true;
    const matchesCategory = category ? frontmatter.category === category : true;
    const matchesCountry = country ? frontmatter.country === country : true;
    return matchesTag && matchesCategory && matchesCountry;
  });

  const sortedContents = filteredContents.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime();
    const dateB = new Date(b.frontmatter.date).getTime();

    return dateOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return sortedContents;
};

export const getPostBySlug = async (slug: string, locale: Locale = "ja") => {
  const fullPath = searchMDfile(slug, locale);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);
  return {
    frontmatter: data as Frontmatter,
  };
};

const searchMDfile = (slug: string, locale: Locale = "ja") => {
  const baseDir = galleryBaseDir(locale);
  const categories = fs.readdirSync(baseDir);

  for (const category of categories) {
    const filePath = path.join(baseDir, category, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  throw new Error(`File not found: ${slug}.mdx in ${baseDir}`);
};

export const getTags = async ({
  dateOrder = "desc",
  locale = "ja",
  category,
  country,
}: TagFilterOptions = {}) => {
  const posts = await getFilteredPosts({
    dateOrder: dateOrder,
    locale: locale,
    category: category,
    country: country,
  });
  const tags = posts.flatMap((post) => post.frontmatter.tags || []);
  // 最後にアルファベット順に並べている
  const uniqueTags = [...new Set(tags.filter((tag) => tag))].sort((a, b) =>
    a.localeCompare(b),
  );

  return uniqueTags;
};

export const getCountries = async ({
  dateOrder = "desc",
  locale = "ja",
  category,
  tag,
}: CountryFilterOptions = {}) => {
  const posts = await getFilteredPosts({
    dateOrder: dateOrder,
    locale: locale,
    category: category,
    tag: tag,
  });
  const countries = posts.flatMap((post) =>
    post.frontmatter.country ? [post.frontmatter.country] : [],
  );
  // 最後にアルファベット順に並べている
  const uniqueCountries = [
    ...new Set(countries.filter((country) => country)),
  ].sort((a, b) => a.localeCompare(b));

  return uniqueCountries;
};
