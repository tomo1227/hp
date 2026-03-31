import type { MetadataRoute } from "next";
import { getFilteredPosts as getBlogPosts } from "@/lib/blogFilter";
import { getFilteredPosts as getGalleryPosts } from "@/lib/galleryFilter";

const BASE_URL = "https://tomokiota.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogJa, blogEn, galleryJa, galleryEn] = await Promise.all([
    getBlogPosts({ dateOrder: "desc", locale: "ja" }),
    getBlogPosts({ dateOrder: "desc", locale: "en" }),
    getGalleryPosts({ dateOrder: "desc", locale: "ja" }),
    getGalleryPosts({ dateOrder: "desc", locale: "en" }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/ja",
    "/en",
    "/ja/blogs",
    "/en/blogs",
    "/ja/gallery",
    "/en/gallery",
    "/ja/tags",
    "/en/tags",
    "/ja/calendar",
    "/en/calendar",
    "/ja/contact",
    "/en/contact",
    "/ja/travel",
    "/en/travel",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1.0 : 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogJa.map((post) => ({
    url: `${BASE_URL}/ja/blogs/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blogRoutesEn: MetadataRoute.Sitemap = blogEn.map((post) => ({
    url: `${BASE_URL}/en/blogs/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const galleryRoutes: MetadataRoute.Sitemap = galleryJa.map((post) => ({
    url: `${BASE_URL}/ja/gallery/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const galleryRoutesEn: MetadataRoute.Sitemap = galleryEn.map((post) => ({
    url: `${BASE_URL}/en/gallery/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...blogRoutesEn,
    ...galleryRoutes,
    ...galleryRoutesEn,
  ];
}
