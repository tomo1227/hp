import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminApi";
import { getGitHubConfig, githubRequest } from "@/lib/githubAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const ref = searchParams.get("ref");

  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const { owner, repo, baseBranch } = getGitHubConfig();
  const targetRef = ref ?? baseBranch;
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const response = await githubRequest(
    `/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(
      targetRef,
    )}`,
  );

  if (response.status === 404) {
    return NextResponse.json({ items: [] });
  }

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "GitHub request failed", details: errorText },
      { status: 500 },
    );
  }

  const data = (await response.json()) as
    | {
        name: string;
        path: string;
        type: "file" | "dir";
      }[]
    | { type: "file" | "dir" };

  if (!Array.isArray(data)) {
    return NextResponse.json({ items: [] });
  }

  const items = data.map((item) => ({
    name: item.name,
    path: item.path,
    type: item.type,
  }));

  return NextResponse.json({ items });
}
