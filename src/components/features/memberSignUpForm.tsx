"use client";

import { confirmSignUp, signUp } from "aws-amplify/auth";
import Link from "next/link";
import { useState } from "react";
import { configureAmplifyClient } from "@/components/features/amplifyProvider";

type Locale = "en" | "ja";

type MemberSignUpFormProps = {
  locale?: Locale;
};

type Mode = "signup" | "confirm" | "done";

const copy = {
  en: {
    title: "Create account",
    email: "Email address",
    password: "Password",
    passwordConfirm: "Confirm password",
    code: "Verification code",
    signup: "Create account",
    confirm: "Confirm",
    confirmHint: "Check your email for the confirmation code.",
    done: "Your email is verified. You can sign in now.",
    login: "Go to login",
    passwordMismatch: "Passwords do not match.",
  },
  ja: {
    title: "新規登録",
    email: "メールアドレス",
    password: "パスワード",
    passwordConfirm: "パスワード（確認）",
    code: "確認コード",
    signup: "登録する",
    confirm: "確認する",
    confirmHint: "メールに届いた確認コードを入力してください。",
    done: "メール認証が完了しました。ログインしてください。",
    login: "ログインへ",
    passwordMismatch: "パスワードが一致しません。",
  },
};

export const MemberSignUpForm = ({ locale = "en" }: MemberSignUpFormProps) => {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const text = copy[locale] ?? copy.en;

  const normalizedEmail = email.trim().toLowerCase();
  const prefix = locale === "ja" ? "/ja" : "/en";

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    if (password !== confirmPassword) {
      setError(text.passwordMismatch);
      setLoading(false);
      return;
    }
    try {
      configureAmplifyClient();
      await signUp({
        username: normalizedEmail,
        password,
        options: { userAttributes: { email: normalizedEmail } },
      });
      setMode("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      configureAmplifyClient();
      await confirmSignUp({
        username: normalizedEmail,
        confirmationCode: code,
      });
      setMode("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-auth">
      <p className="portal-title">{text.title}</p>
      <label className="portal-label" htmlFor={`signup-email-${locale}`}>
        {text.email}
      </label>
      <input
        id={`signup-email-${locale}`}
        className="portal-input"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />

      {mode === "signup" && (
        <>
          <label className="portal-label" htmlFor={`signup-pass-${locale}`}>
            {text.password}
          </label>
          <input
            id={`signup-pass-${locale}`}
            className="portal-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            autoComplete="new-password"
          />
          <label className="portal-label" htmlFor={`signup-pass2-${locale}`}>
            {text.passwordConfirm}
          </label>
          <input
            id={`signup-pass2-${locale}`}
            className="portal-input"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="********"
            autoComplete="new-password"
          />
        </>
      )}

      {mode === "confirm" && (
        <>
          <label className="portal-label" htmlFor={`signup-code-${locale}`}>
            {text.code}
          </label>
          <input
            id={`signup-code-${locale}`}
            className="portal-input"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="123456"
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          <p className="portal-hint">{text.confirmHint}</p>
        </>
      )}

      {mode === "done" && <p className="portal-hint">{text.done}</p>}

      <div className="member-auth-actions">
        {mode === "signup" && (
          <button type="button" onClick={handleSignUp} disabled={loading}>
            {loading ? "..." : text.signup}
          </button>
        )}
        {mode === "confirm" && (
          <button type="button" onClick={handleConfirm} disabled={loading}>
            {loading ? "..." : text.confirm}
          </button>
        )}
      </div>

      {mode !== "done" && (
        <Link className="member-auth-link" href={`${prefix}/login`}>
          {text.login}
        </Link>
      )}

      {error && <p className="subscribe-error">{error}</p>}
    </div>
  );
};
