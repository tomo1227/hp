import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { BlogBookmarkButton } from "@/components/features/blogBookmarks";
import BlogShareButtons from "@/components/features/blogShareButtons";
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
  const canonicalUrl = `https://tomokiota.com/en/blogs/${slug}`;
  const alternateJaUrl = `https://tomokiota.com/ja/blogs/${slug}`;

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
        en: canonicalUrl,
        ja: alternateJaUrl,
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
  const { frontmatter } = await getPostBySlug(slug, "en");
  const year = await new Date(frontmatter.date).getUTCFullYear();
  const Component = require(`@/_posts/en/(${year})/${slug}.mdx`).default;
  const canonicalUrl = `https://tomokiota.com/en/blogs/${slug}`;
  const shareText = frontmatter.title || "tomokiota.com";

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
        <div className="blog-info-row">
          <div id="blog-date-wrapper">
            <time id="blog-date">{formattedDateEn(frontmatter.date)}</time>
          </div>
          <BlogBookmarkButton
            item={{
              slug,
              title: frontmatter.title,
              date: frontmatter.date,
              locale: "en",
            }}
            locale="en"
          />
        </div>
      </div>
      <article id="blog-content" className="markdown">
        <Component />
      </article>
      <div id="blog-footer">
        <section id="blog-share">
          <h2 className="blog-section-title">Share</h2>
          <BlogShareButtons url={canonicalUrl} title={shareText} locale="en" />
        </section>
      </div>
    </div>
  );
}
