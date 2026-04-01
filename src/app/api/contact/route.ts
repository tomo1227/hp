import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  let request: {
    title?: string;
    name?: string;
    email?: string;
    category?: string;
    source?: string;
    message?: string;
    turnstileToken?: string;
  };

  try {
    request = await req.json();
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  const title = request.title?.trim() || "";
  const name = request.name?.trim() || "";
  const email = request.email?.trim() || "";
  const category = request.category?.trim() || "";
  const source = request.source?.trim() || "";
  const message = request.message?.trim() || "";
  const turnstileToken = request.turnstileToken?.trim() || "";

  const errors: string[] = [];
  if (!title) errors.push("Missing title.");
  if (!name) errors.push("Missing name.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email.");
  }
  if (!category) errors.push("Missing category.");
  if (!source) errors.push("Missing source.");
  if (!message || message.length < 10) errors.push("Message too short.");
  if (message.length > 1000) errors.push("Message too long.");
  if (!turnstileToken) errors.push("Missing Turnstile token.");

  if (errors.length > 0) {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  const secretKey = process.env.NEXT_PUBLIC_TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return Response.json(
      { message: "Turnstile secret is not configured." },
      { status: 500 },
    );
  }

  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: turnstileToken,
      }),
    },
  );

  if (!verifyResponse.ok) {
    return Response.json({ message: "Spam check failed." }, { status: 400 });
  }

  const verifyData = (await verifyResponse.json()) as { success?: boolean };
  if (!verifyData.success) {
    return Response.json({ message: "Spam check failed." }, { status: 400 });
  }

  const gmailUser =
    process.env.GMAIL_USER || process.env.NEXT_PUBLIC_GMAIL_USER_SECRET;
  const appPass =
    process.env.GMAIL_APP_PASS || process.env.NEXT_PUBLIC_GMAIL_APP_PASS_SECRET;

  if (!gmailUser || !appPass) {
    return Response.json(
      { message: "Mail server is not configured." },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: gmailUser,
      pass: appPass,
    },
  });
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const toHostMailData = {
    from: `Contact Form <${gmailUser}>`,
    replyTo: email,
    to: `${gmailUser}`,
    subject: `【tomokiota.com】${title} (${category})`,
    text: `${message}\n\nFrom: ${name}\nEmail: ${email}\nCategory: ${category}\nSource: ${source}`,
    html: `
        <p>【カテゴリ】</p>
        <p>${escapeHtml(category)}</p>
      <p>【流入元】</p>
      <p>${escapeHtml(source)}</p>
        <p>【名前】</p>
        <p>${escapeHtml(name)}</p>
        <p>【メールアドレス】</p>
        <p>${escapeHtml(email)}</p>
        <p>【メッセージ内容】</p>
        <p>${escapeHtml(message)}</p>
        `,
  };
  try {
    await transporter.sendMail(toHostMailData);
  } catch (error) {
    console.error("Failed to send contact mail", error);
    return Response.json({ message: "Failed to send mail." }, { status: 500 });
  }
  return Response.json({ message: "Success" }, { status: 200 });
}
