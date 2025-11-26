"use client";

import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_japan from "@amcharts/amcharts5-geodata/japanLow";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { jaTranslate } from "@/lib/translator";
import type Locale from "@/types/locale";

type JapanMapProps = {
  locale: Locale;
};

export default function JapanMap({ locale }: JapanMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        wheelY: "zoom",
        projection: am5map.geoMercator(),
      }),
    );

    const zoomControl = am5map.ZoomControl.new(root, {});
    chart.set("zoomControl", zoomControl);
    chart.setAll({
      zoomStep: 1.2,
      minZoomLevel: 1,
      maxZoomLevel: 20,
    });

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_japan,
      }),
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
    });
    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x66aaff),
    });
    if (locale === "ja") {
      polygonSeries.mapPolygons.template.adapters.add(
        "tooltipText",
        (_, target) => {
          const dataContext = target.dataItem?.dataContext as
            | { name?: string }
            | undefined;
          const name = dataContext?.name ?? "";
          return jaTranslate(name) ?? name;
        },
      );
    }

    const enabledPrefectures = [
      "Osaka",
      "Shiga",
      "Kyoto",
      "Niigata",
      "Ibaraki",
      "Hyogo",
    ];

    // 型定義
    type PrefectureDataContext = { name?: string };

    // グレーアウト
    polygonSeries.mapPolygons.template.adapters.add("fill", (fill, target) => {
      const name = (target.dataItem?.dataContext as PrefectureDataContext)
        ?.name;
      if (!enabledPrefectures.includes(name ?? "")) {
        return am5.color(0xbfbfbf);
      }
      return fill;
    });

    // クリック無効
    polygonSeries.mapPolygons.template.adapters.add(
      "interactive",
      (_, target) => {
        const name = (target.dataItem?.dataContext as PrefectureDataContext)
          ?.name;
        return enabledPrefectures.includes(name ?? "");
      },
    );

    // ⭐クリックでページ遷移
    polygonSeries.mapPolygons.template.events.on("click", (ev) => {
      const data = ev.target.dataItem?.dataContext as { name?: string };
      if (!data?.name) return;

      const slug = encodeURIComponent(data.name);

      router.push(`/${locale}/gallery/tags/${slug}`);
    });

    return () => root.dispose();
  }, [router, locale]);

  return <div ref={chartRef} style={{ width: "100%", height: "600px" }} />;
}
