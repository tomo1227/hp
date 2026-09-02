"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

type TableOfContentsProps = {
  locale: "ja" | "en";
};

const copy = {
  ja: "目次",
  en: "Contents",
};

export const TableOfContents = ({ locale }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setActiveId(null);
    const article = document.querySelector("article#blog-content");
    if (!article) {
      setHeadings([]);
      return;
    }

    const elements = Array.from(article.querySelectorAll("h2, h3"));
    const items = elements.map((el, index) => {
      const text = el.textContent ?? "";
      const id = el.id || `toc-heading-${index}`;
      if (!el.id) {
        el.id = id;
      }
      return {
        id,
        text,
        level: el.tagName === "H2" ? 2 : 3,
      };
    });
    setHeadings(items);

    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.id);
        if (visible.length > 0) {
          setActiveId(visible[0] ?? null);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <nav className="toc" aria-label={copy[locale]}>
      <ul className="toc-list">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`toc-item level-${heading.level}${
              activeId === heading.id ? " is-active" : ""
            }`}
          >
            <Link
              href={`#${heading.id}`}
              className="toc-link"
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(heading.id);
                if (!target) return;
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.scrollY - headerOffset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                });
              }}
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
