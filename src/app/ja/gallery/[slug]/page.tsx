import { getFilteredPosts, getPostBySlug } from "@/lib/galleryFilter";
import { Parser, jaModel } from "budoux";
import type { Metadata, ResolvingMetadata } from "next";

export async function generateStaticParams() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
  });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

const parser = new Parser(jaModel);

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
  const previousOgpImages = (await parent).openGraph?.images || [];
  const previousTwitterImages = (await parent).twitter?.images || [];

  return {
    title: frontmatter.title || (await parent).title,
    description: frontmatter.description || (await parent).description,
    openGraph: {
      images: frontmatter.ogpImage
        ? `${frontmatter.ogpImage}`
        : previousOgpImages,
    },
    twitter: {
      images: frontmatter.ogpImage
        ? `${frontmatter.ogpImage}`
        : previousTwitterImages,
    },
    alternates: {
      canonical: "https://tomokiota.com/ja/gallery/${slug}",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const Component = require(`@/_galleries/ja/${slug}.mdx`).default;
  const { frontmatter } = await getPostBySlug(slug, "ja");
  const splittedTitle = parser.parse(frontmatter.title);
  return (
    <div id="gallery">
      <h1 id="gallery-title">
        {splittedTitle.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </h1>
      <article
        className="markdown flex flex-col justify-center items-center"
        style={{ position: "relative" }}
      >
        <Component />
      </article>
    </div>
  );
}
