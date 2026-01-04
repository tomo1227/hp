import { JSDOM } from "jsdom";
import dns from "dns";

type OgpKey = "title" | "description" | "image" | "url";
type Ogp = {
  title: string;
  description: string;
  image: string;
  url: string;
  imageAlt?: string;
  favicon?: string;
};

async function isUrlSafeForOgp(url: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  // Mirror the API route restrictions: only allow standard HTTP/HTTPS ports.
  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    return false;
  }

  const hostname = parsed.hostname;
  try {
    const lookupResult = await dns.promises.lookup(hostname, { family: 0 });
    const addr = lookupResult.address;

    if (
      addr === "127.0.0.1" ||
      addr === "::1" ||
      addr.startsWith("10.") ||
      addr.startsWith("192.168.") ||
      addr.startsWith("172.16.") ||
      addr.startsWith("172.17.") ||
      addr.startsWith("172.18.") ||
      addr.startsWith("172.19.") ||
      addr.startsWith("172.20.") ||
      addr.startsWith("172.21.") ||
      addr.startsWith("172.22.") ||
      addr.startsWith("172.23.") ||
      addr.startsWith("172.24.") ||
      addr.startsWith("172.25.") ||
      addr.startsWith("172.26.") ||
      addr.startsWith("172.27.") ||
      addr.startsWith("172.28.") ||
      addr.startsWith("172.29.") ||
      addr.startsWith("172.30.") ||
      addr.startsWith("172.31.") ||
      addr.startsWith("169.254.") || // link-local
      addr.startsWith("0.") || // non-routable
      addr.startsWith("127.") // loopback range
    ) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

export const fetchOgp = async (url: string): Promise<Ogp | null> => {
  const isSafe = await isUrlSafeForOgp(url);
  if (!isSafe) {
    console.error(`Rejected unsafe URL for OGP fetch: ${url}`);
    return null;
  }

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
