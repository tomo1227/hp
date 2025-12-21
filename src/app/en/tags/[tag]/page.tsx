import Link from "next/link";
import { Fragment } from "react";
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
  return (
    <div className="article-lists-wrapper">
      <Link href={"/en/tags"}>
        <h1 id="tag-lists-title">{tag}</h1>
      </Link>
      <div className="article-lists">
        {posts.map((post) => (
          <Fragment key={post.slug}>
            <Link href={`/en/blogs/${post.slug}`}>
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
