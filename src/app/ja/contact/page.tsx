"use client";
import { useState } from "react";

export default function Page() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(false);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const jsonData = Object.fromEntries(formData.entries());
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

    try {
      const response = await fetch(`${baseUrl}/api/contact/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData);
      }
    } catch (error) {
      console.error("通信エラー:", error);
      setErrorMessage("ネットワークエラーが発生しました");
    }
  }
  return (
    <div className="contact-wrapper">
      <div className="contact-contents">
        <h1 className="contact-form">お問い合わせフォーム</h1>
        <form className="w-4/5" onSubmit={handleSubmit}>
          <div className="contact-form-element">
            <label className="contact-title-label" htmlFor="name">
              タイトル
            </label>
            <input
              type="text"
              name="title"
              required
              className="contact-title"
            />
          </div>
          <div className="contact-form-element">
            <label className="contact-name-label" htmlFor="name">
              お名前
            </label>
            <input type="text" name="name" required className="contact-name" />
          </div>
          <div className="contact-form-element">
            <label className="contact-email-label" htmlFor="email">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              required
              className="contact-email"
            />
          </div>
          <div className="contact-form-element">
            <label htmlFor="content" className="contact-message-label">
              お問い合わせ内容
            </label>
            <textarea
              name="message"
              rows={6}
              required
              className="contact-message"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
            >
              送信
            </button>
          </div>
          {isSubmitted && (
            <div className="mb-4 p-4 text-green-800 bg-green-100 rounded">
              メールが送信されました！
            </div>
          )}

          {errorMessage && (
            <div className="m-1 p-3 text-red-800 bg-red-100 rounded max-md:text-sm">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
