"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { PaymentIntentResult } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

type Locale = "en" | "ja";

type SubscribeEmbeddedCheckoutProps = {
  locale?: Locale;
};

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = loadStripe(stripePublishableKey);

type CheckoutFormProps = {
  locale: Locale;
  clientSecret: string;
  selectedPaymentMethodId: string;
  defaultPaymentMethodId: string | null;
};

const CheckoutForm = ({
  locale,
  clientSecret,
  selectedPaymentMethodId,
  defaultPaymentMethodId,
  setDefault,
  onToggleDefault,
}: CheckoutFormProps & {
  setDefault: boolean;
  onToggleDefault: (value: boolean) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const usingSaved = selectedPaymentMethodId !== "new";

    if (!stripe || (!elements && !usingSaved)) return;

    setSubmitting(true);
    setError("");

    const returnUrl = new URL(
      `/${locale}/membership/success`,
      window.location.origin,
    );

    if (setDefault && selectedPaymentMethodId !== defaultPaymentMethodId) {
      returnUrl.searchParams.set("set_default", "1");
    }

    let result: PaymentIntentResult;

    if (usingSaved) {
      result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: returnUrl.toString(),
          payment_method: selectedPaymentMethodId,
        },
      });
    } else {
      const currentElements = elements;
      if (!currentElements) return;

      result = await stripe.confirmPayment({
        elements: currentElements,
        confirmParams: { return_url: returnUrl.toString() },
      });
    }

    if (result?.error) {
      setError(result.error.message ?? "Failed to confirm payment");
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="portal-card-form">
      {selectedPaymentMethodId === "new" && <PaymentElement />}
      {selectedPaymentMethodId === "new" && (
        <label className="subscribe-default-option">
          <input
            type="checkbox"
            checked={setDefault}
            onChange={(event) => onToggleDefault(event.target.checked)}
          />
          <span>
            {locale === "ja"
              ? "このカードをデフォルトにする"
              : "Set this card as default"}
          </span>
        </label>
      )}
      <button type="submit" disabled={!stripe || submitting}>
        {submitting ? "..." : locale === "ja" ? "支払う" : "Pay"}
      </button>
      {error && <p className="subscribe-error">{error}</p>}
    </form>
  );
};

export const SubscribeEmbeddedCheckout = ({
  locale = "en",
}: SubscribeEmbeddedCheckoutProps) => {
  const [clientSecret, setClientSecret] = useState("");
  const [customerSessionSecret, setCustomerSessionSecret] = useState("");
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<
    string | null
  >(null);
  const [paymentMethods, setPaymentMethods] = useState<
    {
      id: string;
      brand: string | null;
      last4: string | null;
      exp_month: number | null;
      exp_year: number | null;
    }[]
  >([]);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"stripe" | "night">("stripe");
  const [setDefault, setSetDefault] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("new");
  const orderedMethods = [...paymentMethods].sort((a, b) => {
    if (a.id === defaultPaymentMethodId) return -1;
    if (b.id === defaultPaymentMethodId) return 1;
    return 0;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      setTheme(media.matches ? "night" : "stripe");
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => {
      media.removeEventListener("change", applyTheme);
    };
  }, []);

  useEffect(() => {
    configureAmplifyClient({ locale });
    const load = async () => {
      setError("");
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) {
          throw new Error(
            locale === "ja"
              ? "ログインしてください。"
              : "Please sign in first.",
          );
        }
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ locale }),
        });
        const data = (await response.json()) as {
          clientSecret?: string;
          customerSessionClientSecret?: string;
          defaultPaymentMethodId?: string | null;
          paymentMethods?: {
            id: string;
            brand: string | null;
            last4: string | null;
            exp_month: number | null;
            exp_year: number | null;
          }[];
          error?: string;
        };
        if (!response.ok || !data.clientSecret) {
          throw new Error(data.error || "Failed to start checkout");
        }
        setClientSecret(data.clientSecret);
        setCustomerSessionSecret(data.customerSessionClientSecret ?? "");
        setDefaultPaymentMethodId(data.defaultPaymentMethodId ?? null);
        setPaymentMethods(data.paymentMethods ?? []);
        setSelectedPaymentMethodId(data.defaultPaymentMethodId ?? "new");
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    load();
    const unsub = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn" || payload.event === "signedOut") {
        load();
      }
    });
    return () => {
      unsub();
    };
  }, [locale]);

  if (!clientSecret) {
    return error ? (
      <p className="subscribe-error">{error}</p>
    ) : (
      <div className="subscribe-loading">
        <span className="subscribe-spinner" />
        <span>{locale === "ja" ? "読み込み中" : "Loading"}</span>
      </div>
    );
  }

  return (
    <div className="subscribe-embedded">
      {paymentMethods.length > 0 && (
        <div className="subscribe-default-choice">
          <p className="subscribe-choice-title">
            {locale === "ja" ? "支払い方法の選択" : "Choose payment method"}
          </p>
          {orderedMethods.map((method) => {
            const isDefault = method.id === defaultPaymentMethodId;
            const label =
              locale === "ja"
                ? `${method.brand ?? "card"} •••• ${method.last4 ?? "-"}`
                : `${method.brand ?? "card"} •••• ${method.last4 ?? "-"}`;
            const exp =
              method.exp_month && method.exp_year
                ? ` ${method.exp_month}/${method.exp_year}`
                : "";
            return (
              <label className="subscribe-choice" key={method.id}>
                <input
                  type="radio"
                  name="payment-choice"
                  checked={selectedPaymentMethodId === method.id}
                  onChange={() => {
                    setSelectedPaymentMethodId(method.id);
                    setSetDefault(false);
                  }}
                />
                <span className="subscribe-choice-label">
                  <span>
                    {label}
                    {exp}
                  </span>
                  {isDefault && (
                    <span className="subscribe-choice-badge">
                      {locale === "ja" ? "デフォルト" : "Default"}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
          <label className="subscribe-choice is-new">
            <input
              type="radio"
              name="payment-choice"
              checked={selectedPaymentMethodId === "new"}
              onChange={() => {
                setSelectedPaymentMethodId("new");
                setSetDefault(false);
              }}
            />
            <span className="subscribe-choice-label">
              <span>{locale === "ja" ? "新しいカード" : "New card"}</span>
              <span className="subscribe-choice-badge is-outline">
                {locale === "ja" ? "追加" : "Add"}
              </span>
            </span>
          </label>
        </div>
      )}
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: { theme },
          customerSessionClientSecret: customerSessionSecret || undefined,
        }}
      >
        <CheckoutForm
          locale={locale}
          clientSecret={clientSecret}
          selectedPaymentMethodId={selectedPaymentMethodId}
          defaultPaymentMethodId={defaultPaymentMethodId}
          setDefault={setDefault}
          onToggleDefault={setSetDefault}
        />
      </Elements>
    </div>
  );
};
