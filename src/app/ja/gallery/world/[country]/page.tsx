import Image from "next/image";
import Link from "next/link";
import { rgbDataURL } from "@/lib/blurImage";
import { getFilteredPosts, getTags } from "@/lib/galleryFilter";
import { jaTranslate } from "@/lib/translator";

export async function generateStaticParams() {
  const countries = await getTags();
  return countries.map((country) => ({
    country: country,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const country = decodeURIComponent((await params).country);
  const galleries = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
    country: country,
  });
  return (
    <div id="tag-lists-wrapper">
      <Link href={`/ja/gallery/world`}>
        <h1 id="tag-lists-title">{jaTranslate(country)}</h1>
      </Link>
      <section className="cards-container">
        {galleries.map((gallery) => (
          <Link
            className="card"
            key={gallery.slug}
            href={`/ja/gallery/${gallery.slug}`}
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
