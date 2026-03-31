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

  useEffect(() => {
    setColumns(readColumns());
  }, []);

  useEffect(() => {
    writeColumns(columns);
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

  const allLabel = locale === "ja" ? "すべて" : "All";
  const favoritesLabel = "★";
  const emptyLabel =
    locale === "ja"
      ? "条件に合うギャラリーがありません。"
      : "No galleries match your filters.";
  const allTagsLabel = locale === "ja" ? "タグで絞り込み" : "Filter by tag";

  return (
    <div className="gallery-list">
      <div className="gallery-list-header">
        <div className="gallery-tabs">
          <button
            type="button"
            className={`gallery-tab-button ${
              filter === "all" ? "is-active" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            {allLabel}
          </button>
          <button
            type="button"
            className={`gallery-tab-button ${
              filter === "favorites" ? "is-active" : ""
            }`}
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
        <section
          className={`cards-container${columns ? ` is-${columns}` : ""}`}
        >
          {visibleItems.map((gallery) => (
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
      )}
    </div>
  );
};
