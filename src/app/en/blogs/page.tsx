import type { Metadata } from "next";
import { BlogBookmarkList } from "@/components/features/blogBookmarks";
import { getFilteredPosts } from "@/lib/blogFilter";
import { formattedDateEn } from "@/lib/date";

export const metadata: Metadata = {
  title: "Blog in tomokiota.com",
  description: "This is a blog about travel and camera by Tomoki Ota.",
  alternates: {
    canonical: "https://tomokiota.com/en/blogs",
  },
};

export default async function Page() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
  });
  const items = posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    date: post.frontmatter.date,
    displayDate: formattedDateEn(post.frontmatter.date),
    tags: post.frontmatter.tags,
    locale: "en" as const,
  }));
  return (
    <div className="blog-index">
      <h1 className="blog-index-title">Blog</h1>
      <BlogBookmarkList items={items} locale="en" />
    </div>
  );
}
