import Image from "next/image";
import Link from "next/link";
import { rgbDataURL } from "@/lib/blurImage";
import { getFilteredPosts, getTags } from "@/lib/galleryFilter";

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((tag) => ({
    tag: tag,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const tag = decodeURIComponent((await params).tag);
  const galleries = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
    tag: tag,
  });
  return (
    <div id="tag-lists-wrapper">
      <Link href={`/en/tags`}>
        <h1 id="tag-lists-title">{tag}</h1>
      </Link>
      <section className="cards-container">
        {galleries.map((gallery) => (
          <Link
            className="card"
            key={gallery.slug}
            href={`/en/gallery/${gallery.slug}`}
          >
            <Image
              src={`${gallery.frontmatter.galleryImage}`}
              alt={`${gallery.frontmatter.title}-img`}
              width={800}
              height={800}
              id={`${gallery.slug}-image`}
              className="aspect-square object-cover object-center w-full h-auto"
              placeholder="blur"
              blurDataURL={rgbDataURL(192, 192, 192)}
            />
            <div className="card-title">{gallery.frontmatter.title}</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
