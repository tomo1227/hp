import { getFilteredPosts, getPostBySlug } from "@/lib/blogFilter";
import { formattedDate } from "@/lib/date";
import { jaTranslate } from "@/lib/tagTranslator";
import { Parser, jaModel } from "budoux";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";

const parser = new Parser(jaModel);

export async function generateStaticParams() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
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
      canonical: "https://tomokiota.com/ja/blogs/${slug}",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const { frontmatter } = await getPostBySlug(slug, "ja");
  const Component = require(`@/_posts/ja/${slug}.mdx`).default;
  const splittedTitle = parser.parse(frontmatter.title);
  return (
    <div id="blog-wrapper">
      <div id="blog-info">
        <h1 id="blog-title">
          {splittedTitle.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </h1>
        <ul id="blog-tag-lists">
          {frontmatter.tags.map((tag) => (
            <li id="blog-tag" key={tag}>
              <Link id="blog-tag-link" href={`/ja/tags/${tag}`}>
                {jaTranslate(tag)}
              </Link>
            </li>
          ))}
        </ul>
        <div id="blog-date-wrapper">
          <time id="blog-date">{formattedDate(frontmatter.date)}</time>
        </div>
      </div>
      <article id="blog-content" className="markdown">
        <Component />
      </article>
    </div>
  );
}
