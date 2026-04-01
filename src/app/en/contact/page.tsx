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
  { value: "general", label: "General question" },
  { value: "work", label: "Work-related" },
  { value: "other", label: "Other" },
];

const sources = [
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X" },
  { value: "thread", label: "Threads" },
  { value: "search", label: "Web search" },
  { value: "other", label: "Other" },
];

export default function Page() {
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
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
      next.title = "Please enter a subject.";
    } else if (formState.title.trim().length > MAX_TITLE_LENGTH) {
      next.title = `Keep the subject within ${MAX_TITLE_LENGTH} characters.`;
    }

    if (!formState.name.trim()) {
      next.name = "Please enter your name.";
    } else if (formState.name.trim().length > MAX_NAME_LENGTH) {
      next.name = `Keep your name within ${MAX_NAME_LENGTH} characters.`;
    }

    if (!formState.email.trim()) {
      next.email = "Please enter your email address.";
    } else if (!emailPattern.test(formState.email.trim())) {
      next.email = "Please enter a valid email address.";
    }

    if (!formState.category) {
      next.category = "Please choose a category.";
    }

    if (!formState.source) {
      next.source = "Please select where you found me.";
    }

    if (!formState.message.trim()) {
      next.message = "Please enter a message.";
    } else if (formState.message.trim().length < MIN_MESSAGE_LENGTH) {
      next.message = `Please write at least ${MIN_MESSAGE_LENGTH} characters.`;
    } else if (formState.message.trim().length > MAX_MESSAGE_LENGTH) {
      next.message = `Please keep it within ${MAX_MESSAGE_LENGTH} characters.`;
    }

    if (!turnstileToken) {
      next.turnstile = "Please complete the spam check.";
    }

    if (!siteKey) {
      next.turnstile = "Spam protection is not configured.";
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
      setErrorMessage("Please review the highlighted fields.");
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
        router.push("/en/contact/thanks");
        return;
      }

      const errorData = await response.json();
      setErrorMessage(errorData.message || "Failed to send mail.");
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("Network Error");
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
          <h1 className="contact-form">Contact Form</h1>
        </div>

        <form className="contact-form-body" onSubmit={handleSubmit}>
          <div className="contact-grid">
            <div className="contact-field">
              <label className="contact-label" htmlFor="title">
                Subject
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
                Your name
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
                Email
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
                Category
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
                Message
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
                  `${formState.message.length}/${MAX_MESSAGE_LENGTH} characters`}
              </p>
            </div>

            <div className="contact-field contact-field-full">
              <fieldset className="contact-fieldset">
                <legend className="contact-label">
                  How did you hear about me?
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
              Spam protection
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
                Missing Turnstile site key.
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
              type="button"
              className="contact-secondary"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              {showPreview ? "Hide preview" : "Preview"}
            </button>
            <button
              type="submit"
              className="contact-submit"
              disabled={isSubmitting || hasErrors}
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </div>

          {errorMessage && (
            <div className="contact-error-banner" role="status">
              {errorMessage}
            </div>
          )}
        </form>

        {showPreview && (
          <div className="contact-preview">
            <p className="contact-preview-title">Preview</p>
            <div className="contact-preview-card">
              <div>
                <span className="contact-preview-label">Subject</span>
                <p>{formState.title || "(not set)"}</p>
              </div>
              <div>
                <span className="contact-preview-label">From</span>
                <p>
                  {formState.name || "(not set)"} ·
                  {formState.email || "(not set)"}
                </p>
              </div>
              <div>
                <span className="contact-preview-label">Category</span>
                <p>
                  {categories.find((item) => item.value === formState.category)
                    ?.label || ""}
                </p>
              </div>
              <div>
                <span className="contact-preview-label">Source</span>
                <p>
                  {sources.find((item) => item.value === formState.source)
                    ?.label || "(not set)"}
                </p>
              </div>
              <div>
                <span className="contact-preview-label">Message</span>
                <p className="contact-preview-message">
                  {formState.message || "(not set)"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
