import type { ReactNode } from "react";
import { PaidClient } from "@/components/features/mdxComponents/paidClient";
import { hasActiveSubscription } from "@/lib/subscription";

type Locale = "en" | "ja";

type PaidProps = {
  locale?: Locale;
  title?: string;
  description?: string;
  children?: ReactNode;
};

export const Paid = async ({
  locale = "en",
  title,
  description,
  children,
}: PaidProps) => {
  const isSubscriber = await hasActiveSubscription();
  if (isSubscriber) {
    return <div className="paid-content">{children}</div>;
  }

  return (
    <PaidClient locale={locale} title={title} description={description}>
      {children}
    </PaidClient>
  );
};
