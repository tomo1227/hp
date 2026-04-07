"use client";

import { confirmSignUp, signIn, signUp } from "aws-amplify/auth";
import { useState } from "react";

type Locale = "en" | "ja";

type MemberAuthFormProps = {
  locale?: Locale;
  onSignedIn?: () => void;
};

type Mode = "signin" | "signup" | "confirm";

const copy = {
  en: {
    title: "Email sign in",
    email: "Email address",
    password: "Password",
    code: "Verification code",
    signin: "Sign in",
    signup: "Create account",
    confirm: "Confirm",
    switchToSignUp: "Create a new account",
    switchToSignIn: "I already have an account",
    confirmHint: "Check your email for the confirmation code.",
  },
  ja: {
    title: "メールでログイン",
    email: "メールアドレス",
    password: "パスワード",
    code: "確認コード",
    signin: "ログイン",
    signup: "新規登録",
    confirm: "確認する",
    switchToSignUp: "新規アカウントを作成",
    switchToSignIn: "すでにアカウントがあります",
    confirmHint: "メールに届いた確認コードを入力してください。",
  },
};

export const MemberAuthForm = ({
  locale = "en",
  onSignedIn,
}: MemberAuthFormProps) => {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const text = copy[locale] ?? copy.en;

  const normalizedEmail = email.trim().toLowerCase();

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signIn({
        username: normalizedEmail,
        password,
        options: { authFlowType: "USER_SRP_AUTH" },
      });
      onSignedIn?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
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
      await confirmSignUp({
        username: normalizedEmail,
        confirmationCode: code,
      });
      setMode("signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-auth">
      <p className="portal-title">{text.title}</p>
      <label className="portal-label" htmlFor={`member-email-${locale}`}>
        {text.email}
      </label>
      <input
        id={`member-email-${locale}`}
        className="portal-input"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />

      {mode !== "confirm" && (
        <>
          <label className="portal-label" htmlFor={`member-pass-${locale}`}>
            {text.password}
          </label>
          <input
            id={`member-pass-${locale}`}
            className="portal-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
          />
        </>
      )}

      {mode === "confirm" && (
        <>
          <label className="portal-label" htmlFor={`member-code-${locale}`}>
            {text.code}
          </label>
          <input
            id={`member-code-${locale}`}
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

      <div className="member-auth-actions">
        {mode === "signin" && (
          <button type="button" onClick={handleSignIn} disabled={loading}>
            {loading ? "..." : text.signin}
          </button>
        )}
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

      {mode === "signin" && (
        <button
          type="button"
          className="member-auth-link"
          onClick={() => setMode("signup")}
        >
          {text.switchToSignUp}
        </button>
      )}
      {mode !== "signin" && (
        <button
          type="button"
          className="member-auth-link"
          onClick={() => setMode("signin")}
        >
          {text.switchToSignIn}
        </button>
      )}

      {error && <p className="subscribe-error">{error}</p>}
    </div>
  );
};
