import { rgbDataURL } from "@/lib/blurImage";
import { getFilteredPosts } from "@/lib/galleryFilter";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  const posts = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
  });
  const portraitImageSize = 500; // 縦長
  const landscapeImageSize = 800; // 横長

  return (
    <section className="cards-container">
      {posts.map((post) => (
        <Link
          className="card"
          key={post.slug}
          href={`/ja/gallery/${post.slug}`}
        >
          <Image
            src={`${post.frontmatter.galleryImage}`}
            alt={`${post.frontmatter.title}-img`}
            width={800}
            height={800}
            id={`${post.slug}-image`}
            className="aspect-square object-cover object-center w-full h-auto"
            placeholder="blur"
            blurDataURL={rgbDataURL(192, 192, 192)}
          />
          <div className="card-title">{post.frontmatter.title}</div>
        </Link>
      ))}
    </section>
  );
}
