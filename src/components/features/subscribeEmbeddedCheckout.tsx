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
import type { SyntheticEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

type Locale = "en" | "ja";

type SubscribeEmbeddedCheckoutProps = {
  locale?: Locale;
};

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

type CheckoutFormProps = {
  locale: Locale;
  token: string;
  paymentMethods: {
    id: string;
    brand?: string | null;
    last4?: string | null;
    exp_month?: number | null;
    exp_year?: number | null;
  }[];
  defaultPaymentMethodId: string | null;
  selectedPaymentMethodId: string;
  onSelectPaymentMethod: (id: string) => void;
  setDefault: boolean;
  onToggleDefault: (value: boolean) => void;
};

const CheckoutForm = ({
  locale,
  token,
  paymentMethods,
  defaultPaymentMethodId,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
  setDefault,
  onToggleDefault,
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isUsingNewCard = selectedPaymentMethodId === "new";
  const orderedMethods = [...paymentMethods].sort((a, b) => {
    if (a.id === defaultPaymentMethodId) return -1;
    if (b.id === defaultPaymentMethodId) return 1;
    return 0;
  });

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    const returnUrl = new URL(
      `/${locale}/membership/success`,
      window.location.origin,
    );

    if (!isUsingNewCard) {
      if (!token) {
        setError(
          locale === "ja" ? "ログインしてください。" : "Please sign in first.",
        );
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/stripe/checkout/use-default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locale,
          paymentMethodId: selectedPaymentMethodId,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        paymentIntentId?: string;
      };

      if (!response.ok) {
        setError(data.error || "Failed to pay with default payment method");
        setSubmitting(false);
        return;
      }

      if (data.paymentIntentId) {
        returnUrl.searchParams.set("payment_intent", data.paymentIntentId);
      }

      window.location.assign(returnUrl.toString());
      return;
    }

    if (!stripe || !elements) {
      setSubmitting(false);
      return;
    }

    if (setDefault) {
      returnUrl.searchParams.set("set_default", "1");
    }

    const result: PaymentIntentResult = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl.toString(),
      },
    });

    if (result.error) {
      setError(result.error.message ?? "Failed to confirm payment");
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="portal-card-form">
      {paymentMethods.length > 0 && (
        <div className="subscribe-default-option" role="radiogroup">
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
                      onSelectPaymentMethod(method.id);
                      onToggleDefault(false);
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
                  onSelectPaymentMethod("new");
                  onToggleDefault(false);
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
        </div>
      )}

      {isUsingNewCard && (
        <>
          <PaymentElement />

          <label className="subscribe-default-option">
            <input
              type="checkbox"
              name="new-card-default"
              checked={setDefault}
              onChange={(event) => onToggleDefault(event.target.checked)}
            />
            <span>
              {locale === "ja"
                ? "このカードをデフォルトにする"
                : "Set this card as default"}
            </span>
          </label>
        </>
      )}

      <button
        type="submit"
        disabled={(isUsingNewCard && !stripe) || submitting}
      >
        {submitting ? "..." : locale === "ja" ? "支払う" : "Pay"}
      </button>

      {error && <p className="subscribe-error">{error}</p>}
    </form>
  );
};

export const SubscribeEmbeddedCheckout = ({
  locale = "en",
}: SubscribeEmbeddedCheckoutProps) => {
  const hasLoadedRef = useRef(false);

  const [clientSecret, setClientSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"stripe" | "night">("stripe");
  const [setDefault, setSetDefault] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<
    {
      id: string;
      brand?: string | null;
      last4?: string | null;
      exp_month?: number | null;
      exp_year?: number | null;
    }[]
  >([]);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<
    string | null
  >(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("new");

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

        setToken(token);

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
          error?: string;
          paymentMethods?: {
            id?: string;
            card?: {
              brand?: string | null;
              last4?: string | null;
              exp_month?: number | null;
              exp_year?: number | null;
            } | null;
          }[];
          defaultPaymentMethodId?: string | null;
        };

        if (!response.ok || !data.clientSecret) {
          throw new Error(data.error || "Failed to start checkout");
        }

        setClientSecret(data.clientSecret);

        const normalizedMethods = (data.paymentMethods ?? [])
          .filter(
            (
              method,
            ): method is {
              id: string;
              card?: {
                brand?: string | null;
                last4?: string | null;
                exp_month?: number | null;
                exp_year?: number | null;
              } | null;
            } => Boolean(method?.id),
          )
          .map((method) => ({
            id: method.id,
            brand: method.card?.brand ?? null,
            last4: method.card?.last4 ?? null,
            exp_month: method.card?.exp_month ?? null,
            exp_year: method.card?.exp_year ?? null,
          }));

        setPaymentMethods(normalizedMethods);

        const nextDefaultId = data.defaultPaymentMethodId ?? null;
        setDefaultPaymentMethodId(nextDefaultId);

        const hasDefault = Boolean(
          nextDefaultId &&
            normalizedMethods.some((m) => m.id === nextDefaultId),
        );
        setSelectedPaymentMethodId(
          hasDefault && nextDefaultId
            ? nextDefaultId
            : (normalizedMethods[0]?.id ?? "new"),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      load();
    }

    const unsub = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn" || payload.event === "signedOut") {
        load();
      }
    });

    return () => {
      unsub();
    };
  }, [locale]);

  if (!stripePromise) {
    return (
      <p className="subscribe-error">
        {locale === "ja"
          ? "決済キーが未設定です。運営者にお問い合わせください。"
          : "Stripe key is missing. Please contact support."}
      </p>
    );
  }

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
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme,
          },
        }}
      >
        <CheckoutForm
          locale={locale}
          token={token}
          paymentMethods={paymentMethods}
          defaultPaymentMethodId={defaultPaymentMethodId}
          selectedPaymentMethodId={selectedPaymentMethodId}
          onSelectPaymentMethod={setSelectedPaymentMethodId}
          setDefault={setDefault}
          onToggleDefault={setSetDefault}
        />
      </Elements>
    </div>
  );
};
