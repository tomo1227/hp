import { JSDOM } from "jsdom";

type OgpKey = "title" | "description" | "image" | "url";
type Ogp = {
  title: string;
  description: string;
  image: string;
  url: string;
  imageAlt?: string;
  favicon?: string;
};

export const fetchOgp = async (url: string): Promise<Ogp | null> => {
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
    ogp.url = url;
    return ogp;
  } catch (e) {
    console.error(`Failed to fetch OGP data for ${url}:`, e);
    return null;
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
