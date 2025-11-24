"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type JSX } from "react";
import WorldMap from "react-svg-worldmap";
import { jaTranslate } from "@/lib/translator";
import type { CountryContext, Data } from "react-svg-worldmap";

type WorldProps = {
  locale: "ja" | "en";
};

function WorldInner({ locale }: WorldProps): JSX.Element {
  const data: Data = [
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
  const [mapSize, setMapSize] = useState(900);

  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 910) {
        setMapSize(window.innerWidth - 30);
      } else {
        setMapSize(900);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);


  return (
    <WorldMap
      data={data}
      size={mapSize}
      color="#3b82f6"
      tooltipTextColor="var(--background)"
      tooltipBgColor="#ef8f00"
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

// // NOTE:この部分だけ SSR 無効化
const World = dynamic(() => Promise.resolve(WorldInner), {
  ssr: false,
});

export default World;
