import { redirect } from "next/navigation";
import { hasActiveSubscription } from "@/lib/subscription";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSubscriber = await hasActiveSubscription();
  if (!isSubscriber) {
    redirect("/ja/login");
  }

  return (
    <div id="gallery-layout">
      <div id="gallery-contents">{children}</div>
    </div>
  );
}
