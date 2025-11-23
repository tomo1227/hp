"use client";

import dynamic from "next/dynamic";
import type { JSX } from "react";
import WorldMap from "react-svg-worldmap";
import { jaTranslate } from "@/lib/translator";

type WorldProps = {
  locale: "ja" | "en";
};

function WorldInner({ locale }: WorldProps): JSX.Element {
  const data = [
    { country: "mx", value: 1 },
    { country: "br", value: 1 },
    { country: "ca", value: 1 },
    { country: "cl", value: 1 },
    { country: "co", value: 1 },
    { country: "fr", value: 1 },
    { country: "jp", value: 1 },
    { country: "pe", value: 1 },
    { country: "es", value: 1 },
    { country: "th", value: 1 },
    { country: "gb", value: 1 },
    { country: "us", value: 1 },
    { country: "uy", value: 1 },
    { country: "vn", value: 1 },
    { country: "nl", value: 1 },
  ];

  return (
    <WorldMap
      data={data}
      size={800}
      color="#3b82f6"
      backgroundColor="transparent"
      borderColor="#cccccc"
      strokeOpacity={0.5}
      frame={false}
      richInteraction
      styleFunction={(ctx) => ({
        fill: ctx.countryValue ? "#3b82f6" : "var(--inactive-country-color)",
        opacity: ctx.countryValue ? 1 : 0.35,
        transition: "fill 0.2s ease, opacity 0.2s ease",
        cursor: "pointer",
        stroke: "#ffffff",
        strokeWidth: 0.5,
      })}
      hrefFunction={(ctx) =>
        ctx.countryValue
          ? `/${locale}/gallery/world/${ctx.countryName}`
          : undefined
      }
      tooltipTextFunction={(ctx) =>
        locale === "ja" ? jaTranslate(ctx.countryName) : ctx.countryName
      }
    />
  );
}

// NOTE:この部分だけ SSR 無効化
const World = dynamic(() => Promise.resolve(WorldInner), {
  ssr: false,
});

export default World;
