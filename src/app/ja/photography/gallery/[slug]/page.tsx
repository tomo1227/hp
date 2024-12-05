import { getFilteredPosts, getPostBySlug } from "../../../../../lib/blogFilter";
// import { formattedDate } from "../../../../lib/date";

export async function generateStaticParams() {
  const posts = await getFilteredPosts("desc", "ja", "photography", "gallery");
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const { frontmatter } = await getPostBySlug(slug, "ja");
  const Component = require(`@/_posts/ja/${slug}.mdx`).default;
  return (
    <article
      className="markdown flex flex-col justify-center items-center"
      style={{ position: "relative" }}
    >
      <Component />
    </article>
  );
}
