import Link from "next/link";
import { getTags } from "@/lib/galleryFilter";

export default async function Page() {
  const tags = await getTags();
  return (
    <div id="tag-lists-wrapper">
      <h1 id="tag-lists-title">All Tags</h1>
      <div id="tag-lists-contents">
        <ul id="tag-lists">
          {tags.map((tag) => (
            <li key={tag}>
              <Link className="tag-list-item" href={`/en/gallery/tags/${tag}`}>
                {tag}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
