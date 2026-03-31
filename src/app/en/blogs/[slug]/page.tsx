import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { getFilteredPosts, getPostBySlug } from "@/lib/blogFilter";
import { formattedDateEn } from "@/lib/date";

export async function generateStaticParams() {
  const posts = await getFilteredPosts({ dateOrder: "desc", locale: "en" });
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
      canonical: `https://tomokiota.com/en/blogs/${slug}`,
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
  const Component = require(`@/_posts/en/(${year})/${slug}.mdx`).default;

  return (
    <div id="blog-wrapper">
      <div id="blog-info">
        <h1 id="blog-title">{frontmatter.title}</h1>
        <ul id="blog-tag-lists">
          {frontmatter.tags.map((tag) => (
            <li id="blog-tag" key={tag}>
              <Link id="blog-tag-link" href={`/en/tags/${tag}`}>
                {tag}
              </Link>
            </li>
          ))}
        </ul>
        <div id="blog-date-wrapper">
          <time id="blog-date">{formattedDateEn(frontmatter.date)}</time>
        </div>
      </div>
      <article id="blog-content" className="markdown">
        <Component />
      </article>
    </div>
  );
}
