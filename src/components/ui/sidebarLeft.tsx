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
        </ul>
      </div>
    </div>
  );
};

export default SidebarLeft;
