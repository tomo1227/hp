"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { jaTranslate } from "@/lib/translator";
import type Locale from "@/types/locale";

type CountryPanelLabels = {
  searchPlaceholder: string;
  listTitle: string;
  listHint: string;
  empty: string;
  countUnit: string;
};

type CountryPanelProps = {
  locale: Locale;
  countries: string[];
  countryCounts: Record<string, number>;
  labels: CountryPanelLabels;
};

type CountryItem = {
  name: string;
  label: string;
  count: number;
  flag?: string;
};

const countryFlagMap: Record<string, string> = {
  Japan: "🇯🇵",
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  Peru: "🇵🇪",
  Paraguay: "🇵🇾",
  Uruguay: "🇺🇾",
  France: "🇫🇷",
  Spain: "🇪🇸",
  Bolivia: "🇧🇴",
  Ecuador: "🇪🇨",
  Israel: "🇮🇱",
  Jordan: "🇯🇴",
  Taiwan: "🇹🇼",
  Germany: "🇩🇪",
  Netherlands: "🇳🇱",
  Slovenia: "🇸🇮",
  Croatia: "🇭🇷",
  Egypt: "🇪🇬",
  Vietnam: "🇻🇳",
  Thailand: "🇹🇭",
  Anguilla: "🇦🇮",
  Anguila: "🇦🇮",
  "Saint Martin": "🇲🇫",
  "Sint Maarten": "🇸🇽",
  India: "🇮🇳",
};

const getCountryFlag = (name: string) => countryFlagMap[name] ?? "";

export default function WorldCountryPanel({
  locale,
  countries,
  countryCounts,
  labels,
}: CountryPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    return countries
      .map((name) => {
        const label = locale === "ja" ? jaTranslate(name) : name;
        return {
          name,
          label,
          count: countryCounts[name] ?? 0,
          flag: getCountryFlag(name),
        } satisfies CountryItem;
      })
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.label.localeCompare(b.label);
      });
  }, [countries, countryCounts, locale]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      return (
        item.label.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term)
      );
    });
  }, [items, query]);

  return (
    <div className="world-panel">
      <div className="world-panel-header">
        <div>
          <p className="world-panel-title">{labels.listTitle}</p>
          <p className="world-panel-hint">{labels.listHint}</p>
        </div>
        <label className="world-panel-search">
          <span className="sr-only">Search</span>
          <input
            className="world-panel-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
          />
        </label>
      </div>

      {/** biome-ignore lint/a11y/useSemanticElements: 一旦対応は後回し*/}
      <div className="world-country-list" role="list">
        {filteredItems.length === 0 ? (
          <p className="world-panel-empty">{labels.empty}</p>
        ) : (
          filteredItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className="world-country-row"
              onClick={() =>
                router.push(`/${locale}/gallery/world/${item.name}`)
              }
            >
              <span className="world-country-main">
                {item.flag ? (
                  <span className="world-country-flag" aria-hidden="true">
                    {item.flag}
                  </span>
                ) : null}
                <span className="world-country-name">{item.label}</span>
              </span>
              <span className="world-country-count">
                {item.count} {labels.countUnit}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
