"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

type Locale = "en" | "ja";

type MemberPortalProps = {
  locale?: Locale;
};

type PortalCustomer = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

type PortalSubscription = {
  id?: string | null;
  status?: string | null;
  cancel_at_period_end?: boolean;
  current_period_end?: number | null;
  items?: {
    data?: {
      price?: {
        unit_amount?: number | null;
        currency?: string | null;
      } | null;
      priceId?: string | null;
      nickname?: string | null;
      productName?: string | null;
    }[];
  } | null;
} | null;

type PortalInvoice = {
  id: string;
  number?: string | null;
  created?: number | null;
  amount_paid?: number | null;
  amount_due?: number | null;
  currency?: string | null;
  invoice_pdf?: string | null;
  hosted_invoice_url?: string | null;
};

type PortalPaymentMethod = {
  id: string;
  type: string;
  card?: {
    brand?: string | null;
    last4?: string | null;
    exp_month?: number | null;
    exp_year?: number | null;
    funding?: string | null;
    country?: string | null;
  } | null;
  billing_details?: PortalBillingDetails | null;
} | null;

type PortalAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type PortalBillingDetails = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: PortalAddress | null;
};

const copy = {
  en: {
    title: "Membership portal",
    billing: "Billing details",
    payment: "Payment method",
    invoices: "Invoices",
    cancel: "Cancel subscription",
    resume: "Resume subscription",
    update: "Update",
    updateCard: "Update card",
    nextPayment: "Next payment",
    amount: "Amount",
    status: "Status",
    plan: "Plan",
    edit: "Edit",
    cardSaved: "Card on file",
    noCard: "No card on file",
    year: "Year",
    all: "All",
  },
  ja: {
    title: "会員情報",
    billing: "請求先情報",
    payment: "支払い方法",
    invoices: "領収書一覧",
    cancel: "解約する",
    resume: "再開する",
    update: "更新",
    updateCard: "カード更新",
    nextPayment: "次回請求日",
    amount: "金額",
    status: "ステータス",
    plan: "プラン",
    edit: "編集",
    cardSaved: "登録済みのカード",
    noCard: "カード未登録",
    year: "年",
    all: "すべて",
  },
};

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = loadStripe(stripePublishableKey);

const formatDate = (value: number | null, locale: Locale) => {
  if (!value) return "-";
  return new Date(value * 1000).toLocaleDateString(
    locale === "ja" ? "ja-JP" : "en-US",
  );
};

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

const formatAmount = (amount: number | null, currency: string | null) => {
  if (!amount || !currency) return "-";
  const lower = currency.toLowerCase();
  const value = ZERO_DECIMAL_CURRENCIES.has(lower) ? amount : amount / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value);
};

const PortalPaymentForm = ({ locale }: { locale: Locale }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSaving(true);
    setMessage("");
    const result = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });
    if (result.error) {
      setMessage(result.error.message ?? "Failed to update card");
    } else {
      setMessage(locale === "ja" ? "更新しました" : "Updated successfully");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="portal-card-form">
      <PaymentElement />
      <button type="submit" disabled={saving || !stripe}>
        {saving ? "..." : locale === "ja" ? "更新" : "Update"}
      </button>
      {message && <p className="portal-hint">{message}</p>}
    </form>
  );
};

export const MemberPortal = ({ locale = "en" }: MemberPortalProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [customer, setCustomer] = useState<PortalCustomer | null>(null);
  const [subscription, setSubscription] = useState<PortalSubscription | null>(
    null,
  );
  const [subscriptions, setSubscriptions] = useState<PortalSubscription[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PortalPaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PortalPaymentMethod[]>(
    [],
  );
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<
    string | null
  >(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [invoiceAutoLoad, setInvoiceAutoLoad] = useState(false);
  const now = new Date();
  const [invoiceYear, setInvoiceYear] = useState<number | "all">(
    now.getFullYear(),
  );
  const [billingEdit, setBillingEdit] = useState(false);
  const [cardEdit, setCardEdit] = useState(false);
  const [billingMessage, setBillingMessage] = useState("");
  const [billingSaving, setBillingSaving] = useState(false);
  const [defaultSaving, setDefaultSaving] = useState("");
  const [removeSaving, setRemoveSaving] = useState("");
  const text = copy[locale] ?? copy.en;

  const fetchCustomer = useCallback(async (idToken: string) => {
    const response = await fetch("/api/stripe/portal/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
    const data = (await response.json()) as {
      customer?: PortalCustomer;
      error?: string;
    };
    if (!response.ok || !data.customer) {
      throw new Error(data.error || "Failed to load customer");
    }
    return data.customer;
  }, []);

  const fetchSubscriptions = useCallback(async (idToken: string) => {
    const response = await fetch("/api/stripe/portal/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
    const data = (await response.json()) as {
      subscription?: PortalSubscription | null;
      subscriptions?: PortalSubscription[];
      error?: string;
    };
    if (!response.ok) {
      throw new Error(data.error || "Failed to load subscriptions");
    }
    return {
      subscription: data.subscription ?? null,
      subscriptions: data.subscriptions ?? [],
    };
  }, []);

  const fetchPaymentMethods = useCallback(async (idToken: string) => {
    const response = await fetch("/api/stripe/portal/payment-methods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
    const data = (await response.json()) as {
      paymentMethod?: PortalPaymentMethod | null;
      paymentMethods?: PortalPaymentMethod[];
      defaultPaymentMethodId?: string | null;
      error?: string;
    };
    if (!response.ok) {
      throw new Error(data.error || "Failed to load payment methods");
    }
    return {
      paymentMethod: data.paymentMethod ?? null,
      paymentMethods: data.paymentMethods ?? [],
      defaultPaymentMethodId: data.defaultPaymentMethodId ?? null,
    };
  }, []);

  const fetchInvoices = useCallback(
    async (idToken: string, year: number | "all") => {
      const response = await fetch("/api/stripe/portal/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          year: year === "all" ? undefined : year,
        }),
      });
      const data = (await response.json()) as {
        invoices?: PortalInvoice[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to load invoices");
      }
      return data.invoices ?? [];
    },
    [],
  );

  useEffect(() => {
    configureAmplifyClient({ locale });
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (!stripePublishableKey) {
          throw new Error(
            locale === "ja"
              ? "Stripeの公開鍵が未設定です"
              : "Stripe publishable key is missing",
          );
        }
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString() ?? "";
        if (!idToken) {
          throw new Error(
            locale === "ja" ? "ログインが必要です" : "Sign in required",
          );
        }
        setToken(idToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
    const unsub = Hub.listen("auth", ({ payload }) => {
      if (
        payload.event === "signedIn" ||
        payload.event === "signedOut" ||
        payload.event === "tokenRefresh"
      ) {
        load();
      }
    });
    return () => {
      unsub();
    };
  }, [locale]);

  const loadCustomer = useCallback(async () => {
    if (!token) return;
    setCustomerLoading(true);
    setCustomerError("");
    try {
      const data = await fetchCustomer(token);
      setCustomer(data);
    } catch (err) {
      setCustomerError(err instanceof Error ? err.message : String(err));
    } finally {
      setCustomerLoading(false);
    }
  }, [fetchCustomer, token]);

  const loadSubscriptions = useCallback(async () => {
    if (!token) return;
    setSubscriptionLoading(true);
    setSubscriptionError("");
    try {
      const data = await fetchSubscriptions(token);
      setSubscription(data.subscription);
      setSubscriptions(data.subscriptions);
    } catch (err) {
      setSubscriptionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubscriptionLoading(false);
    }
  }, [fetchSubscriptions, token]);

  const loadPaymentMethods = useCallback(async () => {
    if (!token) return;
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const data = await fetchPaymentMethods(token);
      setPaymentMethod(data.paymentMethod);
      setPaymentMethods(data.paymentMethods);
      setDefaultPaymentMethodId(data.defaultPaymentMethodId);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : String(err));
    } finally {
      setPaymentLoading(false);
    }
  }, [fetchPaymentMethods, token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

    const run = async () => {
      await delay(120);
      if (cancelled) return;
      await loadSubscriptions();
      await delay(180);
      if (cancelled) return;
      await loadCustomer();
      await delay(180);
      if (cancelled) return;
      await loadPaymentMethods();
      await delay(180);
      if (cancelled) return;
      setInvoiceAutoLoad(true);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [loadCustomer, loadPaymentMethods, loadSubscriptions, token]);

  const handleLoadInvoices = useCallback(
    async (year: number | "all") => {
      if (!token) return;
      setInvoiceLoading(true);
      setInvoiceError("");
      try {
        const data = await fetchInvoices(token, year);
        setInvoices(data);
      } catch (err) {
        setInvoiceError(err instanceof Error ? err.message : String(err));
      } finally {
        setInvoiceLoading(false);
      }
    },
    [fetchInvoices, token],
  );

  const yearOptions = Array.from(
    { length: 6 },
    (_, index) => now.getFullYear() - index,
  );

  useEffect(() => {
    if (!invoiceAutoLoad || !token) return;
    handleLoadInvoices(invoiceYear);
  }, [handleLoadInvoices, invoiceAutoLoad, invoiceYear, token]);

  const handleSetupIntent = async () => {
    if (!token) return;
    setError("");
    const response = await fetch("/api/stripe/portal/setup-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = (await response.json()) as {
      clientSecret?: string;
      error?: string;
    };
    if (!response.ok || !data.clientSecret) {
      setError(data.error || "Failed to create setup intent");
      return;
    }
    setClientSecret(data.clientSecret);
  };

  const handleCancel = async (subscriptionId?: string | null) => {
    if (!token) return;
    setError("");
    const response = await fetch("/api/stripe/portal/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subscriptionId }),
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error || "Failed to cancel");
      return;
    }
    await loadSubscriptions();
  };

  const handleResume = async (
    subscriptionId?: string | null,
    priceId?: string | null,
  ) => {
    if (!token) return;
    setError("");
    const response = await fetch("/api/stripe/portal/resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ locale, subscriptionId, priceId }),
    });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok) {
      setError(data.error || "Failed to resume");
      return;
    }
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    await loadSubscriptions();
  };

  const [billingDraft, setBillingDraft] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  useEffect(() => {
    if (!customer) return;
    const address = customer.address ?? {};
    setBillingDraft({
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      line1: address.line1 ?? "",
      line2: address.line2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      postal_code: address.postal_code ?? "",
      country: address.country ?? "",
    });
  }, [customer]);

  const handleBillingUpdate = async () => {
    if (!token) return;
    setError("");
    setBillingMessage("");
    setBillingSaving(true);
    const response = await fetch("/api/stripe/portal/update-billing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: billingDraft.name,
        phone: billingDraft.phone,
        address: {
          line1: billingDraft.line1,
          line2: billingDraft.line2,
          city: billingDraft.city,
          state: billingDraft.state,
          postal_code: billingDraft.postal_code,
          country: billingDraft.country,
        },
      }),
    });
    const data = (await response.json()) as {
      error?: string;
      customer?: PortalCustomer;
    };
    if (!response.ok) {
      setError(data.error || "Failed to update billing");
      setBillingSaving(false);
      return;
    }
    if (data.customer) {
      setCustomer(data.customer);
    } else {
      await loadCustomer();
    }
    setBillingSaving(false);
    setBillingMessage(
      locale === "ja" ? "更新しました" : "Updated successfully",
    );
    setBillingEdit(false);
  };

  const handleMakeDefault = async (paymentMethodId: string) => {
    if (!token) return;
    setError("");
    setDefaultSaving(paymentMethodId);
    const response = await fetch("/api/stripe/portal/default-payment-method", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentMethodId }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || "Failed to update default payment method");
      setDefaultSaving("");
      return;
    }
    await loadPaymentMethods();
    setDefaultSaving("");
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (!token) return;
    const confirmText =
      locale === "ja" ? "このカードを削除しますか？" : "Remove this card?";
    if (!window.confirm(confirmText)) return;
    setError("");
    setRemoveSaving(paymentMethodId);
    const response = await fetch("/api/stripe/portal/remove-payment-method", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentMethodId }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || "Failed to remove payment method");
      setRemoveSaving("");
      return;
    }
    await loadPaymentMethods();
    setRemoveSaving("");
  };

  const renderBrandIcon = (brand?: string | null) => {
    const normalized = brand?.toLowerCase() ?? "";
    const iconClass = "portal-card-icon";
    if (normalized === "visa") {
      return (
        <svg className={iconClass} viewBox="0 -11 70 70" aria-hidden="true">
          <rect
            x="0.5"
            y="0.5"
            width="69"
            height="47"
            rx="5.5"
            fill="white"
            stroke="#D9D9D9"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.2505 32.5165H17.0099L13.8299 20.3847C13.679 19.8267 13.3585 19.3333 12.8871 19.1008C11.7106 18.5165 10.4142 18.0514 9 17.8169V17.3498H15.8313C16.7742 17.3498 17.4813 18.0514 17.5991 18.8663L19.2491 27.6173L23.4877 17.3498H27.6104L21.2505 32.5165ZM29.9675 32.5165H25.9626L29.2604 17.3498H33.2653L29.9675 32.5165ZM38.4467 21.5514C38.5646 20.7346 39.2717 20.2675 40.0967 20.2675C41.3931 20.1502 42.8052 20.3848 43.9838 20.9671L44.6909 17.7016C43.5123 17.2345 42.216 17 41.0395 17C37.1524 17 34.3239 19.1008 34.3239 22.0165C34.3239 24.2346 36.3274 25.3992 37.7417 26.1008C39.2717 26.8004 39.861 27.2675 39.7431 27.9671C39.7431 29.0165 38.5646 29.4836 37.3881 29.4836C35.9739 29.4836 34.5596 29.1338 33.2653 28.5494L32.5582 31.8169C33.9724 32.3992 35.5025 32.6338 36.9167 32.6338C41.2752 32.749 43.9838 30.6502 43.9838 27.5C43.9838 23.5329 38.4467 23.3004 38.4467 21.5514ZM58 32.5165L54.82 17.3498H51.4044C50.6972 17.3498 49.9901 17.8169 49.7544 18.5165L43.8659 32.5165H47.9887L48.8116 30.3004H53.8772L54.3486 32.5165H58ZM51.9936 21.4342L53.1701 27.1502H49.8723L51.9936 21.4342Z"
            fill="#172B85"
          />
        </svg>
      );
    }
    if (normalized === "mastercard") {
      return (
        <svg
          className={iconClass}
          viewBox="0 -54.25 482.51 482.51"
          aria-hidden="true"
        >
          <g>
            <path
              d="M220.13,421.67V396.82c0-9.53-5.8-15.74-15.32-15.74-5,0-10.35,1.66-14.08,7-2.9-4.56-7-7-13.25-7a14.07,14.07,0,0,0-12,5.8v-5h-7.87v39.76h7.87V398.89c0-7,4.14-10.35,9.94-10.35s9.11,3.73,9.11,10.35v22.78h7.87V398.89c0-7,4.14-10.35,9.94-10.35s9.11,3.73,9.11,10.35v22.78Zm129.22-39.35h-14.5v-12H327v12h-8.28v7H327V408c0,9.11,3.31,14.5,13.25,14.5A23.17,23.17,0,0,0,351,419.6l-2.49-7a13.63,13.63,0,0,1-7.46,2.07c-4.14,0-6.21-2.49-6.21-6.63V389h14.5v-6.63Zm73.72-1.24a12.39,12.39,0,0,0-10.77,5.8v-5h-7.87v39.76h7.87V399.31c0-6.63,3.31-10.77,8.7-10.77a24.24,24.24,0,0,1,5.38.83l2.49-7.46a28,28,0,0,0-5.8-.83Zm-111.41,4.14c-4.14-2.9-9.94-4.14-16.15-4.14-9.94,0-16.15,4.56-16.15,12.43,0,6.63,4.56,10.35,13.25,11.6l4.14.41c4.56.83,7.46,2.49,7.46,4.56,0,2.9-3.31,5-9.53,5a21.84,21.84,0,0,1-13.25-4.14l-4.14,6.21c5.8,4.14,12.84,5,17,5,11.6,0,17.81-5.38,17.81-12.84,0-7-5-10.35-13.67-11.6l-4.14-.41c-3.73-.41-7-1.66-7-4.14,0-2.9,3.31-5,7.87-5,5,0,9.94,2.07,12.43,3.31Zm120.11,16.57c0,12,7.87,20.71,20.71,20.71,5.8,0,9.94-1.24,14.08-4.56l-4.14-6.21a16.74,16.74,0,0,1-10.35,3.73c-7,0-12.43-5.38-12.43-13.25S445,389,452.07,389a16.74,16.74,0,0,1,10.35,3.73l4.14-6.21c-4.14-3.31-8.28-4.56-14.08-4.56-12.43-.83-20.71,7.87-20.71,19.88h0Zm-55.5-20.71c-11.6,0-19.47,8.28-19.47,20.71s8.28,20.71,20.29,20.71a25.33,25.33,0,0,0,16.15-5.38l-4.14-5.8a19.79,19.79,0,0,1-11.6,4.14c-5.38,0-11.18-3.31-12-10.35h29.41v-3.31c0-12.43-7.46-20.71-18.64-20.71h0Zm-.41,7.46c5.8,0,9.94,3.73,10.35,9.94H364.68c1.24-5.8,5-9.94,11.18-9.94ZM268.59,401.79V381.91h-7.87v5c-2.9-3.73-7-5.8-12.84-5.8-11.18,0-19.47,8.7-19.47,20.71s8.28,20.71,19.47,20.71c5.8,0,9.94-2.07,12.84-5.8v5h7.87V401.79Zm-31.89,0c0-7.46,4.56-13.25,12.43-13.25,7.46,0,12,5.8,12,13.25,0,7.87-5,13.25-12,13.25-7.87.41-12.43-5.8-12.43-13.25Zm306.08-20.71a12.39,12.39,0,0,0-10.77,5.8v-5h-7.87v39.76H532V399.31c0-6.63,3.31-10.77,8.7-10.77a24.24,24.24,0,0,1,5.38.83l2.49-7.46a28,28,0,0,0-5.8-.83Zm-30.65,20.71V381.91h-7.87v5c-2.9-3.73-7-5.8-12.84-5.8-11.18,0-19.47,8.7-19.47,20.71s8.28,20.71,19.47,20.71c5.8,0,9.94-2.07,12.84-5.8v5h7.87V401.79Zm-31.89,0c0-7.46,4.56-13.25,12.43-13.25,7.46,0,12,5.8,12,13.25,0,7.87-5,13.25-12,13.25-7.87.41-12.43-5.8-12.43-13.25Zm111.83,0V366.17h-7.87v20.71c-2.9-3.73-7-5.8-12.84-5.8-11.18,0-19.47,8.7-19.47,20.71s8.28,20.71,19.47,20.71c5.8,0,9.94-2.07,12.84-5.8v5h7.87V401.79Zm-31.89,0c0-7.46,4.56-13.25,12.43-13.25,7.46,0,12,5.8,12,13.25,0,7.87-5,13.25-12,13.25C564.73,415.46,560.17,409.25,560.17,401.79Z"
              transform="translate(-132.74 -48.5)"
            />
            <g>
              <rect
                x="169.81"
                y="31.89"
                width="143.72"
                height="234.42"
                fill="#ff5f00"
              />
              <path
                d="M317.05,197.6A149.5,149.5,0,0,1,373.79,80.39a149.1,149.1,0,1,0,0,234.42A149.5,149.5,0,0,1,317.05,197.6Z"
                transform="translate(-132.74 -48.5)"
                fill="#eb001b"
              />
              <path
                d="M615.26,197.6a148.95,148.95,0,0,1-241,117.21,149.43,149.43,0,0,0,0-234.42,148.95,148.95,0,0,1,241,117.21Z"
                transform="translate(-132.74 -48.5)"
                fill="#f79e1b"
              />
            </g>
          </g>
        </svg>
      );
    }
    if (normalized === "amex" || normalized === "american express") {
      return (
        <svg className={iconClass} viewBox="0 -140 780 780" aria-hidden="true">
          <path
            d="m40 1e-3h700c22.092 0 40 17.909 40 40v420c0 22.092-17.908 40-40 40h-700c-22.091 0-40-17.908-40-40v-420c0-22.091 17.909-40 40-40z"
            fill="#2557D6"
          />
          <path
            d="m0.253 235.69h37.441l8.442-19.51h18.9l8.42 19.51h73.668v-14.915l6.576 14.98h38.243l6.576-15.202v15.138h183.08l-0.085-32.026h3.542c2.479 0.083 3.204 0.302 3.204 4.226v27.8h94.689v-7.455c7.639 3.92 19.518 7.455 35.148 7.455h39.836l8.525-19.51h18.9l8.337 19.51h76.765v-18.532l11.626 18.532h61.515v-122.51h-60.88v14.468l-8.522-14.468h-62.471v14.468l-7.828-14.468h-84.38c-14.123 0-26.539 1.889-36.569 7.153v-7.153h-58.229v7.153c-6.383-5.426-15.079-7.153-24.75-7.153h-212.74l-14.274 31.641-14.659-31.641h-67.005v14.468l-7.362-14.468h-57.145l-26.539 58.246v64.261h3e-3zm236.34-17.67h-22.464l-0.083-68.794-31.775 68.793h-19.24l-31.858-68.854v68.854h-44.57l-8.42-19.592h-45.627l-8.505 19.592h-23.801l39.241-87.837h32.559l37.269 83.164v-83.164h35.766l28.678 59.587 26.344-59.587h36.485l1e-3 87.838zm-165.9-37.823l-14.998-35.017-14.915 35.017h29.913zm255.3 37.821h-73.203v-87.837h73.203v18.291h-51.289v15.833h50.06v18.005h-50.061v17.542h51.289l1e-3 18.166zm103.16-64.18c0 14.004-9.755 21.24-15.439 23.412 4.794 1.748 8.891 4.838 10.84 7.397 3.094 4.369 3.628 8.271 3.628 16.116v17.255h-22.104l-0.083-11.077c0-5.285 0.528-12.886-3.458-17.112-3.202-3.09-8.083-3.76-15.973-3.76h-23.523v31.95h-21.914v-87.838h50.401c11.199 0 19.451 0.283 26.535 4.207 6.933 3.924 11.09 9.652 11.09 19.45zm-27.699 13.042c-3.013 1.752-6.573 1.81-10.841 1.81h-26.62v-19.51h26.982c3.818 0 7.804 0.164 10.393 1.584 2.842 1.28 4.601 4.003 4.601 7.765 0 3.84-1.674 6.929-4.515 8.351zm62.844 51.138h-22.358v-87.837h22.358v87.837zm259.56 0h-31.053l-41.535-65.927v65.927h-44.628l-8.527-19.592h-45.521l-8.271 19.592h-25.648c-10.649 0-24.138-2.257-31.773-9.715-7.701-7.458-11.708-17.56-11.708-33.533 0-13.027 2.395-24.936 11.812-34.347 7.085-7.01 18.18-10.242 33.28-10.242h21.215v18.821h-20.771c-7.997 0-12.514 1.14-16.862 5.203-3.735 3.699-6.298 10.69-6.298 19.897 0 9.41 1.951 16.196 6.023 20.628 3.373 3.476 9.506 4.53 15.272 4.53h9.842l30.884-69.076h32.835l37.102 83.081v-83.08h33.366l38.519 61.174v-61.174h22.445v87.833zm-133.2-37.82l-15.165-35.017-15.081 35.017h30.246zm189.04 178.08c-5.322 7.457-15.694 11.238-29.736 11.238h-42.319v-18.84h42.147c4.181 0 7.106-0.527 8.868-2.175 1.665-1.474 2.605-3.554 2.591-5.729 0-2.561-1.064-4.593-2.677-5.811-1.59-1.342-3.904-1.95-7.722-1.95-20.574-0.67-46.244 0.608-46.244-27.194 0-12.742 8.443-26.156 31.439-26.156h43.649v-17.479h-40.557c-12.237 0-21.129 2.81-27.425 7.174v-7.175h-59.985c-9.595 0-20.854 2.279-26.179 7.175v-7.175h-107.12v7.175c-8.524-5.892-22.908-7.175-29.549-7.175h-70.656v7.175c-6.745-6.258-21.742-7.175-30.886-7.175h-79.077l-18.094 18.764-16.949-18.764h-118.13v122.59h115.9l18.646-19.062 17.565 19.062 71.442 0.061v-28.838h7.021c9.479 0.14 20.66-0.228 30.523-4.312v33.085h58.928v-31.952h2.842c3.628 0 3.985 0.144 3.985 3.615v28.333h179.01c11.364 0 23.244-2.786 29.824-7.845v7.845h56.78c11.815 0 23.354-1.587 32.134-5.649l2e-3 -22.84zm-354.94-47.155c0 24.406-19.005 29.445-38.159 29.445h-27.343v29.469h-42.591l-26.984-29.086-28.042 29.086h-86.802v-87.859h88.135l26.961 28.799 27.875-28.799h70.021c17.389 0 36.929 4.613 36.929 28.945zm-174.22 40.434h-53.878v-17.48h48.11v-17.926h-48.11v-15.974h54.939l23.969 25.604-25.03 25.776zm86.81 10.06l-33.644-35.789 33.644-34.65v70.439zm49.757-39.066h-28.318v-22.374h28.572c7.912 0 13.404 3.09 13.404 10.772 0 7.599-5.238 11.602-13.658 11.602zm148.36-40.373h73.138v18.17h-51.315v15.973h50.062v17.926h-50.062v17.48l51.314 0.08v18.23h-73.139l2e-3 -87.859zm-28.119 47.029c4.878 1.725 8.865 4.816 10.734 7.375 3.095 4.291 3.542 8.294 3.631 16.037v17.418h-22.002v-10.992c0-5.286 0.531-13.112-3.542-17.198-3.201-3.147-8.083-3.899-16.076-3.899h-23.42v32.09h-22.02v-87.859h50.594c11.093 0 19.173 0.47 26.366 4.146 6.915 4.004 11.266 9.487 11.266 19.511-1e-3 14.022-9.764 21.178-15.531 23.371zm-12.385-11.107c-2.932 1.667-6.556 1.811-10.818 1.811h-26.622v-19.732h26.982c3.902 0 7.807 0.08 10.458 1.587 2.84 1.423 4.538 4.146 4.538 7.903 0 3.758-1.699 6.786-4.538 8.431zm197.82 5.597c4.27 4.229 6.554 9.571 6.554 18.613 0 18.9-12.322 27.723-34.425 27.723h-42.68v-18.84h42.51c4.157 0 7.104-0.525 8.95-2.175 1.508-1.358 2.589-3.333 2.589-5.729 0-2.561-1.17-4.592-2.675-5.811-1.675-1.34-3.986-1.949-7.803-1.949-20.493-0.67-46.157 0.609-46.157-27.192 0-12.744 8.355-26.158 31.33-26.158h43.932v18.7h-40.198c-3.984 0-6.575 0.145-8.779 1.587-2.4 1.422-3.29 3.534-3.29 6.319 0 3.314 2.037 5.57 4.795 6.546 2.311 0.77 4.795 0.995 8.526 0.995l11.797 0.306c11.895 0.276 20.061 2.248 25.024 7.065zm86.955-23.52h-39.938c-3.986 0-6.638 0.144-8.867 1.587-2.312 1.423-3.202 3.534-3.202 6.322 0 3.314 1.951 5.568 4.791 6.544 2.312 0.771 4.795 0.996 8.444 0.996l11.878 0.304c11.983 0.284 19.982 2.258 24.86 7.072 0.891 0.67 1.422 1.422 2.033 2.175v-25h1e-3z"
            fill="#fff"
          />
        </svg>
      );
    }
    if (normalized === "jcb") {
      return (
        <svg className={iconClass} viewBox="0 0 750 471" aria-hidden="true">
          <g>
            <path
              fill="#FFFFFF"
              d="M617.242,346.766c0,41.615-33.729,75.36-75.357,75.36H132.759V124.245c0-41.626,33.73-75.371,75.364-75.371h409.12V346.766L617.242,346.766L617.242,346.766z"
            />
            <linearGradient
              id="path3496_1_"
              gradientUnits="userSpaceOnUse"
              x1="824.7424"
              y1="333.7813"
              x2="825.7424"
              y2="333.7813"
              gradientTransform="matrix(132.8743 0 0 -323.0226 -109129.5313 108054.6016)"
            >
              <stop offset="0" style={{ stopColor: "#007B40" }} />
              <stop offset="1" style={{ stopColor: "#55B330" }} />
            </linearGradient>
            <path
              fill="url(#path3496_1_)"
              d="M483.86,242.045c11.686,0.254,23.439-0.516,35.078,0.4c11.787,2.199,14.627,20.043,4.156,25.887c-7.145,3.85-15.633,1.434-23.379,2.113H483.86V242.045L483.86,242.045z M525.694,209.9c2.596,9.164-6.238,17.392-15.064,16.13h-26.77c0.188-8.642-0.367-18.022,0.273-26.209c10.723,0.302,21.547-0.616,32.209,0.48C520.922,201.452,524.756,205.218,525.694,209.9L525.694,209.9z M590.119,73.997c0.498,17.501,0.072,35.927,0.215,53.783c-0.033,72.596,0.07,145.195-0.057,217.789c-0.469,27.207-24.582,50.847-51.6,51.39c-27.045,0.11-54.094,0.017-81.143,0.047v-109.75c29.471-0.153,58.957,0.308,88.416-0.231c13.666-0.858,28.635-9.875,29.271-24.914c1.609-15.103-12.631-25.551-26.152-27.201c-5.197-0.135-5.045-1.515,0-2.117c12.895-2.787,23.021-16.133,19.227-29.499c-3.234-14.058-18.771-19.499-31.695-19.472c-26.352-0.179-52.709-0.025-79.063-0.077c0.17-20.489-0.355-41,0.283-61.474c2.088-26.716,26.807-48.748,53.447-48.27C537.555,73.998,563.838,73.998,590.119,73.997L590.119,73.997z"
            />
            <linearGradient
              id="path3498_1_"
              gradientUnits="userSpaceOnUse"
              x1="824.7551"
              y1="333.7822"
              x2="825.7484"
              y2="333.7822"
              gradientTransform="matrix(133.4307 0 0 -323.0203 -109887.6875 108053.8203)"
            >
              <stop offset="0" style={{ stopColor: "#1D2970" }} />
              <stop offset="1" style={{ stopColor: "#006DBA" }} />
            </linearGradient>
            <path
              fill="url(#path3498_1_)"
              d="M159.742,125.041c0.673-27.164,24.888-50.611,51.872-51.008c26.945-0.083,53.894-0.012,80.839-0.036c-0.074,90.885,0.146,181.776-0.111,272.657c-1.038,26.834-24.989,49.834-51.679,50.309c-26.996,0.098-53.995,0.014-80.992,0.041V283.551c26.223,6.195,53.722,8.832,80.474,4.723c15.991-2.574,33.487-10.426,38.901-27.016c3.984-14.191,1.741-29.126,2.334-43.691v-33.825h-46.297c-0.208,22.371,0.426,44.781-0.335,67.125c-1.248,13.734-14.849,22.46-27.802,21.994c-16.064,0.17-47.897-11.641-47.897-11.641C158.969,219.305,159.515,166.814,159.742,125.041L159.742,125.041z"
            />
            <linearGradient
              id="path3500_1_"
              gradientUnits="userSpaceOnUse"
              x1="824.7424"
              y1="333.7813"
              x2="825.741"
              y2="333.7813"
              gradientTransform="matrix(132.9583 0 0 -323.0276 -109347.9219 108056.2656)"
            >
              <stop offset="0" style={{ stopColor: "#6E2B2F" }} />
              <stop offset="1" style={{ stopColor: "#E30138" }} />
            </linearGradient>
            <path
              fill="url(#path3500_1_)"
              d="M309.721,197.39c-2.437,0.517-0.491-8.301-1.114-11.646c0.166-21.15-0.346-42.323,0.284-63.458c2.082-26.829,26.991-48.916,53.738-48.288h78.767c-0.074,90.885,0.145,181.775-0.111,272.657c-1.039,26.834-24.992,49.833-51.682,50.309c-26.998,0.101-53.998,0.015-80.997,0.042V272.707c18.44,15.129,43.5,17.484,66.472,17.525c17.318-0.006,34.535-2.676,51.353-6.67V260.79c-18.953,9.446-41.234,15.446-62.244,10.019c-14.656-3.649-25.294-17.813-25.057-32.937c-1.698-15.729,7.522-32.335,22.979-37.011c19.192-6.008,40.108-1.413,58.096,6.398c3.855,2.018,7.766,4.521,6.225-1.921v-17.899c-30.086-7.158-62.104-9.792-92.33-2.005C325.352,187.902,316.828,191.645,309.721,197.39L309.721,197.39z"
            />
          </g>
        </svg>
      );
    }
    if (normalized === "discover") {
      return (
        <svg className={iconClass} viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#E1E7EA"
            d="M45,35c0,2.2-1.8,4-4,4H7c-2.2,0-4-1.8-4-4V13c0-2.2,1.8-4,4-4h34c2.2,0,4,1.8,4,4V35z"
          />
          <path
            fill="#FF6D00"
            d="M45,35c0,2.2-1.8,4-4,4H16c0,0,23.6-3.8,29-15V35z M22,24c0,1.7,1.3,3,3,3s3-1.3,3-3c0-1.7-1.3-3-3-3S22,22.3,22,24z"
          />
          <path d="M11.2,21h1.1v6h-1.1V21z M17.2,24c0,1.7,1.3,3,3,3c0.5,0,0.9-0.1,1.4-0.3v-1.3c-0.4,0.4-0.8,0.6-1.4,0.6c-1.1,0-1.9-0.8-1.9-2c0-1.1,0.8-2,1.9-2c0.5,0,0.9,0.2,1.4,0.6v-1.3c-0.5-0.2-0.9-0.4-1.4-0.4C18.5,21,17.2,22.4,17.2,24z M30.6,24.9L29,21h-1.2l2.5,6h0.6l2.5-6h-1.2L30.6,24.9z M33.9,27h3.2v-1H35v-1.6h2v-1h-2V22h2.1v-1h-3.2V27z M41.5,22.8c0-1.1-0.7-1.8-2-1.8h-1.7v6h1.1v-2.4h0.1l1.6,2.4H42l-1.8-2.5C41,24.3,41.5,23.7,41.5,22.8z M39.2,23.8h-0.3v-1.8h0.3c0.7,0,1.1,0.3,1.1,0.9C40.3,23.4,40,23.8,39.2,23.8z M7.7,21H6v6h1.6c2.5,0,3.1-2.1,3.1-3C10.8,22.2,9.5,21,7.7,21z M7.4,26H7.1v-4h0.4c1.5,0,2.1,1,2.1,2C9.6,24.4,9.5,26,7.4,26z M15.3,23.3c-0.7-0.3-0.9-0.4-0.9-0.7c0-0.4,0.4-0.6,0.8-0.6c0.3,0,0.6,0.1,0.9,0.5l0.6-0.8C16.2,21.2,15.7,21,15,21c-1,0-1.8,0.7-1.8,1.7c0,0.8,0.4,1.2,1.4,1.6c0.6,0.2,1.1,0.4,1.1,0.9c0,0.5-0.4,0.8-0.9,0.8c-0.5,0-1-0.3-1.2-0.8l-0.7,0.7c0.5,0.8,1.1,1.1,2,1.1c1.2,0,2-0.8,2-1.9C16.9,24.2,16.5,23.8,15.3,23.3z" />
        </svg>
      );
    }
    return (
      <svg className={iconClass} viewBox="0 0 48 32" aria-hidden="true">
        <path d="M4 6h40a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      </svg>
    );
  };

  const subscriptionItems =
    subscriptions.length > 0
      ? subscriptions
      : subscription
        ? [subscription]
        : [];
  const validPaymentMethods = paymentMethods.filter(
    (method): method is Exclude<typeof method, null> => method !== null,
  );
  const defaultId = defaultPaymentMethodId ?? paymentMethod?.id ?? null;
  const fallbackDefault =
    paymentMethod ??
    validPaymentMethods.find((method) => method.id === defaultId) ??
    validPaymentMethods[0] ??
    null;
  const defaultCard = fallbackDefault?.card ?? null;
  const defaultBilling = fallbackDefault?.billing_details ?? null;
  const cardLine = defaultCard?.last4
    ? `${defaultCard.brand ?? "card"} •••• ${defaultCard.last4}`
    : null;
  const cardIssuer = defaultCard?.brand ?? null;
  const noAddressText = locale === "ja" ? "住所なし" : "No address";
  const formatAddress = (address: PortalAddress | null | undefined) => {
    if (!address) return noAddressText;
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
      address.country,
    ].filter((value) => value?.trim());
    return parts.length ? parts.join(", ") : noAddressText;
  };

  if (loading) {
    return (
      <div className="portal-loading" aria-busy="true">
        <span className="portal-spinner" aria-hidden="true" />
        <span>{locale === "ja" ? "読み込み中..." : "Loading..."}</span>
      </div>
    );
  }

  if (error) {
    const isAuthError =
      error === (locale === "ja" ? "ログインが必要です" : "Sign in required");
    if (isAuthError) {
      return (
        <div className="portal-shell">
          <div className="portal-card">
            <header className="portal-header">
              <div>
                <p className="portal-kicker">Membership</p>
                <h1 className="portal-title-text">
                  {locale === "ja" ? "ログインが必要です" : "Sign in required"}
                </h1>
              </div>
            </header>
            <p className="portal-hint">
              {locale === "ja"
                ? "会員情報の表示にはログインが必要です。"
                : "Please sign in to view your membership details."}
            </p>
            <div className="member-login-actions">
              <Link
                className="member-login-secondary"
                href={`/${locale}/sign-up`}
              >
                {locale === "ja" ? "新規登録" : "Sign up"}
              </Link>
              <Link className="member-login-primary" href={`/${locale}/login`}>
                {locale === "ja" ? "ログイン" : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return <p className="subscribe-error">{error}</p>;
  }

  return (
    <div className="portal-shell">
      <div className="portal-card">
        <header className="portal-header">
          <div>
            <p className="portal-kicker">Membership</p>
            <h1 className="portal-title-text">{text.title}</h1>
          </div>
        </header>

        <div className="portal-summary">
          {subscriptionError && (
            <p className="subscribe-error">{subscriptionError}</p>
          )}
          {subscriptionLoading && (
            <div className="portal-summary-card">
              <p className="portal-label">{text.status}</p>
              <p className="portal-value">...</p>
            </div>
          )}
          {!subscriptionLoading && subscriptionItems.length === 0 && (
            <div className="portal-summary-card">
              <p className="portal-label">{text.status}</p>
              <p className="portal-value">-</p>
            </div>
          )}
          {!subscriptionLoading &&
            subscriptionItems
              .filter((sub) => {
                const statusValue = sub?.status ?? "";
                return statusValue === "active" || statusValue === "canceled";
              })
              .map((sub, index) => {
                const statusValue = sub?.status ?? "-";
                const isActive = statusValue === "active";
                const isExpired = statusValue === "canceled";
                const isCanceling = Boolean(
                  isActive && sub?.cancel_at_period_end,
                );
                const actionLabel = isActive ? text.cancel : text.resume;
                const items = sub?.items?.data ?? [];
                const rows = items.length > 0 ? items : [null];
                const cancelDate = formatDate(
                  sub?.current_period_end ?? null,
                  locale,
                );
                const statusText = isCanceling
                  ? locale === "ja"
                    ? `${statusValue}(${cancelDate}でキャンセル)`
                    : `${statusValue} (cancels on ${cancelDate})`
                  : statusValue;
                return (
                  <div
                    key={
                      sub?.id ??
                      `sub-${sub?.items?.data?.[0]?.priceId ?? "unknown"}`
                    }
                    className="portal-summary-card portal-plan-card"
                  >
                    {rows.map((item, itemIndex) => {
                      const planName =
                        item?.productName ??
                        item?.nickname ??
                        item?.priceId ??
                        "-";
                      return (
                        <div
                          key={`${sub?.id ?? "sub"}-${item?.priceId ?? itemIndex}`}
                          className="portal-plan-row"
                        >
                          <div className="portal-plan-col">
                            <p className="portal-label">{text.plan}</p>
                            <p className="portal-value">{planName}</p>
                          </div>
                          <div className="portal-plan-col">
                            <p className="portal-label">{text.status}</p>
                            <p
                              className={`portal-value ${
                                isActive ? "status-good" : "status-bad"
                              }`}
                            >
                              {statusText}
                            </p>
                          </div>
                          {!isCanceling && (
                            <div className="portal-plan-col">
                              <p className="portal-label">{text.nextPayment}</p>
                              <p className="portal-value">
                                {formatDate(
                                  sub?.current_period_end ?? null,
                                  locale,
                                )}
                              </p>
                            </div>
                          )}
                          <div className="portal-plan-col">
                            <p className="portal-label">{text.amount}</p>
                            <p className="portal-value">
                              {formatAmount(
                                item?.price?.unit_amount ?? null,
                                item?.price?.currency ?? null,
                              )}
                            </p>
                          </div>
                          <div className="portal-plan-action">
                            {isActive && (
                              <button
                                type="button"
                                className="portal-default-btn is-danger"
                                onClick={() => handleCancel(sub?.id ?? null)}
                              >
                                {actionLabel}
                              </button>
                            )}
                            {isExpired && (
                              <button
                                type="button"
                                className="portal-default-btn"
                                onClick={() =>
                                  handleResume(
                                    sub?.id ?? null,
                                    item?.priceId ?? null,
                                  )
                                }
                              >
                                {actionLabel}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
        </div>

        <div className="portal-grid-layout">
          <section className="portal-section">
            <div className="portal-section-header">
              <h2>{text.billing}</h2>
              <button
                type="button"
                className="portal-edit"
                onClick={() => setBillingEdit((prev) => !prev)}
              >
                {text.edit}
              </button>
            </div>
            {customerError && (
              <p className="subscribe-error">{customerError}</p>
            )}
            {!billingEdit ? (
              <div className="portal-readonly">
                {customerLoading && <p className="portal-hint">...</p>}
                <div className="portal-row">
                  <span>{locale === "ja" ? "氏名" : "Name"}</span>
                  <span>{billingDraft.name || "-"}</span>
                </div>
                <div className="portal-row">
                  <span>{locale === "ja" ? "電話" : "Phone"}</span>
                  <span>{billingDraft.phone || "-"}</span>
                </div>
                <div className="portal-row">
                  <span>{locale === "ja" ? "住所1" : "Address line 1"}</span>
                  <span>{billingDraft.line1 || "-"}</span>
                </div>
                <div className="portal-row">
                  <span>{locale === "ja" ? "住所2" : "Address line 2"}</span>
                  <span>{billingDraft.line2 || "-"}</span>
                </div>
                <div className="portal-row">
                  <span>{locale === "ja" ? "市" : "City"}</span>
                  <span>{billingDraft.city || "-"}</span>
                </div>
                <div className="portal-row">
                  <span>{locale === "ja" ? "州" : "State"}</span>
                  <span>{billingDraft.state || "-"}</span>
                </div>
                <div className="portal-row">
                  <span>{locale === "ja" ? "郵便番号" : "Postal code"}</span>
                  <span>{billingDraft.postal_code || "-"}</span>
                </div>
                <div className="portal-row">
                  <span>{locale === "ja" ? "国" : "Country"}</span>
                  <span>{billingDraft.country || "-"}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="portal-grid">
                  <label className="portal-field">
                    <span>{locale === "ja" ? "氏名" : "Name"}</span>
                    <input
                      className="portal-input"
                      placeholder={
                        locale === "ja" ? "山田 太郎" : "Yamada Taro"
                      }
                      value={billingDraft.name}
                      onChange={(event) =>
                        setBillingDraft((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="portal-field">
                    <span>{locale === "ja" ? "電話番号" : "Phone"}</span>
                    <input
                      className="portal-input"
                      placeholder={
                        locale === "ja" ? "080-1234-5678" : "080-1234-5678"
                      }
                      value={billingDraft.phone}
                      onChange={(event) =>
                        setBillingDraft((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="portal-field">
                    <span>{locale === "ja" ? "住所1" : "Address line 1"}</span>
                    <input
                      className="portal-input"
                      placeholder={locale === "ja" ? "住所1" : "Address line 1"}
                      value={billingDraft.line1}
                      onChange={(event) =>
                        setBillingDraft((prev) => ({
                          ...prev,
                          line1: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="portal-field">
                    <span>{locale === "ja" ? "住所2" : "Address line 2"}</span>
                    <input
                      className="portal-input"
                      placeholder={locale === "ja" ? "住所2" : "Address line 2"}
                      value={billingDraft.line2}
                      onChange={(event) =>
                        setBillingDraft((prev) => ({
                          ...prev,
                          line2: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="portal-field">
                    <span>{locale === "ja" ? "市" : "City"}</span>
                    <input
                      className="portal-input"
                      placeholder={locale === "ja" ? "大阪市" : "Osaka"}
                      value={billingDraft.city}
                      onChange={(event) =>
                        setBillingDraft((prev) => ({
                          ...prev,
                          city: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="portal-field">
                    <span>{locale === "ja" ? "都道府県" : "State"}</span>
                    <input
                      className="portal-input"
                      placeholder={locale === "ja" ? "大阪府" : "Osaka"}
                      value={billingDraft.state}
                      onChange={(event) =>
                        setBillingDraft((prev) => ({
                          ...prev,
                          state: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="portal-field">
                    <span>{locale === "ja" ? "郵便番号" : "Postal code"}</span>
                    <input
                      className="portal-input"
                      placeholder={locale === "ja" ? "123-4567" : "123-4567"}
                      value={billingDraft.postal_code}
                      onChange={(event) =>
                        setBillingDraft((prev) => ({
                          ...prev,
                          postal_code: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="portal-field">
                    <span>{locale === "ja" ? "国" : "Country"}</span>
                    <input
                      className="portal-input"
                      placeholder={locale === "ja" ? "日本" : "Japan"}
                      value={billingDraft.country}
                      onChange={(event) =>
                        setBillingDraft((prev) => ({
                          ...prev,
                          country: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                <div className="portal-actions-row">
                  <button
                    type="button"
                    className="portal-save"
                    onClick={handleBillingUpdate}
                    disabled={billingSaving}
                  >
                    {billingSaving ? "..." : text.update}
                  </button>
                  {billingMessage && (
                    <span className="portal-hint">{billingMessage}</span>
                  )}
                </div>
              </>
            )}
          </section>

          <section className="portal-section">
            <div className="portal-section-header">
              <h2>{text.payment}</h2>
              <div className="portal-section-actions">
                <button
                  type="button"
                  className="portal-default-btn"
                  onClick={() => {
                    setCardEdit(true);
                    if (!clientSecret) {
                      handleSetupIntent();
                    }
                  }}
                >
                  {locale === "ja" ? "カード追加" : "Add card"}
                </button>
              </div>
            </div>
            {paymentError && <p className="subscribe-error">{paymentError}</p>}
            {!cardEdit && (
              <div className="portal-card-summary">
                {paymentLoading ? (
                  <p className="portal-hint">...</p>
                ) : cardLine ? (
                  <div className="portal-card-details">
                    <div className="portal-row">
                      <span>{locale === "ja" ? "氏名" : "Name"}</span>
                      <span>{defaultBilling?.name || "-"}</span>
                    </div>
                    <div className="portal-row">
                      <span>{locale === "ja" ? "タイプ" : "Type"}</span>
                      <span className="portal-card-number">
                        {renderBrandIcon(defaultCard?.brand)}
                      </span>
                    </div>
                    <div className="portal-row">
                      <span>
                        {locale === "ja" ? "カード番号" : "Card number"}
                      </span>
                      <span className="portal-card-number">
                        {` •••• ${defaultCard?.last4 ?? "-"}`}
                      </span>
                    </div>
                    <div className="portal-row">
                      <span>{locale === "ja" ? "有効期限" : "Expiry"}</span>
                      <span>
                        {defaultCard?.exp_month ?? "-"} /{" "}
                        {defaultCard?.exp_year ?? "-"}
                      </span>
                    </div>
                    <div className="portal-row">
                      <span>
                        {locale === "ja" ? "カード発行会社" : "Issuer"}
                      </span>
                      <span>{cardIssuer || "-"}</span>
                    </div>
                    <div className="portal-row">
                      <span>
                        {locale === "ja" ? "請求先住所" : "Billing address"}
                      </span>
                      <span>
                        {formatAddress(defaultBilling?.address ?? null)}
                      </span>
                    </div>
                    <div className="portal-row">
                      <span>{locale === "ja" ? "電話番号" : "Phone"}</span>
                      <span>{defaultBilling?.phone || "-"}</span>
                    </div>
                    <div className="portal-row">
                      <span>
                        {locale === "ja" ? "メールアドレス" : "Email"}
                      </span>
                      <span>
                        {defaultBilling?.email || customer?.email || "-"}
                      </span>
                    </div>
                    <div className="portal-row">
                      <span>
                        {locale === "ja" ? "カードの発行元" : "Card country"}
                      </span>
                      <span>{defaultCard?.country || "-"}</span>
                    </div>
                    <div className="portal-card-actions">
                      <button
                        type="button"
                        className="portal-default-btn is-danger"
                        onClick={() =>
                          fallbackDefault?.id
                            ? handleRemovePaymentMethod(fallbackDefault.id)
                            : null
                        }
                        disabled={
                          !fallbackDefault?.id ||
                          removeSaving === fallbackDefault.id
                        }
                      >
                        {removeSaving === fallbackDefault?.id
                          ? "..."
                          : locale === "ja"
                            ? "削除"
                            : "Remove"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="portal-hint">{text.noCard}</span>
                )}
              </div>
            )}
            {cardEdit && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret, appearance: { theme: "stripe" } }}
              >
                <PortalPaymentForm locale={locale} />
              </Elements>
            )}
          </section>
        </div>

        {validPaymentMethods.length > 1 && (
          <section className="portal-section">
            <h2>{locale === "ja" ? "その他のカード" : "Other cards"}</h2>
            <div className="portal-invoices">
              {validPaymentMethods
                .filter((method) => method.id !== defaultId)
                .map((method) => (
                  <div key={method.id} className="portal-invoice">
                    <div>
                      <p className="portal-value portal-card-number">
                        {renderBrandIcon(method.card?.brand)}
                        <span>•••• {method.card?.last4 ?? "-"}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="portal-default-btn is-danger"
                      onClick={() => handleRemovePaymentMethod(method.id)}
                      disabled={removeSaving === method.id}
                    >
                      {removeSaving === method.id
                        ? "..."
                        : locale === "ja"
                          ? "削除"
                          : "Remove"}
                    </button>
                    <button
                      type="button"
                      className="portal-default-btn"
                      onClick={() => handleMakeDefault(method.id)}
                      disabled={defaultSaving === method.id}
                    >
                      {defaultSaving === method.id
                        ? "..."
                        : locale === "ja"
                          ? "デフォルトにする"
                          : "Make default"}
                    </button>
                  </div>
                ))}
            </div>
          </section>
        )}

        {subscriptionItems.some(
          (sub) => sub?.status === "active" || sub?.status === "canceled",
        ) && (
          <section className="portal-section">
            <div className="portal-section-header">
              <h2>{text.invoices}</h2>
              <div className="portal-section-actions">
                <select
                  className="portal-input"
                  aria-label={text.year}
                  value={String(invoiceYear)}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "all") {
                      setInvoiceYear("all");
                    } else {
                      setInvoiceYear(Number(value));
                    }
                  }}
                >
                  <option value="all">{text.all}</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {invoiceError && <p className="subscribe-error">{invoiceError}</p>}
            <div className="portal-invoices">
              {invoiceLoading ? (
                <p className="portal-hint">...</p>
              ) : invoices.length ? (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="portal-invoice">
                    <div>
                      <p className="portal-label">
                        #{invoice.number ?? invoice.id}
                      </p>
                      <p className="portal-value">
                        {formatDate(invoice.created ?? null, locale)}
                      </p>
                    </div>
                    <div>
                      <p className="portal-label">{text.amount}</p>
                      <p className="portal-value">
                        {formatAmount(
                          invoice.amount_paid ?? invoice.amount_due ?? null,
                          invoice.currency ?? null,
                        )}
                      </p>
                    </div>
                    {invoice.invoice_pdf || invoice.hosted_invoice_url ? (
                      <a
                        className="portal-link"
                        href={
                          invoice.invoice_pdf ??
                          invoice.hosted_invoice_url ??
                          ""
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF
                      </a>
                    ) : (
                      <span className="portal-hint">-</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="portal-hint">-</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
