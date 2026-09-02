import { TableOfContents } from "@/components/features/tableOfContents";
import SidebarMemberActions from "@/components/ui/sidebarMemberActions";

type SidebarRightProps = {
  locale: "ja" | "en";
  showToc?: boolean;
};

const SidebarRight = ({ locale, showToc = false }: SidebarRightProps) => {
  return (
    <div className="sidebar-container sidebar-right">
      <div className="desktop-sidebar sidebar-right-inner">
        <ul className="sidebar-list sidebar-actions">
          <SidebarMemberActions locale={locale} />
        </ul>
        {showToc && <TableOfContents locale={locale} />}
      </div>
    </div>
  );
};

export default SidebarRight;
