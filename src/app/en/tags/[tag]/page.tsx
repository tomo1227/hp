import Link from "next/link";
import { getTags, getFilteredPosts } from "../../../../lib/blogFilter";
import { formattedDate } from "../../../../lib/date";
import { Fragment } from "react";


export async function generateStaticParams() {
  const tags = await getTags({locale: "en"});
  return tags.map((tag) => ({
    tag: tag,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const tag = (await params).tag;
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
    tag: tag
  });
  return (
    <div className="article-lists__wrapper">
      <h1>{tag}</h1>
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
