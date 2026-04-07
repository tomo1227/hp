import SidebarMemberActions from "@/components/ui/sidebarMemberActions";

type SidebarRightProps = {
  locale: "ja" | "en";
};

const SidebarRight = ({ locale }: SidebarRightProps) => {
  return (
    <div className="sidebar-container sidebar-right">
      <div className="desktop-sidebar">
        <ul className="sidebar-list sidebar-actions">
          <SidebarMemberActions locale={locale} />
        </ul>
      </div>
    </div>
  );
};

export default SidebarRight;
