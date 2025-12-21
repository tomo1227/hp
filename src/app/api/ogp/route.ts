import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchOgp } from "@/lib/fetchOgp";
import dns from "dns";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

async function normalizeAndValidateUrl(rawUrl: string): Promise<string | null> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  // Optional: Disallow explicit ports other than 80/443.
  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    return null;
  }

  const hostname = parsed.hostname;
  try {
    const lookupResult = await dns.promises.lookup(hostname, { family: 0 });
    const addr = lookupResult.address;

    // Basic checks against localhost and common private/reserved ranges.
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
      return null;
    }
  } catch {
    return null;
  }

  return parsed.toString();
}

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const safeUrl = await normalizeAndValidateUrl(url);
  if (!safeUrl) {
    return NextResponse.json({ error: "Invalid or disallowed URL" }, { status: 400 });
  }

  try {
    const ogp = await fetchOgp(safeUrl);
    if (!ogp) {
      return NextResponse.json(
        { error: "Failed to fetch OGP data" },
        { status: 500 },
      );
    }
    return NextResponse.json(ogp, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
