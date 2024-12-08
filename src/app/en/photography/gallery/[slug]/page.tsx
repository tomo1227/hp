import { getFilteredPosts, getPostBySlug } from "../../../../../lib/blogFilter";
// import { formattedDate } from "../../../../lib/date";

export async function generateStaticParams() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
    category: "photography",
    articleType: "gallery",
  });
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
  const { frontmatter } = await getPostBySlug(slug, "en");
  const Component = require(`@/_posts/en/${slug}.mdx`).default;
  return (
    <article
      className="markdown flex flex-col justify-center items-center"
      style={{ position: "relative" }}
    >
      <Component />
    </article>
  );
}
