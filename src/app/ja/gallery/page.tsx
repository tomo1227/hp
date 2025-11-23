import Image from "next/image";
import Link from "next/link";
import { rgbDataURL } from "@/lib/blurImage";
import { getFilteredPosts } from "@/lib/galleryFilter";

export default async function Page() {
  const galleries = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
  });
  const portraitImageSize = 500; // 縦長
  const landscapeImageSize = 800; // 横長

  return (
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
  );
}
