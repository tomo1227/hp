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

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: "GitHub request failed", details: errorText },
      { status: response.status },
    );
  }

  const data = (await response.json()) as {
    type: "file" | "dir";
    content?: string;
    encoding?: string;
    sha?: string;
  };

  if (data.type !== "file" || !data.content || data.encoding !== "base64") {
    return NextResponse.json({ error: "Not a file" }, { status: 400 });
  }

  const decoded = Buffer.from(data.content, "base64").toString("utf8");

  return NextResponse.json({
    content: decoded,
    sha: data.sha ?? "",
  });
}
