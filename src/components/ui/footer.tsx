"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const hiddenPaths = new Set(["/", "/ja", "/en"]);

export default function Footer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (hiddenPaths.has(pathname)) {
    return null;
  }

  return (
    <footer className="site-footer">
      <nav className="site-footer-links" aria-label="Site">
        <p>© 2026 Tomoki Ota</p>
        <Link href="/terms">特定商取引法に基づく表記</Link>
        <Link href="/privacy">プライバシーポリシー</Link>
        <Link href="/tos">利用規約</Link>
      </nav>
    </footer>
  );
}
