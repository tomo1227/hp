import { GalleryFavoritesTabs } from "@/components/features/galleryFavorites";
import { getFilteredPosts, getTags } from "@/lib/galleryFilter";

export default async function Page() {
  const galleries = await getFilteredPosts({
    dateOrder: "desc",
    locale: "en",
  });
  const tags = await getTags({ locale: "en" });
  const items = galleries.map((gallery) => ({
    slug: gallery.slug,
    title: gallery.frontmatter.title,
    image: `${gallery.frontmatter.galleryImage}`,
    tags: gallery.frontmatter.tags ?? [],
    locale: "en" as const,
  }));

  return <GalleryFavoritesTabs items={items} locale="en" tags={tags} />;
}
