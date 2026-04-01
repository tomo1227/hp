import Link from "next/link";
import WorldCountryPanel from "@/components/features/worldCountryPanel";
import WorldMap from "@/components/ui/worldMap";
import { getFilteredPosts } from "@/lib/galleryFilter";
import { jaTranslate } from "@/lib/translator";

export default async function Page() {
  const japanPrefectures = new Set([
    "Hokkaido",
    "Aomori",
    "Iwate",
    "Miyagi",
    "Akita",
    "Yamagata",
    "Fukushima",
    "Ibaraki",
    "Tochigi",
    "Gunma",
    "Saitama",
    "Chiba",
    "Tokyo",
    "Kanagawa",
    "Niigata",
    "Toyama",
    "Ishikawa",
    "Fukui",
    "Yamanashi",
    "Nagano",
    "Gifu",
    "Shizuoka",
    "Aichi",
    "Mie",
    "Shiga",
    "Kyoto",
    "Osaka",
    "Hyogo",
    "Nara",
    "Wakayama",
    "Tottori",
    "Shimane",
    "Okayama",
    "Hiroshima",
    "Yamaguchi",
    "Tokushima",
    "Kagawa",
    "Ehime",
    "Kochi",
    "Fukuoka",
    "Saga",
    "Nagasaki",
    "Kumamoto",
    "Oita",
    "Miyazaki",
    "Kagoshima",
    "Okinawa",
  ]);

  const galleries = await getFilteredPosts({ locale: "ja", dateOrder: "desc" });
  const countryCounts = galleries.reduce<Record<string, number>>(
    (acc, gallery) => {
      const country = gallery.frontmatter.country;
      if (!country) return acc;
      acc[country] = (acc[country] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const countries = Object.keys(countryCounts).sort((a, b) =>
    a.localeCompare(b),
  );
  const topCountries = countries
    .map((country) => ({
      country,
      count: countryCounts[country] ?? 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const totalCountries = countries.length;
  const totalGalleries = galleries.length;
  const prefectureCounts = galleries.reduce<Record<string, number>>(
    (acc, gallery) => {
      if (gallery.frontmatter.country !== "Japan") return acc;
      const tags = gallery.frontmatter.tags ?? [];
      tags.forEach((tag) => {
        if (!japanPrefectures.has(tag)) return;
        acc[tag] = (acc[tag] ?? 0) + 1;
      });
      return acc;
    },
    {},
  );
  const topPrefectures = Object.entries(prefectureCounts)
    .map(([prefecture, count]) => ({ prefecture, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const labels = {
    title: "World Gallery",
    stats: {
      countries: "訪れた国",
      galleries: "ギャラリー",
      top: "人気の国",
      japanTop: "日本の人気エリア",
    },
    mapTitle: "世界地図",
    mapHint: "色が濃いほど投稿が多い国、都市。クリックで国別ギャラリーへ。",
    listTitle: "国別ギャラリー",
    listHint: "国名を選ぶとその国の一覧へ移動します。",
    searchPlaceholder: "国名を検索",
    empty: "該当する国がありません",
    countUnit: "件",
  };

  return (
    <div className="world-gallery-page">
      <section className="world-hero">
        <div className="world-hero-glow" aria-hidden="true" />
        <div className="world-hero-content">
          <h1 className="world-title">{labels.title}</h1>
          <div className="world-stats">
            <div className="world-stat">
              <span className="world-stat-value">{totalCountries}</span>
              <span className="world-stat-label">{labels.stats.countries}</span>
            </div>
            <div className="world-stat">
              <span className="world-stat-value">{totalGalleries}</span>
              <span className="world-stat-label">{labels.stats.galleries}</span>
            </div>
          </div>
          <div className="world-top-blocks">
            <div className="world-top">
              <p className="world-top-title">{labels.stats.top}</p>
              <div className="world-top-list">
                {topCountries.map((item) => (
                  <Link
                    key={item.country}
                    href={`/ja/gallery/world/${item.country}`}
                    className="world-top-chip"
                  >
                    <span className="world-top-name">
                      {jaTranslate(item.country)}
                    </span>
                    <span className="world-top-count">
                      {item.count}
                      {labels.countUnit}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="world-top">
              <p className="world-top-title">{labels.stats.japanTop}</p>
              <div className="world-top-list">
                {topPrefectures.map((item) => (
                  <Link
                    key={item.prefecture}
                    href={`/ja/gallery/tags/${item.prefecture}`}
                    className="world-top-chip"
                  >
                    <span className="world-top-name">
                      {jaTranslate(item.prefecture)}
                    </span>
                    <span className="world-top-count">
                      {item.count}
                      {labels.countUnit}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="world-layout">
        <div className="world-map-panel">
          <div className="world-map-header">
            <div>
              <p className="world-map-title">{labels.mapTitle}</p>
              <p className="world-map-hint">{labels.mapHint}</p>
            </div>
            <div className="world-map-legend">
              <span className="legend-dot level-1" />
              <span className="legend-label">1-2</span>
              <span className="legend-dot level-2" />
              <span className="legend-label">3-4</span>
              <span className="legend-dot level-3" />
              <span className="legend-label">5-7</span>
              <span className="legend-dot level-4" />
              <span className="legend-label">8+</span>
            </div>
          </div>
          <div className="world-map-container">
            <WorldMap
              locale="ja"
              countries={countries}
              countryCounts={countryCounts}
              prefectureCounts={prefectureCounts}
            />
          </div>
        </div>
        <WorldCountryPanel
          locale="ja"
          countries={countries}
          countryCounts={countryCounts}
          labels={{
            listTitle: labels.listTitle,
            listHint: labels.listHint,
            searchPlaceholder: labels.searchPlaceholder,
            empty: labels.empty,
            countUnit: labels.countUnit,
          }}
        />
      </section>
    </div>
  );
}
