import type { Metadata, ResolvingMetadata } from "next";
import { getFilteredPosts, getPostBySlug } from "../../../../../lib/blogFilter";
// import { formattedDate } from "../../../../lib/date";

export async function generateStaticParams() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
    category: "photography",
    articleType: "gallery",
  });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const slug = (await params).slug;
  const { frontmatter } = await getPostBySlug(slug, "ja");
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: frontmatter.title || (await parent).title,
    description: frontmatter.description || (await parent).description,
    openGraph: {
      images: frontmatter.ogpImage ? `${frontmatter.ogpImage}` : previousImages,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  // const { frontmatter } = await getPostBySlug(slug, "ja");
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
