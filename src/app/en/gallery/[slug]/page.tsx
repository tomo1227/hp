import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { getFilteredPosts, getPostBySlug } from "@/lib/galleryFilter";

export async function generateStaticParams() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
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
  const { frontmatter } = await getPostBySlug(slug, "en");
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
      canonical: "https://tomokiota.com/en/gallery/${slug}",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const { frontmatter } = await getPostBySlug(slug, "en");
  const year = await new Date(frontmatter.date).getUTCFullYear();
  const Component = require(`@/_galleries/en/(${year})/${slug}.mdx`).default;

  return (
    <div id="gallery">
      <Link href={`/en/gallery/`}>
        <h1 id="gallery-title">{frontmatter.title}</h1>
      </Link>
      <article
        className="markdown flex flex-col justify-center items-center"
        style={{ position: "relative" }}
      >
        <Component />
      </article>
    </div>
  );
}
