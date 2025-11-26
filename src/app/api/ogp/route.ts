import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchOgp } from "@/lib/fetchOgp";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const ogp = await fetchOgp(url);
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
