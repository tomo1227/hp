import Link from "next/link";
import { Fragment } from "react";
import { getFilteredPosts } from "@/lib/blogFilter";
import { formattedDate } from "@/lib/date";

export default async function Page() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
    category: "travel",
  });
  return (
    <article
      className="markdown flex flex-col justify-center items-center"
      style={{ position: "relative" }}
    >
      {posts.map((post) => (
        <Fragment key={post.slug}>
          <h1>{post.frontmatter.title}</h1>
          <Link href={`/ja/blogs/${post.slug}`}>
            {formattedDate(post.frontmatter.date)}
          </Link>
        </Fragment>
      ))}
    </article>
  );
}
