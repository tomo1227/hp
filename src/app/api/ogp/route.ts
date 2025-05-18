import { JSDOM } from "jsdom";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  try {
    const ogp = await fetchOgp(url);
    return NextResponse.json(ogp, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch OGP data" },
      { status: 500 },
    );
  }
}

type OgpKey = "title" | "description" | "image" | "url";
type Ogp = {
  title: string;
  description: string;
  image: string;
  url: string;
  imageAlt?: string;
  favicon?: string;
};

export const fetchOgp = async (url: string) => {
  const ogp: Ogp = {
    title: "",
    description: "",
    image: "",
    url: "",
  };
  try {
    const dom = await JSDOM.fromURL(url);
    const host = new URL(url).host;
    ogp.favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=20`;
    const metas = dom.window.document.getElementsByTagName("meta");

    for (const v of metas) {
      const prop = v.getAttribute("property");
      if (!prop) continue;
      const key = prop.replace("og:", "");
      if (key === "image:alt") ogp.imageAlt = v.getAttribute("content") || "";
      if (!isOgpKey(key)) continue;
      ogp[key] = v.getAttribute("content") || "";
    }
    return ogp;
  } catch (e) {
    console.error(e);
  }
};

function isOgpKey(key: string): key is OgpKey {
  return (
    key === "title" ||
    key === "image" ||
    key === "description" ||
    key === "url" ||
    key === "alt"
  );
}
