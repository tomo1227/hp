import Link from "next/link";
import { getTags as getBlogTags } from "@/lib/blogFilter";
import { getTags as getGalleryTags } from "@/lib/galleryFilter";
import { jaTranslate } from "@/lib/translator";

export default async function Page() {
  const blogTags = await getBlogTags();
  const galleryTags = await getGalleryTags();
  return (
    <div id="tag-lists-wrapper">
      <h1 id="tag-lists-title">タグ一覧</h1>
      <details className="tag-category">
        <summary className="tag-summary">ギャラリー</summary>
        <div id="tag-lists-contents">
          <ul id="tag-lists">
            {galleryTags.map((tag) => (
              <li key={tag}>
                <Link
                  className="tag-list-item"
                  href={`/ja/gallery/tags/${tag}`}
                >
                  {jaTranslate(tag)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <details className="tag-category">
        <summary className="tag-summary">ブログ</summary>
        <div id="tag-lists-contents">
          <ul id="tag-lists">
            {blogTags.map((tag) => (
              <li key={tag}>
                <Link className="tag-list-item" href={`/ja/tags/${tag}`}>
                  {jaTranslate(tag)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}
