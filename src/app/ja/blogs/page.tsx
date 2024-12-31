import Link from "next/link";
import { Fragment } from "react";
import { getFilteredPosts } from "../../../lib/blogFilter";
import { formattedDate } from "../../../lib/date";

export default async function Page() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
  });
  return (
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
  );
}
