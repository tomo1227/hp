export default function jaLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div>
      <div>{children}</div>
      <div>{modal}</div>
      <div id="modal-root" />
    </div>
  );
}
