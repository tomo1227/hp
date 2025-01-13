import { formattedDate } from "@/lib/date";
import { getFilteredPosts } from "@/lib/galleryFilter";
import Link from "next/link";
import { Fragment } from "react";

export default async function Page() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
  });
  return (
    <article
      className="markdown flex flex-col justify-center items-center"
      style={{ position: "relative" }}
    >
      {posts.map((post) => (
        <Fragment key={post.slug}>
          <h1>{post.frontmatter.title}</h1>
          <Link href={`/ja/photography/gallery/${post.slug}`}>
            {formattedDate(post.frontmatter.date)}
          </Link>
        </Fragment>
      ))}
    </article>
  );
}
