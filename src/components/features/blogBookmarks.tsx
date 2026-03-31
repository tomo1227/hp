"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { jaTranslate } from "@/lib/translator";

type Locale = "ja" | "en";

type BookmarkItem = {
  slug: string;
  title: string;
  date: string;
  displayDate?: string;
  locale: Locale;
  tags?: string[];
};

type BlogBookmarkButtonProps = {
  item: BookmarkItem;
  locale: Locale;
  variant?: "icon" | "compact";
};

type BlogBookmarkListProps = {
  items: BookmarkItem[];
  locale: Locale;
};

const STORAGE_KEY = "tomokiota.blog.bookmarks";

const normalizeItem = (item: BookmarkItem): BookmarkItem => ({
  slug: item.slug,
  title: item.title,
  date: item.date,
  displayDate:
    typeof item.displayDate === "string" ? item.displayDate : undefined,
  locale: item.locale,
  tags: Array.isArray(item.tags) ? item.tags : [],
});

const readBookmarks = (): BookmarkItem[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.slug === "string" &&
          typeof item.title === "string" &&
          typeof item.date === "string" &&
          (item.locale === "ja" || item.locale === "en"),
      )
      .map(normalizeItem);
  } catch {
    return [];
  }
};

const writeBookmarks = (items: BookmarkItem[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage write failures (private mode, quota, etc.)
  }
};

const useBlogBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    setBookmarks(readBookmarks());
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }
      setBookmarks(readBookmarks());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isBookmarked = (item: BookmarkItem) =>
    bookmarks.some(
      (saved) => saved.slug === item.slug && saved.locale === item.locale,
    );

  const toggleBookmark = (item: BookmarkItem) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (saved) => saved.slug === item.slug && saved.locale === item.locale,
      );
      const next = exists
        ? prev.filter(
            (saved) => saved.slug !== item.slug || saved.locale !== item.locale,
          )
        : [normalizeItem(item), ...prev];
      writeBookmarks(next);
      return next;
    });
  };

  return { bookmarks, isBookmarked, toggleBookmark };
};

export const BlogBookmarkButton = ({
  item,
  locale,
  variant = "compact",
}: BlogBookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark } = useBlogBookmarks();
  const active = isBookmarked(item);
  const label =
    locale === "ja"
      ? active
        ? "保存済み"
        : "保存"
      : active
        ? "Saved"
        : "Save";
  const actionLabel =
    locale === "ja"
      ? active
        ? "保存を解除"
        : "保存に追加"
      : active
        ? "Remove bookmark"
        : "Add bookmark";

  return (
    <button
      type="button"
      className={`bookmark-button ${
        active ? "is-active" : ""
      } ${variant === "icon" ? "bookmark-button--icon" : ""}`}
      onClick={() => toggleBookmark(item)}
      aria-pressed={active}
      aria-label={actionLabel}
    >
      <span className="bookmark-icon" aria-hidden="true">
        ★
      </span>
      <span className="bookmark-label">{label}</span>
    </button>
  );
};

export const BlogBookmarkList = ({ items, locale }: BlogBookmarkListProps) => {
  const { bookmarks, isBookmarked, toggleBookmark } = useBlogBookmarks();
  const [filter, setFilter] = useState<"all" | "saved">("all");

  const savedSet = useMemo(() => {
    return new Set(
      bookmarks
        .filter((item) => item.locale === locale)
        .map((item) => item.slug),
    );
  }, [bookmarks, locale]);

  const savedCount = useMemo(() => {
    return items.filter((item) => savedSet.has(item.slug)).length;
  }, [items, savedSet]);

  const visibleItems = useMemo(() => {
    return filter === "saved"
      ? items.filter((item) => savedSet.has(item.slug))
      : items;
  }, [filter, items, savedSet]);

  const emptyLabel =
    locale === "ja" ? "保存した記事はまだありません。" : "No saved posts yet.";

  const allLabel = locale === "ja" ? "すべて" : "All";
  const savedLabel = locale === "ja" ? "保存" : "Saved";

  return (
    <div className="blog-list">
      <div className="blog-filter">
        <button
          type="button"
          className={`blog-filter-button ${
            filter === "all" ? "is-active" : ""
          }`}
          onClick={() => setFilter("all")}
        >
          {allLabel}
        </button>
        <button
          type="button"
          className={`blog-filter-button ${
            filter === "saved" ? "is-active" : ""
          }`}
          onClick={() => setFilter("saved")}
        >
          {savedLabel}
          <span className="blog-filter-count">{savedCount}</span>
        </button>
      </div>

      <ul className="blog-list-grid">
        {visibleItems.map((item) => {
          const active = isBookmarked(item);
          return (
            <li key={item.slug} className="blog-card">
              <div className="blog-card-meta">
                <time>{item.displayDate ?? item.date}</time>
                <button
                  type="button"
                  className={`bookmark-button bookmark-button--icon ${
                    active ? "is-active" : ""
                  }`}
                  onClick={() => toggleBookmark(item)}
                  aria-pressed={active}
                  aria-label={
                    locale === "ja"
                      ? active
                        ? "保存を解除"
                        : "保存に追加"
                      : active
                        ? "Remove bookmark"
                        : "Add bookmark"
                  }
                >
                  <span className="bookmark-icon" aria-hidden="true">
                    ★
                  </span>
                </button>
              </div>
              <Link
                className="blog-card-link"
                href={`/${locale}/blogs/${item.slug}`}
              >
                <h2 className="blog-card-title">{item.title}</h2>
              </Link>
              {item.tags && item.tags.length > 0 ? (
                <div className="blog-card-tags">
                  {item.tags.map((tag) => (
                    <Link
                      className="blog-card-tag-link"
                      href={`/${locale}/tags/${tag}`}
                      key={tag}
                    >
                      {locale === "ja" ? jaTranslate(tag) : tag}
                    </Link>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {visibleItems.length === 0 ? (
        <div className="blog-empty">{emptyLabel}</div>
      ) : null}
    </div>
  );
};
