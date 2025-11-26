import Link from "next/link";

type SidebarLeftProps = {
  locale: "ja" | "en";
};

const SidebarLeft = ({ locale }: SidebarLeftProps) => {
  return (
    <div className="sidebar-container">
      <div className="desktop-sidebar">
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
            <Link href={`/${locale}/gallery/world/japan`} passHref>
              {locale === "ja" ? "日本地図" : "Japan Map"}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SidebarLeft;
