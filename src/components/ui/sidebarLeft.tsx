import Link from "next/link";
import Script from "next/script";

const INSTAGRAM_POST_URL = "https://www.instagram.com/p/DcvV1QNv_9K/";

type SidebarLeftProps = {
  locale: "ja" | "en";
};

const SidebarLeft = ({ locale }: SidebarLeftProps) => {
  return (
    <div className="sidebar-container sidebar-left">
      <div className="desktop-sidebar sidebar-left-inner">
        <ul className="sidebar-list">
          <li>
            <Link href={`/${locale}/calendar`} passHref>
              {locale === "ja" ? "カレンダー" : "Calendar"}
            </Link>
          </li>
          <li>
            <Link href={`/${locale}/gallery`} passHref>
              {locale === "ja" ? "ギャラリー" : "Gallery"}
            </Link>
          </li>
          <li>
            <Link href={`/${locale}/gallery/world`} passHref>
              {locale === "ja" ? "世界地図" : "World Map"}
            </Link>
          </li>
          <li>
            <Link href={`/${locale}/tags`} passHref>
              {locale === "ja" ? "タグ" : "Tags"}
            </Link>
          </li>
        </ul>
        <div className="sidebar-instagram">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={`${INSTAGRAM_POST_URL}?utm_source=ig_embed&utm_campaign=loading`}
            data-instgrm-version="14"
          >
            <a href={INSTAGRAM_POST_URL} target="_blank" rel="noreferrer">
              {locale === "ja"
                ? "この投稿をInstagramで見る"
                : "View this post on Instagram"}
            </a>
          </blockquote>
          <Script async src="https://www.instagram.com/embed.js" />
        </div>
      </div>
    </div>
  );
};

export default SidebarLeft;
