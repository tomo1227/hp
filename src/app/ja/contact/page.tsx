"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useMemo, useState } from "react";

declare global {
  interface Window {
    turnstile?: { reset: () => void };
    turnstileCallback?: (token: string) => void;
  }
}

type FormState = {
  title: string;
  name: string;
  email: string;
  category: string;
  source: string;
  message: string;
};

const MAX_TITLE_LENGTH = 80;
const MAX_NAME_LENGTH = 60;
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 1000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const categories = [
  { value: "general", label: "一般的なご相談・質問" },
  { value: "work", label: "お仕事依頼" },
  { value: "other", label: "その他" },
];

const sources = [
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X" },
  { value: "thread", label: "Threads" },
  { value: "search", label: "インターネット検索" },
  { value: "other", label: "その他" },
];

export default function Page() {
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formState, setFormState] = useState<FormState>({
    title: "",
    name: "",
    email: "",
    category: "general",
    source: "",
    message: "",
  });

  const errors = useMemo(() => {
    const next: Partial<Record<keyof FormState | "turnstile", string>> = {};
    if (!formState.title.trim()) {
      next.title = "件名を入力してください。";
    } else if (formState.title.trim().length > MAX_TITLE_LENGTH) {
      next.title = `件名は${MAX_TITLE_LENGTH}文字以内でお願いします。`;
    }

    if (!formState.name.trim()) {
      next.name = "お名前を入力してください。";
    } else if (formState.name.trim().length > MAX_NAME_LENGTH) {
      next.name = `お名前は${MAX_NAME_LENGTH}文字以内でお願いします。`;
    }

    if (!formState.email.trim()) {
      next.email = "メールアドレスを入力してください。";
    } else if (!emailPattern.test(formState.email.trim())) {
      next.email = "メールアドレスの形式が正しくありません。";
    }

    if (!formState.category) {
      next.category = "カテゴリを選択してください。";
    }

    if (!formState.source) {
      next.source = "どこから来たかを選択してください。";
    }

    if (!formState.message.trim()) {
      next.message = "お問い合わせ内容を入力してください。";
    } else if (formState.message.trim().length < MIN_MESSAGE_LENGTH) {
      next.message = `${MIN_MESSAGE_LENGTH}文字以上で入力してください。`;
    } else if (formState.message.trim().length > MAX_MESSAGE_LENGTH) {
      next.message = `${MAX_MESSAGE_LENGTH}文字以内でお願いします。`;
    }

    if (!turnstileToken) {
      next.turnstile = "スパム対策チェックを完了してください。";
    }

    if (!siteKey) {
      next.turnstile = "スパム対策の設定が未完了です。";
    }

    return next;
  }, [formState, turnstileToken, siteKey]);

  const hasErrors = Object.keys(errors).length > 0;

  function updateField<T extends keyof FormState>(
    field: T,
    value: FormState[T],
  ) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function markTouched(field: keyof FormState) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function getError(field: keyof FormState | "turnstile") {
    if (field === "turnstile") {
      return touched.turnstile && errors.turnstile ? errors.turnstile : null;
    }
    return touched[field] && errors[field] ? errors[field] : null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setTouched({
      title: true,
      name: true,
      email: true,
      category: true,
      source: true,
      message: true,
      turnstile: true,
    });

    if (hasErrors) {
      setErrorMessage("入力内容をご確認ください。");
      return;
    }

    setIsSubmitting(true);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const payload = {
      title: formState.title.trim(),
      name: formState.name.trim(),
      email: formState.email.trim(),
      category: formState.category,
      source: formState.source,
      message: formState.message.trim(),
      turnstileToken,
    };

    try {
      const response = await fetch(`${baseUrl}/api/contact/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        router.push("/ja/contact/thanks");
        return;
      }

      const errorData = await response.json();
      setErrorMessage(errorData.message || "送信に失敗しました。");
    } catch (error) {
      console.error("通信エラー:", error);
      setErrorMessage("ネットワークエラーが発生しました");
    } finally {
      setIsSubmitting(false);
      setTurnstileToken("");
      window.turnstile?.reset();
    }
  }

  return (
    <div className="contact-wrapper">
      <div className="contact-contents">
        <div className="contact-header">
          <h1 className="contact-form">お問い合わせフォーム</h1>
        </div>

        <form className="contact-form-body" onSubmit={handleSubmit}>
          <div className="contact-grid">
            <div className="contact-field">
              <label className="contact-label" htmlFor="title">
                件名
              </label>
              <input
                id="title"
                type="text"
                name="title"
                required
                maxLength={MAX_TITLE_LENGTH}
                value={formState.title}
                onChange={(event) => updateField("title", event.target.value)}
                onBlur={() => markTouched("title")}
                className="contact-input"
                autoComplete="off"
                aria-invalid={Boolean(getError("title"))}
              />
              <p className="contact-helper">
                {getError("title") ||
                  `${formState.title.length}/${MAX_TITLE_LENGTH}`}
              </p>
            </div>

            <div className="contact-field">
              <label className="contact-label" htmlFor="name">
                お名前
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                maxLength={MAX_NAME_LENGTH}
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                onBlur={() => markTouched("name")}
                className="contact-input"
                autoComplete="name"
                aria-invalid={Boolean(getError("name"))}
              />
              <p className="contact-helper">{getError("name")}</p>
            </div>

            <div className="contact-field">
              <label className="contact-label" htmlFor="email">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                onBlur={() => markTouched("email")}
                className="contact-input"
                autoComplete="email"
                inputMode="email"
                aria-invalid={Boolean(getError("email"))}
              />
              <p className="contact-helper">{getError("email")}</p>
            </div>

            <div className="contact-field">
              <label className="contact-label" htmlFor="category">
                カテゴリ
              </label>
              <select
                id="category"
                name="category"
                value={formState.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                onBlur={() => markTouched("category")}
                className="contact-select"
                aria-invalid={Boolean(getError("category"))}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <p className="contact-helper">{getError("category")}</p>
            </div>

            <div className="contact-field contact-field-full">
              <label className="contact-label" htmlFor="message">
                お問い合わせ内容
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                maxLength={MAX_MESSAGE_LENGTH}
                value={formState.message}
                onChange={(event) => updateField("message", event.target.value)}
                onBlur={() => markTouched("message")}
                className="contact-textarea"
                aria-invalid={Boolean(getError("message"))}
              />
              <p className="contact-helper">
                {getError("message") ||
                  `${formState.message.length}/${MAX_MESSAGE_LENGTH} 文字`}
              </p>
            </div>

            <div className="contact-field contact-field-full">
              <fieldset className="contact-fieldset">
                <legend className="contact-label">
                  どこからこのHPを知ったか
                </legend>
                <div className="contact-radio-group">
                  {sources.map((source) => (
                    <label key={source.value} className="contact-radio-option">
                      <input
                        type="radio"
                        name="source"
                        value={source.value}
                        checked={formState.source === source.value}
                        onChange={(event) =>
                          updateField("source", event.target.value)
                        }
                        onBlur={() => markTouched("source")}
                        className="contact-radio-input"
                        required
                      />
                      <span className="contact-radio-label">
                        {source.label}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="contact-helper">{getError("source")}</p>
              </fieldset>
            </div>
          </div>

          <div className="contact-turnstile">
            <label className="contact-label" htmlFor="cf-turnstile">
              スパム対策
            </label>
            {siteKey ? (
              <>
                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                  async
                  defer
                  onLoad={() => {
                    window.turnstileCallback = (token: string) => {
                      setTurnstileToken(token);
                    };
                  }}
                />
                <div
                  id="cf-turnstile"
                  className="cf-turnstile"
                  data-sitekey={siteKey}
                  data-callback="turnstileCallback"
                />
              </>
            ) : (
              <div className="contact-turnstile-fallback">
                Turnstileのサイトキーが未設定です。
              </div>
            )}
            {getError("turnstile") && (
              <p className="contact-helper contact-error-text">
                {getError("turnstile")}
              </p>
            )}
          </div>

          <div className="contact-actions">
            <button
              type="submit"
              className="contact-submit"
              disabled={isSubmitting || hasErrors}
            >
              {isSubmitting ? "送信中..." : "送信"}
            </button>
          </div>

          {errorMessage && (
            <div className="contact-error-banner" role="status">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
