import { getFilteredPosts, getTags } from "@/lib/blogFilter";
import { formattedDate } from "@/lib/date";
import { jaTranslate } from "@/lib/tagTranslator";
import Link from "next/link";
import { Fragment } from "react";

export async function generateStaticParams() {
  const tags = await getTags();
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
    locale: "ja",
    tag: tag,
  });
  return (
    <div className="article-lists__wrapper">
      <h1>{jaTranslate(tag)}</h1>
      <div className="article-lists">
        {posts.map((post) => (
          <Fragment key={post.slug}>
            <Link href={`/ja/blogs/${post.slug}`}>
              <h2 className="article-lists-title">{post.frontmatter.title}</h2>
              <div className="article-lists-date">
                {formattedDate(post.frontmatter.date)}
              </div>
            </Link>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
