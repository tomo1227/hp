import Link from "next/link";

const SidebarLeft = () => {
  return (
    <div className="sidebar-container">
      <div className="desktop-sidebar">
        <ul className="sidebar-list">
          <li>
            <Link href="/ja/calendar" passHref>
              カレンダー
            </Link>
          </li>
          <li>
            <Link href="/ja/gallery" passHref>
              ギャラリー
            </Link>
          </li>
        </ul>
      </div>

      {/* スマートフォン用カルーセル */}
      {/* <div className="mobile-sidebar">
        <Carousel showArrows={true} showThumbs={false} infiniteLoop>
          <div>ホーム</div>
          <div>サービス</div>
          <div>お問い合わせ</div>
          <div>プロフィール</div>
        </Carousel>
      </div> */}
    </div>
  );
};

export default SidebarLeft;
