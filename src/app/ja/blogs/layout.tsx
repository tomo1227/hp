import SidebarLeft from "@/components/ui/sidebarLeft";
import SidebarRight from "@/components/ui/sidebarRight";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="blog-layout">
      <SidebarLeft />
      <div id="main-blog-contents">{children}</div>
      <SidebarRight />
    </div>
  );
}
