import type { Metadata } from "next";
import { BlogBookmarkList } from "@/components/features/blogBookmarks";
import { getFilteredPosts, getTags } from "@/lib/blogFilter";
import { formattedDate } from "@/lib/date";
import { jaTranslate } from "@/lib/translator";

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((tag) => ({
    tag: tag,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const tag = decodeURIComponent((await params).tag);
  const encodedTag = encodeURIComponent(tag);
  const canonicalUrl = `https://tomokiota.com/ja/tags/${encodedTag}`;
  const alternateEnUrl = `https://tomokiota.com/en/tags/${encodedTag}`;

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ja: canonicalUrl,
        en: alternateEnUrl,
      },
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const tag = decodeURIComponent((await params).tag);
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
    tag: tag,
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
      <h1 className="blog-index-title">{jaTranslate(tag)}</h1>
      <BlogBookmarkList items={items} locale="ja" />
    </div>
  );
}
