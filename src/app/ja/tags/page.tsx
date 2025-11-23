import Link from "next/link";
import { getTags } from "@/lib/blogFilter";
import { jaTranslate } from "@/lib/translator";

export default async function Page() {
  const tags = await getTags();
  return (
    <div id="tag-lists-wrapper">
      <h1 id="tag-lists-title">タグ一覧</h1>
      <div id="tag-lists-contents">
        <ul id="tag-lists">
          {tags.map((tag) => (
            <li key={tag}>
              <Link className="tag-list-item" href={`/ja/tags/${tag}`}>
                {jaTranslate(tag)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
