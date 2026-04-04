import type { Metadata } from "next";
import { BlogBookmarkList } from "@/components/features/blogBookmarks";
import { getFilteredPosts } from "@/lib/blogFilter";
import { formattedDate } from "@/lib/date";

export const metadata: Metadata = {
  title: "Blog in tomokiota.com",
  description: "Tomoki Otaの旅行やカメラについてのブログ。",
  alternates: {
    canonical: "https://tomokiota.com/ja/blogs",
    languages: {
      ja: "https://tomokiota.com/ja/blogs",
      en: "https://tomokiota.com/en/blogs",
    },
  },
};

export default async function Page() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
  });
  const items = posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    date: post.frontmatter.date,
    displayDate: formattedDate(post.frontmatter.date),
    tags: post.frontmatter.tags,
    locale: "ja" as const,
  }));
  return (
    <div className="blog-index">
      <h1 className="blog-index-title">ブログ</h1>
      <BlogBookmarkList items={items} locale="ja" />
    </div>
  );
}
