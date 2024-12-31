import { getTags } from "@/lib/blogFilter";
import localFont from "next/font/local";
import Link from "next/link";

const rockSaltFont = localFont({
  display: "swap",
  src: "../../fonts/RockSalt-Regular.woff",
  weight: "400",
});

export default async function Page() {
  const tags = await getTags();
  return (
    <div id="tag-lists-wrapper">
      <h1 id="tag-lists-title" className={`${rockSaltFont.className}`}>All Tags</h1>
      <div id="tag-lists-contents">
        <ul id="tag-lists">
          {tags.map((tag) => (
            <li key={tag}>
              <Link className="tag-list-item"
                href={`/ja/tags/${tag}`}
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

