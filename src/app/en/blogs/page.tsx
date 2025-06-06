import { getFilteredPosts } from "@/lib/blogFilter";
import { formattedDate } from "@/lib/date";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";

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
  return (
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
  );
}
