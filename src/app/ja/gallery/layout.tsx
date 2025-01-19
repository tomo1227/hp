export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div id="gallery-layout">
      <div id="gallery-contents">{children}</div>
      <div>{modal}</div>
      <div id="modal-root" />
    </div>
  );
}
