import { GalleryFavoritesTabs } from "@/components/features/galleryFavorites";
import { getFilteredPosts, getTags } from "@/lib/galleryFilter";

export default async function Page() {
  const galleries = await getFilteredPosts({
    dateOrder: "desc",
    locale: "ja",
  });
  const tags = await getTags({ locale: "ja" });
  const items = galleries.map((gallery) => ({
    slug: gallery.slug,
    title: gallery.frontmatter.title,
    image: `${gallery.frontmatter.galleryImage}`,
    tags: gallery.frontmatter.tags ?? [],
    locale: "ja" as const,
  }));

  return <GalleryFavoritesTabs items={items} locale="ja" tags={tags} />;
}
