export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="gallery-layout">
      <div id="gallery-contents">{children}</div>
    </div>
  );
}
