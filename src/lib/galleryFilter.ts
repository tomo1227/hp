import fs from "node:fs";
import path, { join } from "node:path";
import type ArticleType from "@/types/articleType";
import type Category from "@/types/category";
import type { Frontmatter } from "@/types/frontmatter";
import type Locale from "@/types/locale";
import matter from "gray-matter";

const postDir = (locale: Locale = "ja") => {
  return join(process.cwd(), "src/_galleries/", locale);
};

type dateOrder = "desc" | "asc";

type PostFilterOptions = {
  dateOrder?: dateOrder;
  locale?: Locale;
  category?: Category;
  tag?: string;
  country?: string;
  articleType?: ArticleType;
};

type TagFilterOptions = {
  dateOrder?: dateOrder;
  locale?: Locale;
  category?: Category;
  country?: string;
  articleType?: ArticleType;
};

export const getFilteredPosts = async ({
  dateOrder = "desc",
  locale = "ja",
  category,
  tag,
  country,
  articleType,
}: PostFilterOptions = {}) => {
  const pathList = fs.readdirSync(postDir(locale));
  const contentsPromise = pathList.map(async (p) => {
    const fullPath = path.join(postDir(locale), p);
    const filePath = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(filePath);
    const slug = p.split(/\.mdx/)[0];

    return {
      frontmatter: data as Frontmatter,
      slug,
      content,
    };
  });
  const contents = await Promise.all(contentsPromise);

  const filteredContents = contents.filter(({ frontmatter }) => {
    const matchesTag = tag ? frontmatter.tags?.includes(tag) : true;
    const matchesCategory = category ? frontmatter.category === category : true;
    const matchesCountry = country ? frontmatter.country === country : true;
    const matchesArticleType = articleType
      ? frontmatter.articleType === articleType
      : true;
    return (
      matchesTag && matchesCategory && matchesCountry && matchesArticleType
    );
  });

  const sortedContents = filteredContents.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date);
    const dateB = new Date(b.frontmatter.date);

    return dateOrder === "asc"
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });

  return sortedContents;
};

export const getPostBySlug = async (slug: string, locale: Locale = "ja") => {
  const fullPath = path.join(postDir(locale), `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);
  return {
    frontmatter: data as Frontmatter,
  };
};

export const getTags = async ({
  dateOrder = "desc",
  locale = "ja",
  category,
  country,
  articleType,
}: TagFilterOptions = {}) => {
  const posts = await getFilteredPosts({
    dateOrder: dateOrder,
    locale: locale,
    category: category,
    country: country,
    articleType: articleType,
  });
  const tags = posts.flatMap((post) => post.frontmatter.tags || []);
  // 最後にアルファベット順に並べている
  const uniqueTags = [...new Set(tags.filter((tag) => tag))].sort((a, b) =>
    a.localeCompare(b),
  );

  return uniqueTags;
};
