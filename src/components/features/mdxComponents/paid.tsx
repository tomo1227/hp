import type { ReactNode } from "react";
import { PaidClient } from "@/components/features/mdxComponents/paidClient";

type Locale = "en" | "ja";

type PaidProps = {
  locale?: Locale;
  title?: string;
  description?: string;
  children?: ReactNode;
};

export const Paid = ({
  locale = "en",
  title,
  description,
  children,
}: PaidProps) => {
  return (
    <PaidClient locale={locale} title={title} description={description}>
      {children}
    </PaidClient>
  );
};
