import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/ja/gallery/*",
        "/en/gallery/*",
        "/ja/private/*",
        "/en/private/*",
        "/ja/menu",
        "/en/menu",
      ],
    },
    sitemap: "https://tomokiota.com/sitemap.xml",
  };
}
