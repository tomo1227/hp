import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/ja/private/", "/en/private/", "/admin/", "/api/"],
    },
    sitemap: "https://tomokiota.com/sitemap.xml",
  };
}
