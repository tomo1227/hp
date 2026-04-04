import { jaModel, Parser } from "budoux";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { BlogBookmarkButton } from "@/components/features/blogBookmarks";
import BlogShareButtons from "@/components/features/blogShareButtons";
import { getFilteredPosts, getPostBySlug } from "@/lib/blogFilter";
import { formattedDate } from "@/lib/date";
import { jaTranslate } from "@/lib/translator";

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
  const canonicalUrl = `https://tomokiota.com/ja/blogs/${slug}`;
  const alternateEnUrl = `https://tomokiota.com/en/blogs/${slug}`;

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
      canonical: canonicalUrl,
      languages: {
        ja: canonicalUrl,
        en: alternateEnUrl,
      },
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
  const year = await new Date(frontmatter.date).getUTCFullYear();
  const Component = require(`@/_posts/ja/(${year})/${slug}.mdx`).default;
  const splittedTitle = parser.parse(frontmatter.title);
  const canonicalUrl = `https://tomokiota.com/ja/blogs/${slug}`;
  const shareText = frontmatter.title || "tomokiota.com";
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
        <div className="blog-info-row">
          <div id="blog-date-wrapper">
            <time id="blog-date">{formattedDate(frontmatter.date)}</time>
          </div>
          <BlogBookmarkButton
            item={{
              slug,
              title: frontmatter.title,
              date: frontmatter.date,
              locale: "ja",
            }}
            locale="ja"
          />
        </div>
      </div>
      <article id="blog-content" className="markdown">
        <Component />
      </article>
      <div id="blog-footer">
        <section id="blog-share">
          <h2 className="blog-section-title">シェア</h2>
          <BlogShareButtons url={canonicalUrl} title={shareText} locale="ja" />
        </section>
      </div>
    </div>
  );
}
