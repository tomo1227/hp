import { BlogBookmarkList } from "@/components/features/blogBookmarks";
import { getFilteredPosts, getTags } from "@/lib/blogFilter";
import { formattedDate } from "@/lib/date";

export async function generateStaticParams() {
  const tags = await getTags({ locale: "en" });
  return tags.map((tag) => ({
    tag: tag,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const tag = decodeURIComponent((await params).tag);
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
    tag: tag,
  });
  const items = posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    date: post.frontmatter.date,
    displayDate: formattedDate(post.frontmatter.date),
    tags: post.frontmatter.tags,
    locale: "en" as const,
  }));
  return (
    <div className="blog-index">
      <h1 className="blog-index-title">{tag}</h1>
      <BlogBookmarkList items={items} locale="en" />
    </div>
  );
}
