"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { rgbDataURL } from "@/lib/blurImage";
import { jaTranslate } from "@/lib/translator";

type Locale = "ja" | "en";

type FavoriteItem = {
  slug: string;
  title: string;
  date: string;
  locale: Locale;
};

type GalleryFavoriteButtonProps = {
  item: FavoriteItem;
  locale: Locale;
};

type GalleryListItem = {
  slug: string;
  title: string;
  image: string;
  tags: string[];
  locale: Locale;
};

type GalleryFavoritesTabsProps = {
  items: GalleryListItem[];
  locale: Locale;
  tags: string[];
};

const STORAGE_KEY = "tomokiota.gallery.favorites";
const COLUMN_KEY = "tomokiota.gallery.columns";
const DEFAULT_COLUMNS = 5;
const MIN_COLUMNS = 1;
const MAX_COLUMNS = 7;

const normalizeItem = (item: FavoriteItem): FavoriteItem => ({
  slug: item.slug,
  title: item.title,
  date: item.date,
  locale: item.locale,
});

const readFavorites = (): FavoriteItem[] => {
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

const writeFavorites = (items: FavoriteItem[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage write failures (private mode, quota, etc.)
  }
};

const getViewportKey = (): "mobile" | "tablet" | "desktop" => {
  if (typeof window === "undefined") {
    return "desktop";
  }
  if (window.matchMedia("(max-width: 950px)").matches) {
    return "mobile";
  }
  if (window.matchMedia("(max-width: 1100px)").matches) {
    return "tablet";
  }
  return "desktop";
};

const getColumnStorageKey = () => `${COLUMN_KEY}.${getViewportKey()}`;

const getResponsiveDefaultColumns = (): number => {
  if (typeof window === "undefined") {
    return DEFAULT_COLUMNS;
  }
  if (window.matchMedia("(max-width: 950px)").matches) {
    return 3;
  }
  if (window.matchMedia("(max-width: 1100px)").matches) {
    return 4;
  }
  return DEFAULT_COLUMNS;
};

const readColumns = (): number => {
  if (typeof window === "undefined") {
    return DEFAULT_COLUMNS;
  }
  try {
    const raw = window.localStorage.getItem(getColumnStorageKey());
    if (!raw) {
      return getResponsiveDefaultColumns();
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      return getResponsiveDefaultColumns();
    }
    return Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, parsed));
  } catch {
    return getResponsiveDefaultColumns();
  }
};

const writeColumns = (value: number) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(getColumnStorageKey(), String(value));
  } catch {
    // Ignore storage write failures (private mode, quota, etc.)
  }
};

export const useGalleryFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }
      setFavorites(readFavorites());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isFavorited = (item: FavoriteItem) =>
    favorites.some(
      (saved) => saved.slug === item.slug && saved.locale === item.locale,
    );

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (saved) => saved.slug === item.slug && saved.locale === item.locale,
      );
      const next = exists
        ? prev.filter(
            (saved) => saved.slug !== item.slug || saved.locale !== item.locale,
          )
        : [normalizeItem(item), ...prev];
      writeFavorites(next);
      return next;
    });
  };

  return { favorites, isFavorited, toggleFavorite };
};

export const GalleryFavoriteButton = ({
  item,
  locale,
}: GalleryFavoriteButtonProps) => {
  const { isFavorited, toggleFavorite } = useGalleryFavorites();
  const active = isFavorited(item);
  const actionLabel =
    locale === "ja"
      ? active
        ? "お気に入りを解除"
        : "お気に入りに追加"
      : active
        ? "Remove favorites"
        : "Add favorites";

  return (
    <button
      type="button"
      className={`bookmark-button ${active ? "is-active" : ""}`}
      onClick={() => toggleFavorite(item)}
      aria-pressed={active}
      aria-label={actionLabel}
    >
      <span className="bookmark-icon" aria-hidden="true">
        ★
      </span>
    </button>
  );
};

export const GalleryFavoritesTabs = ({
  items,
  locale,
  tags,
}: GalleryFavoritesTabsProps) => {
  const { favorites } = useGalleryFavorites();
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [columns, setColumns] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  // ページング用
  const DEFAULT_ITEMS_PER_PAGE_DESKTOP = 40;
  const DEFAULT_ITEMS_PER_PAGE_MOBILE = 30;
  const [page, setPage] = useState(1);

  // デバイス幅でITEMS_PER_PAGEを調整
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(max-width: 750px)");
    const handleChange = () => setIsMobile(media.matches);
    handleChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);
  const baseItemsPerPage = isMobile
    ? DEFAULT_ITEMS_PER_PAGE_MOBILE
    : DEFAULT_ITEMS_PER_PAGE_DESKTOP;
  const computedColumns = columns ?? DEFAULT_COLUMNS;
  const ITEMS_PER_PAGE =
    computedColumns * Math.ceil(baseItemsPerPage / computedColumns);

  useEffect(() => {
    setColumns(readColumns());
  }, []);

  useEffect(() => {
    if (typeof columns === "number") {
      writeColumns(columns);
    }
  }, [columns]);

  const favoriteSet = useMemo(() => {
    return new Set(
      favorites
        .filter((item) => item.locale === locale)
        .map((item) => item.slug),
    );
  }, [favorites, locale]);

  const visibleItems = items.filter((item) => {
    const matchesFavorite =
      filter === "favorites" ? favoriteSet.has(item.slug) : true;
    const matchesTag =
      selectedTag === "all" ? true : item.tags.includes(selectedTag);
    return matchesFavorite && matchesTag;
  });

  // ページング処理
  const totalPages = Math.max(
    1,
    Math.ceil(visibleItems.length / ITEMS_PER_PAGE),
  );
  const pagedItems = visibleItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const paginationItems = useMemo(() => {
    const boundaryCount = 1;
    const siblingCount = isMobile ? 1 : 2;
    const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
    if (totalPages <= totalNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPage = Math.max(page - siblingCount, boundaryCount + 2);
    const endPage = Math.min(
      page + siblingCount,
      totalPages - boundaryCount - 1,
    );

    const items: Array<number | "ellipsis"> = [];
    for (let i = 1; i <= boundaryCount; i += 1) {
      items.push(i);
    }
    if (startPage > boundaryCount + 2) {
      items.push("ellipsis");
    }
    for (let i = startPage; i <= endPage; i += 1) {
      items.push(i);
    }
    if (endPage < totalPages - boundaryCount - 1) {
      items.push("ellipsis");
    }
    for (let i = totalPages - boundaryCount + 1; i <= totalPages; i += 1) {
      items.push(i);
    }
    return items;
  }, [isMobile, page, totalPages]);

  // フィルタやタグが変わったらページを1に戻す
  // biome-ignore lint/correctness/useExhaustiveDependencies: 削除したら動作しなくなる
  useEffect(() => {
    setPage(1);
  }, [filter, selectedTag]);

  const allLabel = locale === "ja" ? "すべて" : "All";
  const favoritesLabel = "★";
  const emptyLabel =
    locale === "ja"
      ? "条件に合うギャラリーがありません。"
      : "No galleries match your filters.";
  const allTagsLabel = locale === "ja" ? "タグで絞り込み" : "Filter by tag";
  const pageLabel =
    locale === "ja"
      ? `ページ ${page} / ${totalPages}`
      : `Page ${page} of ${totalPages}`;

  return (
    <div className="gallery-list">
      <div className="gallery-list-header">
        <div className="gallery-tabs">
          <button
            type="button"
            className={`gallery-tab-button ${filter === "all" ? "is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            {allLabel}
          </button>
          <button
            type="button"
            className={`gallery-tab-button ${filter === "favorites" ? "is-active" : ""}`}
            onClick={() => setFilter("favorites")}
          >
            {favoritesLabel}
          </button>
        </div>
        <div className="gallery-columns">
          <button
            type="button"
            className="gallery-column-button"
            onClick={() =>
              setColumns((prev) => {
                const base = prev ?? readColumns();
                return base > MIN_COLUMNS ? base - 1 : base;
              })
            }
            aria-label={locale === "ja" ? "列数を減らす" : "Decrease columns"}
          >
            -
          </button>
          <button
            type="button"
            className="gallery-column-button"
            onClick={() =>
              setColumns((prev) => {
                const base = prev ?? readColumns();
                return base < MAX_COLUMNS ? base + 1 : base;
              })
            }
            aria-label={locale === "ja" ? "列数を増やす" : "Increase columns"}
          >
            +
          </button>
        </div>
        <div className="gallery-tag-filter">
          <select
            className="gallery-tag-select"
            value={selectedTag}
            onChange={(event) => setSelectedTag(event.target.value)}
            aria-label={allTagsLabel}
          >
            <option value="all">{allTagsLabel}</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {locale === "ja" ? jaTranslate(tag) : tag}
              </option>
            ))}
          </select>
        </div>
      </div>
      {visibleItems.length === 0 ? (
        <p className="gallery-empty">{emptyLabel}</p>
      ) : (
        <>
          <section
            className={`cards-container${columns ? ` is-${columns}` : ""}`}
          >
            {pagedItems.map((gallery) => (
              <Link
                className="card"
                key={gallery.slug}
                href={`/${gallery.locale}/gallery/${gallery.slug}`}
              >
                <Image
                  src={gallery.image}
                  alt={`${gallery.title}-img`}
                  width={800}
                  height={800}
                  id={`${gallery.slug}-image`}
                  className="aspect-square object-cover object-center w-full h-auto"
                  placeholder="blur"
                  blurDataURL={rgbDataURL(192, 192, 192)}
                />
                <div className="card-title">{gallery.title}</div>
              </Link>
            ))}
          </section>
          {/* ページネーションUI（デザイン改善） */}
          {totalPages > 1 && (
            <nav
              className="gallery-pagination"
              aria-label="ページネーション"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                margin: "2rem 0 1rem 0",
              }}
            >
              <button
                type="button"
                className="gallery-pagination-arrow"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label={locale === "ja" ? "前のページ" : "Previous page"}
                style={{
                  padding: "0.5em 1em",
                  borderRadius: "999px",
                  border: "1px solid #ccc",
                  background: page === 1 ? "#f5f5f5" : "#fff",
                  color: page === 1 ? "#aaa" : "#333",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "1rem",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                ←
              </button>
              {isMobile ? (
                <label
                  className="gallery-pagination-compact"
                  aria-label={pageLabel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontWeight: 600,
                    color: "#333",
                  }}
                >
                  <select
                    value={page}
                    onChange={(event) => setPage(Number(event.target.value))}
                    style={{
                      padding: "0.35em 0.6em",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      background: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ),
                    )}
                  </select>
                  <span className="text-gray-700 dark:text-gray-300">
                    {" "}
                    / {totalPages}
                  </span>
                </label>
              ) : (
                paginationItems.map((p, index) => {
                  const key =
                    p === "ellipsis"
                      ? `ellipsis-${index}-${paginationItems.length}`
                      : `page-${p}`;

                  return p === "ellipsis" ? (
                    <span
                      key={key}
                      className="gallery-pagination-ellipsis"
                      aria-hidden="true"
                      style={{
                        padding: "0 0.4em",
                        color: "#888",
                        fontWeight: 600,
                      }}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={key}
                      type="button"
                      className={`gallery-pagination-page${p === page ? " is-active" : ""}`}
                      onClick={() => setPage(p)}
                      aria-current={p === page ? "page" : undefined}
                      style={{
                        minWidth: "2.2em",
                        padding: "0.5em 0.9em",
                        margin: "0 0.1em",
                        borderRadius: "8px",
                        border:
                          p === page ? "2px solid #0070f3" : "1px solid #ccc",
                        background: p === page ? "#e6f0fa" : "#fff",
                        color: p === page ? "#0070f3" : "#333",
                        fontWeight: p === page ? 700 : 500,
                        fontSize: "1rem",
                        boxShadow:
                          p === page
                            ? "0 2px 8px rgba(0,112,243,0.08)"
                            : "none",
                        cursor: p === page ? "default" : "pointer",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      disabled={p === page}
                    >
                      {p}
                    </button>
                  );
                })
              )}
              <button
                type="button"
                className="gallery-pagination-arrow"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label={locale === "ja" ? "次のページ" : "Next page"}
                style={{
                  padding: "0.5em 1em",
                  borderRadius: "999px",
                  border: "1px solid #ccc",
                  background: page === totalPages ? "#f5f5f5" : "#fff",
                  color: page === totalPages ? "#aaa" : "#333",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "1rem",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};
