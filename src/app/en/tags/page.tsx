import Link from "next/link";
import { getTags as getBlogTags } from "@/lib/blogFilter";
import { getTags as getGalleryTags } from "@/lib/galleryFilter";

export default async function Page() {
  const blogTags = await getBlogTags({ locale: "en" });
  const galleryTags = await getGalleryTags({ locale: "en" });
  return (
    <div id="tag-lists-wrapper">
      <h1 id="tag-lists-title">All Tags</h1>
      <details className="tag-category">
        <summary className="tag-summary">Gallery</summary>
        <div id="tag-lists-contents">
          <ul id="tag-lists">
            {galleryTags.map((tag) => (
              <li key={tag}>
                <Link
                  className="tag-list-item"
                  href={`/en/gallery/tags/${tag}`}
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>
      <details className="tag-category">
        <summary className="tag-summary">blog</summary>
        <div id="tag-lists-contents">
          <ul id="tag-lists">
            {blogTags.map((tag) => (
              <li key={tag}>
                <Link className="tag-list-item" href={`/en/tags/${tag}`}>
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}
