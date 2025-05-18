import fs from "node:fs";
import path, { join } from "node:path";
import type Category from "@/types/category";
import type { Frontmatter } from "@/types/frontmatter";
import type Locale from "@/types/locale";
import matter from "gray-matter";

const postDir = (locale: Locale = "ja") => {
  return join(process.cwd(), "src/_posts/", locale);
};

// export const getAllPosts = async () => {
//     const pathList = fs.readdirSync(postDir);
//     const contentsPromise = pathList.map(async (p) => {
//         const fullPath = path.join(postDir, p);
//         const fileContents = fs.readFileSync(fullPath, "utf8");
//         const { data, content } = matter(fileContents);
//         const slug = p.split(/\.mdx/)[0];

//         return {
//             data,
//             slug,
//             content,
//         };
//     });
//     const contents = await Promise.all(contentsPromise);

//     return contents;
// };

type dateOrder = "desc" | "asc";

type PostFilterOptions = {
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

export const getFilteredPosts = async ({
  dateOrder = "desc",
  locale = "ja",
  category,
  tag,
  country,
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

    return matchesTag && matchesCategory && matchesCountry;
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

// export const getPostsByPage = (page: number, pageSize = 10) => {
//     const posts = getPosts();
//     const startIndex = (page - 1) * pageSize;
//     const endIndex = page * pageSize;

//     return posts.slice(startIndex, endIndex);
// };

// export const getTotalPages = (pageSize = 10) => {
//     const posts = getPosts();
//     const maxPage = Math.ceil(posts.length / pageSize);

//     return maxPage;
// };

// export const getTags = () => {
//     const posts = getPosts();
//     const tags = posts.flatMap((post) => post.frontmatter.tags || []);
//     const uniqueTags = [...new Set(tags)];

//     return uniqueTags;
// };

// export const getPostByEntryName = (entryName: string) => {
//     const posts = getPosts();
//     const post = posts.find((post) => post.entryName === entryName);
//     return post;
// };

// export const getLatestPostsWithoutTargetPost = (postEntryName: string) => {
//     const posts = getPosts();
//     const latestPosts = posts.filter(
//         (post) => post.entryName !== postEntryName,
//     );
//     return latestPosts.slice(0, 3);
// };

// export const getPostsFilteredByTag = (tag: string) => {
//     const allPosts = getPosts();
//     return allPosts.filter((post) => post.frontmatter.tags.includes(tag));
// };

// export const getTotalPagesFilteredByTag = (pageSize = 10, tag: string) => {
//     const posts = getPostsFilteredByTag(tag);
//     const maxPage = Math.ceil(posts.length / pageSize);

//     return maxPage;
// };
