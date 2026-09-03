import SidebarMemberActions from "@/components/ui/sidebarMemberActions";
import { TableOfContents } from "@/components/features/tableOfContents";

const YOUTUBE_CHANNEL_ID = "UC5g2qhJQBZprZSp2rOgI05g";

const getLatestYouTubeVideoId = async (): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) return null;

    const xml = await response.text();
    const match = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);

    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

type SidebarRightProps = {
  locale: "ja" | "en";
  showToc?: boolean;
  showYouTube?: boolean;
};

const SidebarRight = async ({
  locale,
  showToc = false,
  showYouTube = false,
}: SidebarRightProps) => {
  const latestYouTubeVideoId = showYouTube
    ? await getLatestYouTubeVideoId()
    : null;

  return (
    <div className="sidebar-container sidebar-right">
      <div className="desktop-sidebar sidebar-right-inner">
        <ul className="sidebar-list sidebar-actions">
          <SidebarMemberActions locale={locale} />
        </ul>
        {showYouTube && latestYouTubeVideoId && (
          <div className="sidebar-youtube">
            <iframe
              src={`https://www.youtube.com/embed/${latestYouTubeVideoId}?feature=oembed`}
              title="YouTube video player"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}
        {showToc && <TableOfContents locale={locale} />}
      </div>
    </div>
  );
};

export default SidebarRight;
