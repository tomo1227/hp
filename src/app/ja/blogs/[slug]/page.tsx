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
  const { frontmatter } = await getPostBySlug(slug, "ja");
  const Component = require(`@/_posts/ja/${slug}.mdx`).default;
  const splitedTitle = parser.parse(frontmatter.title);
  return (
    <div>
      <div className={"flex flex-col mb-10 items-center"}>
        <h1 className="text-center leading-tight text-3xl mb-0 mt-6 pb-2 font-bold flex justify-center flex-wrap">
          {splitedTitle.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </h1>
        <ul className="flex flex-wrap gap-2 m-0 p-0 list-none">
          {frontmatter.tags.map((tag) => (
            <li key={tag} className="inline-block">
              <Link
                href={`/tags/${tag}`}
                className="relative inline-block h-7 leading-7 px-3 bg-sky-500 rounded-full text-white text-xs no-underline transition duration-200 hover:bg-gray-700"
              >
                {jaTranslate(tag)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="text-gray-500 dark:text-gray-400 text-sm max-md:text-xs pt-2">
          <time className="text-gray-600 dark:text-gray-300 text-base mr-1 italic">
            {formattedDate(frontmatter.date)}
          </time>
        </div>
      </div>
      <article
        className="markdown flex flex-col justify-center items-center"
        style={{ position: "relative" }}
      >
        <Component />
      </article>
    </div>
  );
}
