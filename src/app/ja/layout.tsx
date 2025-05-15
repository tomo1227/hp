import Header from "@/components/ui/header";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import "../globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tomokiota.com"),
  title: "tomokiota.com",
  description: "The Official Website of Tomoki Ota, Traveler and Photographer.",
  twitter: {
    card: "summary_large_image",
  },
  creator: "Tomoki Ota",
  other: {
    "apple-mobile-web-app-title": "tomokiota",
  },
};

export default function jaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader />
        <div id="body-container">
          <Header />
          <div id="main-contents">
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
